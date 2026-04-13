-- PardonPath: Supabase Auth Migration SQL (DATA-PRESERVING)
-- Converts users.id from integer to UUID while preserving all data and relationships

-- Step 1: Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop ALL foreign key constraints (without CASCADE)
ALTER TABLE applicants DROP CONSTRAINT IF EXISTS applicants_userId_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_userId_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_userId_fkey;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_userId_fkey;
ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_userId_fkey;
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_userId_fkey;
ALTER TABLE "auditLogs" DROP CONSTRAINT IF EXISTS "auditLogs_createdBy_fkey";

-- Step 3: Add new UUID columns to users table
ALTER TABLE users ADD COLUMN id_new uuid DEFAULT gen_random_uuid();

-- Step 4: Create a mapping table to preserve id->id_new relationships
CREATE TEMPORARY TABLE id_mapping AS
SELECT id, id_new FROM users;

-- Step 5: Add new UUID columns to all child tables
ALTER TABLE applicants ADD COLUMN "userId_new" uuid;
ALTER TABLE documents ADD COLUMN "userId_new" uuid;
ALTER TABLE applications ADD COLUMN "userId_new" uuid;
ALTER TABLE payments ADD COLUMN "userId_new" uuid;
ALTER TABLE partners ADD COLUMN "userId_new" uuid;
ALTER TABLE milestones ADD COLUMN "userId_new" uuid;
ALTER TABLE "auditLogs" ADD COLUMN "createdBy_new" uuid;

-- Step 6: Populate new columns with mapped UUID values
UPDATE applicants a SET "userId_new" = m.id_new FROM id_mapping m WHERE a."userId" = m.id;
UPDATE documents d SET "userId_new" = m.id_new FROM id_mapping m WHERE d."userId" = m.id;
UPDATE applications ap SET "userId_new" = m.id_new FROM id_mapping m WHERE ap."userId" = m.id;
UPDATE payments p SET "userId_new" = m.id_new FROM id_mapping m WHERE p."userId" = m.id;
UPDATE partners pt SET "userId_new" = m.id_new FROM id_mapping m WHERE pt."userId" = m.id;
UPDATE milestones ml SET "userId_new" = m.id_new FROM id_mapping m WHERE ml."userId" = m.id;
UPDATE "auditLogs" al SET "createdBy_new" = m.id_new FROM id_mapping m WHERE al."createdBy" = m.id;

-- Step 7: Drop old integer columns from child tables
ALTER TABLE applicants DROP COLUMN "userId";
ALTER TABLE documents DROP COLUMN "userId";
ALTER TABLE applications DROP COLUMN "userId";
ALTER TABLE payments DROP COLUMN "userId";
ALTER TABLE partners DROP COLUMN "userId";
ALTER TABLE milestones DROP COLUMN "userId";
ALTER TABLE "auditLogs" DROP COLUMN "createdBy";

-- Step 8: Rename new UUID columns to original names
ALTER TABLE applicants RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE documents RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE applications RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE payments RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE partners RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE milestones RENAME COLUMN "userId_new" TO "userId";
ALTER TABLE "auditLogs" RENAME COLUMN "createdBy_new" TO "createdBy";

-- Step 9: Drop old integer id column from users table
ALTER TABLE users DROP COLUMN id;

-- Step 10: Rename users.id_new to users.id
ALTER TABLE users RENAME COLUMN id_new TO id;

-- Step 11: Add primary key to users
ALTER TABLE users ADD PRIMARY KEY (id);

-- Step 12: Make openId nullable
ALTER TABLE users ALTER COLUMN "openId" DROP NOT NULL;

-- Step 13: Recreate all foreign key constraints
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

-- Step 14: Verify migration
-- Run these queries to verify data integrity:
-- SELECT COUNT(*) FROM users;
-- SELECT COUNT(*) FROM applicants WHERE "userId" IS NOT NULL;
-- SELECT COUNT(*) FROM documents WHERE "userId" IS NOT NULL;
-- SELECT COUNT(*) FROM applications WHERE "userId" IS NOT NULL;
-- SELECT COUNT(*) FROM payments WHERE "userId" IS NOT NULL;
-- SELECT COUNT(*) FROM partners WHERE "userId" IS NOT NULL;
-- SELECT COUNT(*) FROM milestones WHERE "userId" IS NOT NULL;
-- SELECT COUNT(*) FROM "auditLogs" WHERE "createdBy" IS NOT NULL;

-- Migration complete!
-- All data has been preserved
-- All relationships have been maintained
-- Supabase Auth can now use UUID-based user IDs
