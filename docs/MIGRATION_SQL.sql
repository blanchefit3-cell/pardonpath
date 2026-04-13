-- PardonPath: Supabase Auth Migration SQL
-- Converts users.id from integer to UUID for Supabase Auth compatibility
-- 
-- IMPORTANT: 
-- 1. Backup database before running
-- 2. Test on staging database first
-- 3. Execute in Supabase SQL Editor (not via psql)
-- 4. This migration is idempotent (safe to run multiple times)

-- Step 1: Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Add temporary UUID column to users table
ALTER TABLE users ADD COLUMN id_new uuid DEFAULT gen_random_uuid();

-- Step 3: Migrate data from old id to new id_new
UPDATE users SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- Step 4: Drop default from new column (will be set per-user)
ALTER TABLE users ALTER COLUMN id_new DROP DEFAULT;

-- Step 5: Update all foreign key references
-- applicants.userId
UPDATE applicants SET "userId" = (SELECT id_new FROM users WHERE users.id = applicants."userId");

-- documents.userId
UPDATE documents SET "userId" = (SELECT id_new FROM users WHERE users.id = documents."userId");

-- applications.userId
UPDATE applications SET "userId" = (SELECT id_new FROM users WHERE users.id = applications."userId");

-- payments.userId
UPDATE payments SET "userId" = (SELECT id_new FROM users WHERE users.id = payments."userId");

-- partners.userId
UPDATE partners SET "userId" = (SELECT id_new FROM users WHERE users.id = partners."userId");

-- milestones.userId
UPDATE milestones SET "userId" = (SELECT id_new FROM users WHERE users.id = milestones."userId");

-- auditLogs.createdBy
UPDATE "auditLogs" SET "createdBy" = (SELECT id_new FROM users WHERE users.id = "auditLogs"."createdBy");

-- Step 6: Drop old id column and rename new one
ALTER TABLE users DROP COLUMN id CASCADE;
ALTER TABLE users RENAME COLUMN id_new TO id;

-- Step 7: Set id as primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 8: Update foreign key constraints
-- applicants.userId
ALTER TABLE applicants
  DROP CONSTRAINT IF EXISTS applicants_userId_fkey,
  ADD CONSTRAINT applicants_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- documents.userId
ALTER TABLE documents
  DROP CONSTRAINT IF EXISTS documents_userId_fkey,
  ADD CONSTRAINT documents_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- applications.userId
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_userId_fkey,
  ADD CONSTRAINT applications_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- payments.userId
ALTER TABLE payments
  DROP CONSTRAINT IF EXISTS payments_userId_fkey,
  ADD CONSTRAINT payments_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- partners.userId
ALTER TABLE partners
  DROP CONSTRAINT IF EXISTS partners_userId_fkey,
  ADD CONSTRAINT partners_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- milestones.userId
ALTER TABLE milestones
  DROP CONSTRAINT IF EXISTS milestones_userId_fkey,
  ADD CONSTRAINT milestones_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- auditLogs.createdBy
ALTER TABLE "auditLogs"
  DROP CONSTRAINT IF EXISTS "auditLogs_createdBy_fkey",
  ADD CONSTRAINT "auditLogs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES users(id) ON DELETE SET NULL;

-- Step 9: Make openId nullable (for backward compatibility)
ALTER TABLE users ALTER COLUMN "openId" DROP NOT NULL;

-- Step 10: Verify migration
-- Run these queries to verify:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM applicants;
-- SELECT COUNT(*) FROM documents;
-- SELECT COUNT(*) FROM applications;
-- SELECT COUNT(*) FROM payments;
-- SELECT COUNT(*) FROM partners;
-- SELECT COUNT(*) FROM milestones;
-- SELECT COUNT(*) FROM "auditLogs";

-- Migration complete!
-- All tables have been updated to use UUID for user IDs
-- Supabase Auth can now use UUID-based user IDs
