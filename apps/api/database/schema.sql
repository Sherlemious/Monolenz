-- Drop the schema if it exists
DROP SCHEMA IF EXISTS public CASCADE;
-- Create the schema
CREATE SCHEMA public;
-- Set the search path to the schema
SET search_path TO public;

-- Create reusable updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Core profile table (mutable)
CREATE TABLE profiles
(
    id                  UUID REFERENCES auth.users (id) PRIMARY KEY,
    username            VARCHAR(50) UNIQUE NOT NULL,
    bio                 TEXT,
    profile_picture_url VARCHAR(500),

    -- Only core professional URLs
    linkedin_url        VARCHAR(500),
    github_url          VARCHAR(500),
    portfolio_url       VARCHAR(500),

    created_at          timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at          timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE
    ON profiles
    FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Platform definitions for profile links
CREATE TABLE link_platforms
(
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255)        NOT NULL,
    category     VARCHAR(100),
    icon         VARCHAR(100),
    base_url     VARCHAR(255),
    url_pattern  VARCHAR(255),
    is_active    BOOLEAN     DEFAULT TRUE,
    created_at   timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at   timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_link_platforms
    BEFORE UPDATE
    ON link_platforms
    FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Profile links (mutable)
CREATE TABLE profile_links
(
    id          SERIAL PRIMARY KEY,
    profile_id  UUID REFERENCES profiles (id) ON DELETE CASCADE,
    platform_id INTEGER      REFERENCES link_platforms (id) ON DELETE SET NULL,
    url         VARCHAR(500) NOT NULL,
    category    VARCHAR(100),
    is_public   BOOLEAN     DEFAULT TRUE,
    sort_order  INTEGER     DEFAULT 0,
    created_at  timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_profile_links
    BEFORE UPDATE
    ON profile_links
    FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Block type definitions (mutable - for adding new types)
CREATE TABLE block_types
(
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(100) UNIQUE NOT NULL,
    display_name   VARCHAR(255)        NOT NULL,
    description    TEXT,
    category       VARCHAR(100),
    sort_order     INTEGER     DEFAULT 0,
    icon           VARCHAR(100),
    is_active      BOOLEAN     DEFAULT TRUE,
    schema_version INTEGER     DEFAULT 1,
    created_at     timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at     timestamptz DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp_block_types
    BEFORE UPDATE
    ON block_types
    FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Property definitions for block types (mutable - for adding new properties)
CREATE TABLE block_properties
(
    id               SERIAL PRIMARY KEY,
    block_type_id    INTEGER REFERENCES block_types (id) ON DELETE CASCADE,
    property_name    VARCHAR(100) NOT NULL,
    property_type    VARCHAR(50)  NOT NULL,    -- 'string', 'text', 'integer', 'decimal', 'date', 'boolean', 'array', 'object'
    display_name     VARCHAR(255) NOT NULL,
    description      TEXT,
    is_required      BOOLEAN     DEFAULT FALSE,
    is_searchable    BOOLEAN     DEFAULT TRUE,
    validation_rules JSONB       DEFAULT '{}', -- JSON schema for validation
    default_value    JSONB,
    sort_order       INTEGER     DEFAULT 0,
    group_name       VARCHAR(100),             -- for organizing properties in UI
    placeholder_text VARCHAR(255),
    help_text        TEXT,
    is_active        BOOLEAN     DEFAULT TRUE,
    created_at       timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at       timestamptz DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (block_type_id, property_name)
);

CREATE TRIGGER set_timestamp_block_properties
    BEFORE UPDATE
    ON block_properties
    FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Core versioning tables (immutable)
CREATE TABLE versions
(
    id                SERIAL PRIMARY KEY,
    parent_version_id INTEGER REFERENCES versions (id),
    profile_id        UUID REFERENCES profiles (id) ON DELETE CASCADE,
    name              VARCHAR(255),
    description       TEXT,
    metadata          JSONB       DEFAULT '{}',
    created_at        timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Generic blocks table (immutable)
CREATE TABLE blocks
(
    id            SERIAL PRIMARY KEY,
    block_type_id INTEGER            NOT NULL REFERENCES block_types (id) ON DELETE RESTRICT,
    data          JSONB              NOT NULL DEFAULT '{}', -- All block properties stored as JSON
    content_hash  VARCHAR(64) UNIQUE NOT NULL,              -- Hash of the data for deduplication
    created_at    timestamptz                 DEFAULT CURRENT_TIMESTAMP,

    -- Ensure hash format
    CONSTRAINT chk_content_hash_format CHECK (content_hash ~ '^[a-f0-9]{64}$')
);

-- Junction table for version-block relationships (immutable)
CREATE TABLE version_blocks
(
    version_id          INTEGER REFERENCES versions (id) ON DELETE CASCADE,
    block_id            INTEGER REFERENCES blocks (id) ON DELETE CASCADE,
    previous_version_id INTEGER REFERENCES versions (id) ON DELETE SET NULL,
    previous_block_id   INTEGER REFERENCES blocks (id) ON DELETE SET NULL,
    is_visible          BOOLEAN     DEFAULT TRUE,
    section_name        VARCHAR(255),
    sort_order          INTEGER     DEFAULT 0,
    created_at          timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (version_id, block_id)
);

-- Junction table for a block and its properties and their respective values
CREATE
    TABLE block_property_values
(
    block_id    INTEGER REFERENCES blocks (id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES block_properties (id) ON DELETE CASCADE,
    value       JSONB NOT NULL,           -- Store the value as JSON for flexibility
    is_active   BOOLEAN     DEFAULT TRUE, -- Whether this property value is currently active
    is_public   BOOLEAN     DEFAULT TRUE, -- Whether this property value is public
    created_at  timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at  timestamptz DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (block_id, property_id)
);


-- Create essential indexes for performance
CREATE INDEX idx_version_blocks_version_id ON version_blocks (version_id);
CREATE INDEX idx_version_blocks_block_id ON version_blocks (block_id);
CREATE INDEX idx_blocks_type_id ON blocks (block_type_id);
CREATE INDEX idx_blocks_content_hash ON blocks (content_hash);
CREATE INDEX idx_blocks_data_gin ON blocks USING GIN (data); -- For JSON queries
CREATE INDEX idx_versions_parent ON versions (parent_version_id);
CREATE INDEX idx_versions_created_at ON versions (created_at);
CREATE INDEX idx_versions_profile_id ON versions (profile_id);
CREATE INDEX idx_profiles_username ON profiles (username);

-- Profile link indexes
CREATE INDEX idx_profile_links_profile_public ON profile_links (profile_id, is_public);
CREATE INDEX idx_profile_links_category ON profile_links (category, is_public);

-- Version traversal indexes
CREATE INDEX idx_versions_profile_created ON versions (profile_id, created_at DESC);

-- Block properties indexes
CREATE INDEX idx_block_properties_type_active ON block_properties (block_type_id, is_active);
CREATE INDEX idx_block_properties_type_name ON block_properties (block_type_id, property_name);

-- Version blocks ordering
CREATE INDEX idx_version_blocks_section_order ON version_blocks (version_id, section_name, sort_order);

-- Insert core block types
INSERT INTO block_types (name, display_name, description, category, sort_order)
VALUES ('work_experience', 'Work Experience', 'Professional work history and employment', 'experience', 1),
       ('education', 'Education', 'Academic background and degrees', 'education', 2),
       ('project', 'Projects', 'Personal and professional projects', 'experience', 3),
       ('skill', 'Skills', 'Technical and soft skills', 'skills', 4),
       ('certification', 'Certifications', 'Professional certifications and licenses', 'credentials', 5),
       ('publication', 'Publications', 'Research papers, articles, and publications', 'research', 6),
       ('award', 'Awards & Honors', 'Recognition and achievements', 'achievements', 7),
       ('volunteer', 'Volunteer Experience', 'Community service and volunteer work', 'experience', 8),
       ('language', 'Languages', 'Language proficiencies', 'skills', 9),
       ('course', 'Courses', 'Additional courses and training', 'education', 10),
       ('organization', 'Organizations', 'Professional memberships and affiliations', 'networking', 11),
       ('test_score', 'Test Scores', 'Standardized test results', 'credentials', 12),
       ('speaking', 'Speaking Engagements', 'Conference talks and presentations', 'achievements', 13),
       ('reference', 'References', 'Professional references', 'personal', 14),
       ('personal_info', 'Personal Information', 'Contact info and professional summary', 'personal', 15),
       ('patent', 'Patents', 'Intellectual property and patents', 'research', 16),
       ('research', 'Research Experience', 'Academic and industrial research', 'research', 17),
       ('military', 'Military Service', 'Military background and service', 'experience', 18);

-- Example: Insert properties for work_experience block type
INSERT INTO block_properties (block_type_id, property_name, property_type, display_name, description, is_required,
                              validation_rules, group_name, sort_order)
SELECT bt.id,
       props.property_name,
       props.property_type,
       props.display_name,
       props.description,
       props.is_required,
       props.validation_rules::jsonb,
       props.group_name,
       props.sort_order
FROM block_types bt,
     (VALUES ('company_name', 'string', 'Company Name', 'Name of the company or organization', true,
              '{"maxLength": 255}', 'basic', 1),
             ('company_url', 'string', 'Company Website', 'Company website URL', false,
              '{"format": "uri", "maxLength": 500}', 'basic', 2),
             ('company_logo_url', 'string', 'Company Logo', 'URL to company logo image', false,
              '{"format": "uri", "maxLength": 500}', 'basic', 3),
             ('position_title', 'string', 'Position Title', 'Job title or position held', true, '{"maxLength": 255}',
              'basic', 4),
             ('employment_type', 'string', 'Employment Type', 'Type of employment', false,
              '{"enum": ["full-time", "part-time", "contract", "internship", "freelance"]}', 'basic', 5),
             ('location', 'string', 'Location', 'Work location', false, '{"maxLength": 255}', 'basic', 6),
             ('location_type', 'string', 'Location Type', 'Type of work arrangement', false,
              '{"enum": ["on-site", "remote", "hybrid"]}', 'basic', 7),
             ('start_date', 'date', 'Start Date', 'Employment start date', true, '{}', 'dates', 8),
             ('end_date', 'date', 'End Date', 'Employment end date', false, '{}', 'dates', 9),
             ('is_current', 'boolean', 'Current Position', 'Is this your current position?', false, '{}', 'dates', 10),
             ('description', 'text', 'Description', 'Job description and overview', false, '{}', 'details', 11),
             ('achievements', 'array', 'Achievements', 'Key achievements in this role', false,
              '{"items": {"type": "string"}}', 'details', 12),
             ('responsibilities', 'array', 'Responsibilities', 'Main responsibilities', false,
              '{"items": {"type": "string"}}', 'details', 13),
             ('technologies', 'array', 'Technologies', 'Technologies and tools used', false,
              '{"items": {"type": "string"}}', 'skills', 14),
             ('company_size', 'string', 'Company Size', 'Size of the company', false,
              '{"enum": ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"]}', 'company', 15),
             ('company_industry', 'string', 'Industry', 'Company industry', false, '{"maxLength": 255}', 'company', 16),
             ('team_size', 'integer', 'Team Size', 'Size of your team', false, '{"minimum": 1}', 'team', 17),
             ('reports_to', 'string', 'Reports To', 'Manager or supervisor title', false, '{"maxLength": 255}', 'team',
              18),
             ('direct_reports', 'integer', 'Direct Reports', 'Number of direct reports', false, '{"minimum": 0}',
              'team', 19)) AS props(property_name, property_type, display_name, description, is_required,
                                    validation_rules, group_name, sort_order)
WHERE bt.name = 'work_experience';

-- Example: Insert properties for education block type
INSERT INTO block_properties (block_type_id, property_name, property_type, display_name, description, is_required,
                              validation_rules, group_name, sort_order)
SELECT bt.id,
       props.property_name,
       props.property_type,
       props.display_name,
       props.description,
       props.is_required,
       props.validation_rules::jsonb,
       props.group_name,
       props.sort_order
FROM block_types bt,
     (VALUES ('institution_name', 'string', 'Institution Name', 'Name of educational institution', true,
              '{"maxLength": 255}', 'basic', 1),
             ('institution_url', 'string', 'Institution Website', 'Institution website URL', false,
              '{"format": "uri", "maxLength": 500}', 'basic', 2),
             ('degree_type', 'string', 'Degree Type', 'Type of degree or certification', false,
              '{"enum": ["Bachelor", "Master", "PhD", "Associate", "Certificate", "Diploma"]}', 'degree', 3),
             ('degree_name', 'string', 'Degree Name', 'Full name of the degree', false, '{"maxLength": 255}', 'degree',
              4),
             ('field_of_study', 'string', 'Field of Study', 'Major field of study', false, '{"maxLength": 255}',
              'degree', 5),
             ('minor_fields', 'array', 'Minor Fields', 'Minor fields or concentrations', false,
              '{"items": {"type": "string"}}', 'degree', 6),
             ('start_date', 'date', 'Start Date', 'Education start date', false, '{}', 'dates', 7),
             ('end_date', 'date', 'End Date', 'Education end date', false, '{}', 'dates', 8),
             ('is_current', 'boolean', 'Currently Enrolled', 'Currently enrolled in this program?', false, '{}',
              'dates', 9),
             ('gpa', 'decimal', 'GPA', 'Grade point average', false, '{"minimum": 0, "maximum": 4.0}', 'performance',
              10),
             ('gpa_scale', 'decimal', 'GPA Scale', 'GPA scale (e.g., 4.0)', false, '{"minimum": 1, "maximum": 10}',
              'performance', 11),
             ('honors', 'array', 'Honors', 'Academic honors received', false, '{"items": {"type": "string"}}',
              'performance', 12),
             ('relevant_coursework', 'array', 'Relevant Coursework', 'Relevant courses taken', false,
              '{"items": {"type": "string"}}', 'details', 13),
             ('activities', 'array', 'Activities', 'Extracurricular activities', false, '{"items": {"type": "string"}}',
              'details', 14),
             ('location', 'string', 'Location', 'Institution location', false, '{"maxLength": 255}', 'basic',
              15)) AS props(property_name, property_type, display_name, description, is_required, validation_rules,
                            group_name, sort_order)
WHERE bt.name = 'education';

-- Example: Insert properties for skills block type
INSERT INTO block_properties (block_type_id, property_name, property_type, display_name, description, is_required,
                              validation_rules, group_name, sort_order)
SELECT bt.id,
       props.property_name,
       props.property_type,
       props.display_name,
       props.description,
       props.is_required,
       props.validation_rules::jsonb,
       props.group_name,
       props.sort_order
FROM block_types bt,
     (VALUES ('name', 'string', 'Skill Name', 'Name of the skill', true, '{"maxLength": 255}', 'basic', 1),
             ('category', 'string', 'Category', 'Skill category', true,
              '{"enum": ["technical", "soft", "language", "tool", "framework", "platform"]}', 'basic', 2),
             ('subcategory', 'string', 'Subcategory', 'Skill subcategory', false, '{"maxLength": 100}', 'basic', 3),
             ('proficiency_level', 'string', 'Proficiency Level', 'Level of expertise', false,
              '{"enum": ["beginner", "intermediate", "advanced", "expert"]}', 'proficiency', 4),
             ('proficiency_score', 'integer', 'Proficiency Score', 'Numeric proficiency score (1-10)', false,
              '{"minimum": 1, "maximum": 10}', 'proficiency', 5),
             ('years_experience', 'decimal', 'Years of Experience', 'Years of experience with this skill', false,
              '{"minimum": 0, "maximum": 50}', 'experience', 6),
             ('months_since_last_used', 'integer', 'Months Since Last Used', 'How recently was this skill used', false,
              '{"minimum": 0}', 'experience', 7),
             ('learning_status', 'string', 'Learning Status', 'Current status with this skill', false,
              '{"enum": ["learning", "maintaining", "expert", "rusty"]}', 'status', 8),
             ('certifications', 'array', 'Certifications', 'Related certifications', false,
              '{"items": {"type": "string"}}', 'validation', 9),
             ('projects_used_in', 'array', 'Projects Used In', 'Projects where this skill was applied', false,
              '{"items": {"type": "string"}}', 'validation', 10),
             ('how_learned', 'string', 'How Learned', 'Method of learning this skill', false,
              '{"enum": ["self-taught", "bootcamp", "university", "work", "online-course", "mentor"]}', 'learning',
              11)) AS props(property_name, property_type, display_name, description, is_required, validation_rules,
                            group_name, sort_order)
WHERE bt.name = 'skill';

-- Create a view for easier querying of block data with type information
CREATE VIEW block_details AS
SELECT b.id,
       b.block_type_id,
       bt.name         as block_type_name,
       bt.display_name as block_type_display_name,
       bt.category     as block_type_category,
       b.data,
       b.content_hash,
       b.created_at
FROM blocks b
         JOIN block_types bt ON b.block_type_id = bt.id
WHERE bt.is_active = true;

-- Create a view for version blocks with full context
CREATE VIEW version_block_details AS
SELECT vb.version_id,
       vb.block_id,
       vb.section_name,
       vb.sort_order,
       vb.is_visible,
       bd.block_type_name,
       bd.block_type_display_name,
       bd.block_type_category,
       bd.data,
       bd.created_at as block_created_at,
       vb.created_at as added_to_version_at
FROM version_blocks vb
         JOIN block_details bd ON vb.block_id = bd.id
WHERE vb.is_visible = true
ORDER BY vb.sort_order, bd.created_at;

-- Helper function to validate block data against its type's properties
CREATE OR REPLACE FUNCTION validate_block_data(
    p_block_type_id INTEGER,
    p_data JSONB
) RETURNS BOOLEAN AS
$$
DECLARE
    prop     RECORD;
    value    JSONB;
    is_valid BOOLEAN := TRUE;
BEGIN
    -- Check all required properties
    FOR prop IN
        SELECT property_name, is_required, property_type, validation_rules
        FROM block_properties
        WHERE block_type_id = p_block_type_id
          AND is_active = TRUE
        LOOP
            value := p_data -> prop.property_name;

            -- Check required fields
            IF prop.is_required AND (value IS NULL OR value = 'null'::jsonb) THEN
                RAISE NOTICE 'Required property missing: %', prop.property_name;
                is_valid := FALSE;
            END IF;

            -- Additional validation logic can be added here based on property_type and validation_rules

        END LOOP;

    RETURN is_valid;
END;
$$ LANGUAGE plpgsql;