-- PardonPath: Supabase Auth Migration SQL (SIMPLIFIED)
-- Step-by-step approach: convert parent table first, then children

-- Step 1: Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop ALL foreign key constraints first
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS applicants_userId_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_userId_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_userId_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_userId_fkey;
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_userId_fkey;
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_userId_fkey;
ALTER TABLE "auditLogs" DROP CONSTRAINT IF EXISTS "auditLogs_createdBy_fkey";

-- Step 3: Convert users.id from integer to UUID
-- Create new UUID column
ALTER TABLE users ADD COLUMN id_new uuid;

-- Populate with UUIDs (one per user)
UPDATE users SET id_new = gen_random_uuid();

-- Drop the old integer id column (this will cascade to all child tables)
ALTER TABLE users DROP COLUMN id CASCADE;

-- Rename new column to id
ALTER TABLE users RENAME COLUMN id_new TO id;

-- Add primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 4: Now convert all child table userId columns to UUID
-- First, set them all to NULL temporarily
UPDATE applicants SET "userId" = NULL;
UPDATE documents SET "userId" = NULL;
UPDATE applications SET "userId" = NULL;
UPDATE payments SET "userId" = NULL;
UPDATE partners SET "userId" = NULL;
UPDATE milestones SET "userId" = NULL;
UPDATE "auditLogs" SET "createdBy" = NULL;

-- Convert the column types
ALTER TABLE applicants ALTER COLUMN "userId" TYPE uuid;
ALTER TABLE documents ALTER COLUMN "userId" TYPE uuid;
ALTER TABLE applications ALTER COLUMN "userId" TYPE uuid;
ALTER TABLE payments ALTER COLUMN "userId" TYPE uuid;
ALTER TABLE partners ALTER COLUMN "userId" TYPE uuid;
ALTER TABLE milestones ALTER COLUMN "userId" TYPE uuid;
ALTER TABLE "auditLogs" ALTER COLUMN "createdBy" TYPE uuid;

-- Step 5: Make openId nullable
ALTER TABLE users ALTER COLUMN "openId" DROP NOT NULL;

-- Step 6: Recreate foreign key constraints
ALTER TABLE applicants
  ADD CONSTRAINT applicants_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE documents
  ADD CONSTRAINT documents_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE applications
  ADD CONSTRAINT applications_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE payments
  ADD CONSTRAINT payments_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE partners
  ADD CONSTRAINT partners_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE milestones
  ADD CONSTRAINT milestones_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE "auditLogs"
  ADD CONSTRAINT "auditLogs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES users(id) ON DELETE SET NULL;

-- Migration complete!
-- Note: All child table records will have NULL userId values
-- You'll need to re-populate them from your application or backups
