-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email_verified_at" TIMESTAMPTZ(6),
    "role" VARCHAR(50) NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" VARCHAR(32) NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocks" (
    "id" SERIAL NOT NULL,
    "block_type" VARCHAR(50) NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "bio" TEXT,
    "profile_picture_url" VARCHAR(500),
    "linkedin_url" VARCHAR(500),
    "github_url" VARCHAR(500),
    "portfolio_url" VARCHAR(500),
    "theme" VARCHAR(50) DEFAULT 'default',
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_platforms" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "icon" VARCHAR(100),
    "base_url" VARCHAR(255),
    "url_pattern" VARCHAR(255),
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_links" (
    "id" SERIAL NOT NULL,
    "profile_id" UUID NOT NULL,
    "platform_id" INTEGER,
    "url" VARCHAR(500) NOT NULL,
    "label" VARCHAR(100),
    "category" VARCHAR(100),
    "is_public" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version_blocks" (
    "version_id" INTEGER NOT NULL,
    "block_id" INTEGER NOT NULL,
    "previous_block_id" INTEGER,
    "is_visible" BOOLEAN DEFAULT true,
    "section_name" VARCHAR(255),
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "previous_version_id" INTEGER,

    CONSTRAINT "version_blocks_pkey" PRIMARY KEY ("version_id","block_id")
);

-- CreateTable
CREATE TABLE "versions" (
    "id" SERIAL NOT NULL,
    "profile_id" UUID,
    "parent_version_id" INTEGER,
    "name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB DEFAULT '{}',

    CONSTRAINT "versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "block_awards" (
    "block_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255),
    "date_received" DATE,
    "description" TEXT,
    "url" VARCHAR(500),

    CONSTRAINT "block_awards_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_certifications" (
    "block_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuing_organization" VARCHAR(255) NOT NULL,
    "organization_url" VARCHAR(500),
    "credential_id" VARCHAR(255),
    "credential_url" VARCHAR(500),
    "issue_date" DATE,
    "expiration_date" DATE,
    "does_not_expire" BOOLEAN DEFAULT false,

    CONSTRAINT "block_certifications_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_educations" (
    "block_id" INTEGER NOT NULL,
    "institution_name" VARCHAR(255) NOT NULL,
    "institution_url" VARCHAR(500),
    "degree_type" VARCHAR(50),
    "degree_name" VARCHAR(255),
    "field_of_study" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN DEFAULT false,
    "gpa" DECIMAL(3,2),
    "gpa_scale" DECIMAL(3,1) DEFAULT 4.0,
    "honors" TEXT[],
    "relevant_coursework" TEXT[],
    "location" VARCHAR(255),

    CONSTRAINT "block_educations_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_languages" (
    "block_id" INTEGER NOT NULL,
    "language" VARCHAR(100) NOT NULL,
    "proficiency" VARCHAR(50) NOT NULL,

    CONSTRAINT "block_languages_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_projects" (
    "block_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "url" VARCHAR(500),
    "repository_url" VARCHAR(500),
    "image_url" VARCHAR(500),
    "start_date" DATE,
    "end_date" DATE,
    "is_ongoing" BOOLEAN DEFAULT false,
    "technologies" TEXT[],
    "highlights" TEXT[],

    CONSTRAINT "block_projects_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_skills" (
    "block_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "proficiency_level" VARCHAR(50),
    "years_experience" DECIMAL(4,1),

    CONSTRAINT "block_skills_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_volunteers" (
    "block_id" INTEGER NOT NULL,
    "organization_name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "cause" VARCHAR(255),
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN DEFAULT false,
    "description" TEXT,
    "highlights" TEXT[],

    CONSTRAINT "block_volunteers_pkey" PRIMARY KEY ("block_id")
);

-- CreateTable
CREATE TABLE "block_work_experiences" (
    "block_id" INTEGER NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "company_url" VARCHAR(500),
    "company_logo_url" VARCHAR(500),
    "position_title" VARCHAR(255) NOT NULL,
    "employment_type" VARCHAR(50),
    "location" VARCHAR(255),
    "location_type" VARCHAR(50),
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "is_current" BOOLEAN DEFAULT false,
    "description" TEXT,
    "achievements" TEXT[],
    "technologies" TEXT[],

    CONSTRAINT "block_work_experiences_pkey" PRIMARY KEY ("block_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_hash_key" ON "auth_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "auth_tokens_user_id_type_idx" ON "auth_tokens"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "blocks_content_hash_key" ON "blocks"("content_hash");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_username_key" ON "profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "link_platforms_name_key" ON "link_platforms"("name");

-- CreateIndex
CREATE INDEX "idx_profile_links_profile_public" ON "profile_links"("profile_id", "is_public");

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "link_platforms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_blocks" ADD CONSTRAINT "version_blocks_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_blocks" ADD CONSTRAINT "version_blocks_previous_block_id_fkey" FOREIGN KEY ("previous_block_id") REFERENCES "blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_blocks" ADD CONSTRAINT "version_blocks_previous_version_id_fkey" FOREIGN KEY ("previous_version_id") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_blocks" ADD CONSTRAINT "version_blocks_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versions" ADD CONSTRAINT "versions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_awards" ADD CONSTRAINT "block_awards_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_certifications" ADD CONSTRAINT "block_certifications_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_educations" ADD CONSTRAINT "block_educations_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_languages" ADD CONSTRAINT "block_languages_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_projects" ADD CONSTRAINT "block_projects_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_skills" ADD CONSTRAINT "block_skills_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_volunteers" ADD CONSTRAINT "block_volunteers_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block_work_experiences" ADD CONSTRAINT "block_work_experiences_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
