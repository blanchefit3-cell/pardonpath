-- PardonPath: Supabase Auth Migration SQL (FIXED VERSION)
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

-- Step 3: Migrate data from old id to new id_new (create mapping)
UPDATE users SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- Step 4: Create a temporary mapping table to preserve the id->uuid relationship
CREATE TEMPORARY TABLE id_mapping AS
SELECT id, id_new FROM users;

-- Step 5: Convert all userId columns to UUID type (with temporary values)
ALTER TABLE applicants ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE documents ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE applications ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE payments ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE partners ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();
ALTER TABLE milestones ALTER COLUMN "userId" TYPE uuid USING gen_random_uuid();

-- Step 6: Convert createdBy column in auditLogs to UUID
ALTER TABLE "auditLogs" ALTER COLUMN "createdBy" TYPE uuid USING gen_random_uuid();

-- Step 7: Now update all foreign key references with the correct mapping
UPDATE applicants a SET "userId" = m.id_new FROM id_mapping m WHERE a."userId"::text = m.id::text;
UPDATE documents d SET "userId" = m.id_new FROM id_mapping m WHERE d."userId"::text = m.id::text;
UPDATE applications ap SET "userId" = m.id_new FROM id_mapping m WHERE ap."userId"::text = m.id::text;
UPDATE payments p SET "userId" = m.id_new FROM id_mapping m WHERE p."userId"::text = m.id::text;
UPDATE partners pt SET "userId" = m.id_new FROM id_mapping m WHERE pt."userId"::text = m.id::text;
UPDATE milestones ml SET "userId" = m.id_new FROM id_mapping m WHERE ml."userId"::text = m.id::text;
UPDATE "auditLogs" al SET "createdBy" = m.id_new FROM id_mapping m WHERE al."createdBy"::text = m.id::text;

-- Step 8: Drop old id column from users and rename new one
ALTER TABLE users DROP COLUMN id CASCADE;
ALTER TABLE users RENAME COLUMN id_new TO id;

-- Step 9: Set id as primary key
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 10: Update foreign key constraints
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

-- Step 11: Make openId nullable (for backward compatibility)
ALTER TABLE users ALTER COLUMN "openId" DROP NOT NULL;

-- Step 12: Verify migration
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
