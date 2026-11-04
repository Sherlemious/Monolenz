-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "display_name" VARCHAR(255);
ALTER TABLE "profiles" ADD COLUMN "phone" VARCHAR(50);
ALTER TABLE "profiles" ADD COLUMN "location" VARCHAR(255);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "template_id" VARCHAR(50) NOT NULL,
    "source_version_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_blocks" (
    "resume_id" UUID NOT NULL,
    "block_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "section_name" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_blocks_pkey" PRIMARY KEY ("resume_id","block_id")
);

-- CreateIndex
CREATE INDEX "idx_resumes_profile" ON "resumes"("profile_id", "created_at");

-- CreateIndex
CREATE INDEX "idx_resume_blocks_order" ON "resume_blocks"("resume_id", "sort_order");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_source_version_id_fkey" FOREIGN KEY ("source_version_id") REFERENCES "versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_blocks" ADD CONSTRAINT "resume_blocks_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_blocks" ADD CONSTRAINT "resume_blocks_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
