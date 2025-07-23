-- Drop the schema if it exists
DROP SCHEMA IF EXISTS public CASCADE;
-- Create the schema
CREATE SCHEMA public;
-- Set the search path to the schema
SET search_path TO public;

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

    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Separate table for all other social links
CREATE TABLE profile_links
(
    id          SERIAL PRIMARY KEY,
    profile_id  UUID REFERENCES profiles (id) ON DELETE CASCADE,
    platform_id INTEGER      REFERENCES link_platforms (id) ON DELETE SET NULL,
    url         VARCHAR(500) NOT NULL,
    category    VARCHAR(100), -- 'social', 'development', 'design', 'entertainment'
    is_public   BOOLEAN                  DEFAULT TRUE,
    sort_order  INTEGER                  DEFAULT 0,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform definitions for consistency
CREATE TABLE link_platforms
(
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) UNIQUE NOT NULL, -- 'letterboxd', 'imdb', 'etsy'
    display_name VARCHAR(255)        NOT NULL, -- 'Letterboxd', 'IMDb', 'Etsy'
    category     VARCHAR(100),                 -- 'entertainment', 'marketplace', 'social'
    icon         VARCHAR(100),                 -- icon identifier
    base_url     VARCHAR(255),                 -- 'https://letterboxd.com/'
    url_pattern  VARCHAR(255),                 -- 'https://letterboxd.com/user/{username}/'
    is_active    BOOLEAN DEFAULT TRUE
);

-- Core versioning tables
CREATE TABLE versions
(
    id                SERIAL PRIMARY KEY,
    parent_version_id INTEGER REFERENCES versions (id),
    profile_id        UUID REFERENCES profiles (id) ON DELETE CASCADE,
    name              VARCHAR(255),
    description       TEXT,
    metadata          JSONB                    DEFAULT '{}',
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE block_types
(
    id           SERIAL PRIMARY KEY,
    name         VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(255)        NOT NULL,
    description  TEXT,
    category     VARCHAR(100),
    sort_order   INTEGER                  DEFAULT 0,
    icon         VARCHAR(100),
    is_active    BOOLEAN                  DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE blocks
(
    id            SERIAL PRIMARY KEY,
    block_type_id INTEGER            NOT NULL REFERENCES block_types (id) ON DELETE RESTRICT,
    content_hash  VARCHAR(64) UNIQUE NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure hash format
    CONSTRAINT chk_content_hash_format CHECK (content_hash ~ '^[a-f0-9]{64}$')
);

-- Junction table for version-block relationships
CREATE TABLE version_blocks
(
    version_id          INTEGER REFERENCES versions (id) ON DELETE CASCADE,
    block_id            INTEGER REFERENCES blocks (id) ON DELETE CASCADE,
    previous_version_id INTEGER REFERENCES versions (id) ON DELETE SET NULL,
    previous_block_id   INTEGER REFERENCES blocks (id) ON DELETE SET NULL,
    is_visible          BOOLEAN                  DEFAULT TRUE,
    section_name        VARCHAR(255),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (version_id, block_id)
);

-- Work Experience blocks
CREATE TABLE work_experiences
(
    block_id         INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    company_name     VARCHAR(255) NOT NULL,
    company_url      VARCHAR(500),
    company_logo_url VARCHAR(500),
    company_size     VARCHAR(50),  -- '1-10', '11-50', '51-200', etc.
    company_industry VARCHAR(255),
    position_title   VARCHAR(255) NOT NULL,
    employment_type  VARCHAR(50),  -- 'full-time', 'part-time', 'contract', 'internship', 'freelance'
    location         VARCHAR(255),
    location_type    VARCHAR(50),  -- 'on-site', 'remote', 'hybrid'
    start_date       DATE         NOT NULL,
    end_date         DATE,
    is_current       BOOLEAN                  DEFAULT FALSE,
    description      TEXT,
    achievements     TEXT[],       -- array of achievement bullets
    responsibilities TEXT[],       -- array of responsibility bullets
    technologies     TEXT[],       -- technologies used
    team_size        INTEGER,
    reports_to       VARCHAR(255), -- manager title
    direct_reports   INTEGER,
    salary_currency  VARCHAR(3),
    salary_amount    DECIMAL(12, 2),
    salary_period    VARCHAR(20),  -- 'annual', 'monthly', 'hourly'
    skills_gained    TEXT[],       -- skills developed in this role
    key_projects     TEXT[],       -- major projects worked on
    recognition      TEXT[],       -- awards, recognitions received
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education blocks
CREATE TABLE education
(
    block_id             INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    institution_name     VARCHAR(255) NOT NULL,
    institution_url      VARCHAR(500),
    institution_logo_url VARCHAR(500),
    degree_type          VARCHAR(100), -- 'Bachelor', 'Master', 'PhD', 'Certificate', etc.
    degree_name          VARCHAR(255),
    field_of_study       VARCHAR(255),
    minor_fields         TEXT[],       -- array of minors/concentrations
    start_date           DATE,
    end_date             DATE,
    is_current           BOOLEAN                  DEFAULT FALSE,
    gpa                  DECIMAL(4, 3),
    gpa_scale            DECIMAL(4, 3)            DEFAULT 4.0,
    honors               TEXT[],       -- 'Magna Cum Laude', 'Dean's List', etc.
    relevant_coursework  TEXT[],
    thesis_title         VARCHAR(500),
    thesis_description   TEXT,
    advisor_name         VARCHAR(255),
    activities           TEXT[],       -- extracurricular activities
    location             VARCHAR(255),
    accreditation        VARCHAR(255),
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project blocks
CREATE TABLE projects
(
    block_id              INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    name                  VARCHAR(255) NOT NULL,
    tagline               VARCHAR(500), -- brief one-liner
    description           TEXT,
    project_type          VARCHAR(100), -- 'personal', 'professional', 'academic', 'open-source'
    status                VARCHAR(50),  -- 'completed', 'in-progress', 'on-hold', 'cancelled'
    start_date            DATE,
    end_date              DATE,
    duration_months       INTEGER,
    project_url           VARCHAR(500),
    demo_url              VARCHAR(500),
    repository_url        VARCHAR(500),
    documentation_url     VARCHAR(500),
    technologies          TEXT[],       -- tech stack used
    programming_languages TEXT[],
    frameworks            TEXT[],
    databases             TEXT[],
    cloud_platforms       TEXT[],
    tools                 TEXT[],
    team_size             INTEGER,
    role                  VARCHAR(255), -- your role in the project
    key_features          TEXT[],       -- main features implemented
    challenges_overcome   TEXT[],
    impact_metrics        TEXT[],       -- '50% performance improvement', 'reduced load time by 2s'
    awards                TEXT[],       -- any awards or recognition
    media_urls            TEXT[],       -- screenshots, videos, etc.
    collaborators         JSONB[],      -- [{name, role, profile_url}]
    budget_range          VARCHAR(100), -- '$1K-5K', '$10K+', etc.
    client_name           VARCHAR(255), -- if client work
    industry              VARCHAR(255),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills blocks
CREATE TABLE skills
(
    block_id               INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    category               VARCHAR(100) NOT NULL, -- 'technical', 'soft', 'language', 'tool'
    subcategory            VARCHAR(100),          -- 'programming', 'design', 'communication'
    name                   VARCHAR(255) NOT NULL,
    proficiency_level      VARCHAR(50),           -- 'beginner', 'intermediate', 'advanced', 'expert'
    proficiency_score      INTEGER CHECK (proficiency_score >= 1 AND proficiency_score <= 10),
    years_experience       DECIMAL(3, 1),
    months_since_last_used INTEGER,
    learning_status        VARCHAR(50),           -- 'learning', 'maintaining', 'expert', 'rusty'
    endorsements_count     INTEGER                  DEFAULT 0,
    verified_by            TEXT[],                -- who can verify this skill
    certifications         TEXT[],                -- related certifications
    projects_used_in       TEXT[],                -- projects where this skill was applied
    how_learned            VARCHAR(255),          -- 'self-taught', 'bootcamp', 'university', 'work'
    resources_used         TEXT[],                -- books, courses, etc.
    related_skills         TEXT[],                -- complementary skills
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certifications blocks
CREATE TABLE certifications
(
    block_id                      INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    name                          VARCHAR(255) NOT NULL,
    issuing_organization          VARCHAR(255) NOT NULL,
    issuing_url                   VARCHAR(500),
    credential_id                 VARCHAR(255),
    credential_url                VARCHAR(500),
    issue_date                    DATE,
    expiration_date               DATE,
    does_not_expire               BOOLEAN                  DEFAULT FALSE,
    verification_url              VARCHAR(500),
    badge_url                     VARCHAR(500),
    description                   TEXT,
    skills_covered                TEXT[],
    exam_score                    VARCHAR(100), -- 'Pass', '850/1000', '95%'
    preparation_time_hours        INTEGER,
    cost_amount                   DECIMAL(10, 2),
    cost_currency                 VARCHAR(3),
    renewal_required              BOOLEAN                  DEFAULT FALSE,
    renewal_period_months         INTEGER,
    continuing_education_required BOOLEAN                  DEFAULT FALSE,
    related_certifications        TEXT[],
    industry_recognition          VARCHAR(100), -- 'globally-recognized', 'industry-standard'
    difficulty_level              VARCHAR(50),  -- 'entry', 'intermediate', 'advanced', 'expert'
    created_at                    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publications blocks
CREATE TABLE publications
(
    block_id            INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    title               VARCHAR(500) NOT NULL,
    publication_type    VARCHAR(100), -- 'journal', 'conference', 'book', 'blog', 'whitepaper'
    publisher           VARCHAR(255),
    publication_name    VARCHAR(255), -- journal/conference name
    authors             TEXT[],       -- array of co-authors
    publication_date    DATE,
    url                 VARCHAR(500),
    doi                 VARCHAR(255), -- Digital Object Identifier
    isbn                VARCHAR(20),
    abstract            TEXT,
    keywords            TEXT[],
    pages               VARCHAR(50),  -- '123-145' or '15 pages'
    volume              VARCHAR(50),
    issue               VARCHAR(50),
    citation_count      INTEGER                  DEFAULT 0,
    peer_reviewed       BOOLEAN                  DEFAULT FALSE,
    open_access         BOOLEAN                  DEFAULT FALSE,
    language            VARCHAR(50)              DEFAULT 'English',
    research_areas      TEXT[],
    methodology         VARCHAR(255),
    funding_sources     TEXT[],
    conference_location VARCHAR(255),
    presentation_type   VARCHAR(100), -- 'oral', 'poster', 'keynote'
    awards              TEXT[],       -- 'Best Paper Award', etc.
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Awards & Honors blocks
CREATE TABLE awards
(
    block_id              INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    title                 VARCHAR(255) NOT NULL,
    awarding_organization VARCHAR(255) NOT NULL,
    award_type            VARCHAR(100), -- 'achievement', 'recognition', 'scholarship', 'competition'
    category              VARCHAR(255), -- 'academic', 'professional', 'community-service'
    date_received         DATE,
    description           TEXT,
    criteria              TEXT,         -- what the award recognizes
    selection_process     VARCHAR(255), -- 'nominated', 'competitive-application', 'peer-voted'
    recipients_count      INTEGER,      -- how many people received it
    monetary_value        DECIMAL(10, 2),
    currency              VARCHAR(3),
    url                   VARCHAR(500), -- link to award details
    certificate_url       VARCHAR(500),
    media_coverage        TEXT[],       -- news articles, etc.
    nominating_party      VARCHAR(255), -- who nominated you
    significance          VARCHAR(100), -- 'local', 'regional', 'national', 'international'
    related_work          TEXT[],       -- projects/work this recognizes
    impact_statement      TEXT,         -- how this award impacted your career
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Volunteer Experience blocks
CREATE TABLE volunteer_experiences
(
    block_id                INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    organization_name       VARCHAR(255) NOT NULL,
    organization_url        VARCHAR(500),
    organization_type       VARCHAR(100), -- 'non-profit', 'charity', 'community', 'religious'
    cause                   VARCHAR(255), -- 'education', 'environment', 'health', etc.
    role_title              VARCHAR(255),
    start_date              DATE,
    end_date                DATE,
    is_current              BOOLEAN                  DEFAULT FALSE,
    hours_per_week          DECIMAL(4, 1),
    total_hours_contributed INTEGER,
    location                VARCHAR(255),
    description             TEXT,
    achievements            TEXT[],
    skills_used             TEXT[],
    skills_gained           TEXT[],
    responsibilities        TEXT[],
    impact_metrics          TEXT[],       -- 'helped 50 families', 'raised $10K'
    team_size               INTEGER,
    leadership_role         BOOLEAN                  DEFAULT FALSE,
    projects_led            TEXT[],
    recognition             TEXT[],
    why_involved            TEXT,         -- personal motivation
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Languages blocks
CREATE TABLE languages
(
    block_id            INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    language_name       VARCHAR(100) NOT NULL,
    native_language     BOOLEAN                  DEFAULT FALSE,
    proficiency_level   VARCHAR(50),  -- 'elementary', 'limited', 'professional', 'full-professional', 'native'
    speaking_level      VARCHAR(50),
    writing_level       VARCHAR(50),
    reading_level       VARCHAR(50),
    listening_level     VARCHAR(50),
    certification_name  VARCHAR(255), -- 'TOEFL', 'IELTS', 'DELE', etc.
    certification_score VARCHAR(100),
    certification_date  DATE,
    years_studied       INTEGER,
    countries_used_in   TEXT[],       -- where you've used this language
    contexts_used       TEXT[],       -- 'business', 'academic', 'travel', 'family'
    fluency_description TEXT,
    accent              VARCHAR(100), -- 'American', 'British', 'Australian'
    dialect             VARCHAR(100),
    learning_method     VARCHAR(255), -- 'formal-education', 'self-study', 'immersion'
    currently_studying  BOOLEAN                  DEFAULT FALSE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses blocks
CREATE TABLE courses
(
    block_id                  INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    course_name               VARCHAR(255) NOT NULL,
    provider_name             VARCHAR(255) NOT NULL,
    provider_type             VARCHAR(100), -- 'university', 'online-platform', 'bootcamp', 'corporate'
    platform                  VARCHAR(100), -- 'Coursera', 'edX', 'Udemy', etc.
    course_url                VARCHAR(500),
    instructor_name           VARCHAR(255),
    completion_date           DATE,
    certificate_url           VARCHAR(500),
    certificate_id            VARCHAR(255),
    duration_hours            INTEGER,
    duration_weeks            INTEGER,
    difficulty_level          VARCHAR(50),  -- 'beginner', 'intermediate', 'advanced'
    course_type               VARCHAR(100), -- 'specialization', 'single-course', 'nanodegree'
    grade                     VARCHAR(50),  -- 'A+', '95%', 'Pass'
    skills_learned            TEXT[],
    topics_covered            TEXT[],
    projects_completed        TEXT[],
    tools_used                TEXT[],
    cost_amount               DECIMAL(10, 2),
    cost_currency             VARCHAR(3),
    scholarship_received      BOOLEAN                  DEFAULT FALSE,
    peer_reviewed_assignments BOOLEAN                  DEFAULT FALSE,
    final_project_description TEXT,
    why_taken                 TEXT,         -- motivation for taking the course
    key_takeaways             TEXT[],
    created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations & Memberships blocks
CREATE TABLE organizations
(
    block_id          INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    organization_type VARCHAR(100), -- 'professional', 'academic', 'industry', 'alumni'
    organization_url  VARCHAR(500),
    membership_type   VARCHAR(100), -- 'member', 'board-member', 'officer', 'founder'
    position_title    VARCHAR(255),
    start_date        DATE,
    end_date          DATE,
    is_current        BOOLEAN                  DEFAULT TRUE,
    membership_level  VARCHAR(100), -- 'standard', 'premium', 'lifetime', 'honorary'
    membership_id     VARCHAR(255),
    annual_dues       DECIMAL(10, 2),
    currency          VARCHAR(3),
    benefits          TEXT[],       -- what membership provides
    contributions     TEXT[],       -- your contributions to the org
    committees        TEXT[],       -- committees you're part of
    events_organized  TEXT[],
    events_attended   TEXT[],
    networking_value  TEXT,         -- how it's helped professionally
    skills_gained     TEXT[],
    recognition       TEXT[],       -- any recognition within the org
    why_joined        TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test Scores blocks
CREATE TABLE test_scores
(
    block_id               INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    test_name              VARCHAR(255) NOT NULL,
    test_type              VARCHAR(100), -- 'standardized', 'professional', 'language', 'academic'
    testing_organization   VARCHAR(255),
    test_date              DATE,
    score                  VARCHAR(100), -- flexible to handle different scoring systems
    percentile             INTEGER CHECK (percentile >= 1 AND percentile <= 100),
    max_possible_score     VARCHAR(100),
    subject_scores         JSONB,        -- {math: 780, verbal: 720, writing: 6.0}
    attempts_number        INTEGER                  DEFAULT 1,
    preparation_time_hours INTEGER,
    preparation_methods    TEXT[],       -- 'self-study', 'prep-course', 'tutor'
    prep_materials         TEXT[],       -- books, courses used
    score_validity_period  VARCHAR(100), -- 'valid until 2025'
    retake_planned         BOOLEAN                  DEFAULT FALSE,
    target_score           VARCHAR(100),
    schools_sent_to        TEXT[],       -- for academic tests
    purpose                VARCHAR(255), -- why you took the test
    performance_analysis   TEXT,         -- strengths/weaknesses
    created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Speaking Engagements blocks
CREATE TABLE speaking_engagements
(
    block_id                INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    event_name              VARCHAR(255) NOT NULL,
    event_type              VARCHAR(100),  -- 'conference', 'meetup', 'webinar', 'podcast', 'workshop'
    event_url               VARCHAR(500),
    organizer_name          VARCHAR(255),
    presentation_title      VARCHAR(500),
    presentation_type       VARCHAR(100),  -- 'keynote', 'panel', 'lightning-talk', 'workshop'
    date                    DATE,
    location                VARCHAR(255),
    venue                   VARCHAR(255),
    audience_size           INTEGER,
    audience_type           VARCHAR(255),  -- 'developers', 'executives', 'students'
    duration_minutes        INTEGER,
    topics_covered          TEXT[],
    abstract                TEXT,
    slides_url              VARCHAR(500),
    recording_url           VARCHAR(500),
    slides_download_url     VARCHAR(500),
    feedback_score          DECIMAL(3, 2), -- average rating from attendees
    feedback_comments       TEXT[],
    languages_presented     TEXT[],
    co_speakers             TEXT[],
    compensation_amount     DECIMAL(10, 2),
    compensation_currency   VARCHAR(3),
    travel_covered          BOOLEAN                  DEFAULT FALSE,
    media_coverage          TEXT[],        -- articles about your talk
    social_mentions         TEXT[],        -- Twitter threads, LinkedIn posts
    follow_up_opportunities TEXT[],
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- References blocks
CREATE TABLE referrers
(
    block_id                INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    reference_type          VARCHAR(100), -- 'professional', 'academic', 'personal', 'character'
    name                    VARCHAR(255) NOT NULL,
    title                   VARCHAR(255),
    company                 VARCHAR(255),
    relationship            VARCHAR(255), -- 'manager', 'colleague', 'professor', 'client'
    relationship_duration   VARCHAR(100), -- 'worked together 2 years'
    email                   VARCHAR(255),
    phone                   VARCHAR(50),
    linkedin_url            VARCHAR(500),
    years_known             INTEGER,
    permission_granted      BOOLEAN                  DEFAULT FALSE,
    permission_date         DATE,
    last_contacted          DATE,
    recommendation_provided BOOLEAN                  DEFAULT FALSE,
    recommendation_text     TEXT,
    recommendation_url      VARCHAR(500), -- LinkedIn recommendation link
    strengths_highlighted   TEXT[],       -- what they highlight about you
    projects_collaborated   TEXT[],       -- specific work done together
    availability            VARCHAR(255), -- 'available immediately', 'prefer email contact'
    notes                   TEXT,         -- private notes about this reference
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal Information blocks
CREATE TABLE personal_info
(
    block_id                INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    summary                 TEXT,         -- professional summary
    headline                VARCHAR(500), -- LinkedIn-style headline
    location                VARCHAR(255),
    willing_to_relocate     BOOLEAN                  DEFAULT FALSE,
    preferred_locations     TEXT[],
    website_url             VARCHAR(500),
    portfolio_url           VARCHAR(500),
    blog_url                VARCHAR(500),
    github_url              VARCHAR(500),
    linkedin_url            VARCHAR(500),
    twitter_url             VARCHAR(500),
    stackoverflow_url       VARCHAR(500),
    behance_url             VARCHAR(500),
    dribbble_url            VARCHAR(500),
    medium_url              VARCHAR(500),
    youtube_url             VARCHAR(500),
    other_profiles          JSONB,        -- flexible for other social profiles
    availability            VARCHAR(100), -- 'immediately', '2-weeks-notice', 'not-available'
    work_authorization      VARCHAR(255), -- visa status, work permits
    security_clearance      VARCHAR(255),
    preferred_work_type     VARCHAR(100), -- 'remote', 'hybrid', 'on-site', 'flexible'
    salary_expectation_min  DECIMAL(12, 2),
    salary_expectation_max  DECIMAL(12, 2),
    salary_currency         VARCHAR(3),
    benefits_important      TEXT[],       -- health, equity, flexible hours
    company_size_preference VARCHAR(100), -- 'startup', 'mid-size', 'enterprise'
    industry_preferences    TEXT[],
    values                  TEXT[],       -- work values, company culture preferences
    career_goals            TEXT,
    interests               TEXT[],       -- professional interests
    hobbies                 TEXT[],       -- personal hobbies
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patents blocks
CREATE TABLE patents
(
    block_id           INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    title              VARCHAR(500) NOT NULL,
    patent_number      VARCHAR(255),
    patent_type        VARCHAR(100), -- 'utility', 'design', 'plant', 'provisional'
    status             VARCHAR(100), -- 'pending', 'approved', 'expired', 'abandoned'
    filing_date        DATE,
    publication_date   DATE,
    grant_date         DATE,
    expiration_date    DATE,
    patent_office      VARCHAR(255), -- 'USPTO', 'EPO', etc.
    inventors          TEXT[],       -- co-inventors
    assignee           VARCHAR(255), -- company that owns the patent
    abstract           TEXT,
    description        TEXT,
    claims             TEXT[],
    field_of_invention VARCHAR(255),
    background         TEXT,
    technical_problem  TEXT,
    solution_summary   TEXT,
    applications       TEXT[],       -- practical applications
    prior_art          TEXT[],       -- related patents/publications
    citations_count    INTEGER                  DEFAULT 0,
    licensing_status   VARCHAR(100), -- 'available', 'licensed', 'proprietary'
    commercial_value   VARCHAR(255),
    related_products   TEXT[],
    patent_url         VARCHAR(500),
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Research Experience blocks
CREATE TABLE research_experiences
(
    block_id         INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    research_title   VARCHAR(500) NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    department       VARCHAR(255),
    supervisor_name  VARCHAR(255),
    supervisor_title VARCHAR(255),
    research_type    VARCHAR(100), -- 'academic', 'industrial', 'government', 'independent'
    position_title   VARCHAR(255), -- 'Research Assistant', 'PhD Candidate', 'Postdoc'
    start_date       DATE,
    end_date         DATE,
    is_current       BOOLEAN                  DEFAULT FALSE,
    funding_source   VARCHAR(255),
    grant_amount     DECIMAL(12, 2),
    grant_currency   VARCHAR(3),
    research_areas   TEXT[],
    keywords         TEXT[],
    methodology      TEXT[],
    tools_used       TEXT[],
    software_used    TEXT[],
    equipment_used   TEXT[],
    abstract         TEXT,
    objectives       TEXT[],
    key_findings     TEXT[],
    publications     TEXT[],       -- related publications
    presentations    TEXT[],       -- conference presentations
    collaborators    TEXT[],
    skills_gained    TEXT[],
    impact_statement TEXT,
    future_work      TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Military Service blocks
CREATE TABLE military_service
(
    block_id              INTEGER PRIMARY KEY REFERENCES blocks (id) ON DELETE CASCADE,
    branch                VARCHAR(255) NOT NULL, -- 'Army', 'Navy', 'Air Force', etc.
    rank                  VARCHAR(255),
    service_number        VARCHAR(255),
    start_date            DATE,
    end_date              DATE,
    discharge_type        VARCHAR(100),          -- 'honorable', 'general', 'other-than-honorable'
    service_type          VARCHAR(100),          -- 'active-duty', 'reserves', 'national-guard'
    specialty_code        VARCHAR(100),          -- MOS, rating, AFSC
    specialty_description VARCHAR(255),
    units_served          TEXT[],
    deployments           TEXT[],                -- locations and dates
    combat_deployments    TEXT[],
    training_completed    TEXT[],
    certifications_earned TEXT[],
    awards_received       TEXT[],
    leadership_positions  TEXT[],
    security_clearance    VARCHAR(255),
    clearance_level       VARCHAR(100),          -- 'confidential', 'secret', 'top-secret'
    languages_learned     TEXT[],
    skills_gained         TEXT[],
    responsibilities      TEXT[],
    notable_operations    TEXT[],
    transition_assistance BOOLEAN                  DEFAULT FALSE,
    gi_bill_benefits      VARCHAR(255),
    created_at            TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_version_blocks_version_id ON version_blocks (version_id);
CREATE INDEX idx_version_blocks_block_id ON version_blocks (block_id);
CREATE INDEX idx_blocks_type_id ON blocks (block_type_id);
CREATE INDEX idx_blocks_content_hash ON blocks (content_hash);
CREATE INDEX idx_versions_parent ON versions (parent_version_id);
CREATE INDEX idx_versions_created_at ON versions (created_at);
CREATE INDEX idx_versions_profile_id ON versions (profile_id);
CREATE INDEX idx_profiles_username ON profiles (username);

-- Insert block types
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