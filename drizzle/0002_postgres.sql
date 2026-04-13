-- PostgreSQL version of milestones table migration for Supabase

CREATE TYPE milestone_type AS ENUM (
  'intake_started',
  'intake_completed',
  'documents_submitted',
  'documents_approved',
  'form_generated',
  'form_submitted',
  'under_review',
  'decision_received',
  'approved',
  'rejected'
);

CREATE TYPE milestone_status AS ENUM (
  'pending',
  'completed',
  'skipped'
);

CREATE TABLE IF NOT EXISTS "milestones" (
  "id" SERIAL PRIMARY KEY,
  "applicationId" integer NOT NULL,
  "milestoneType" milestone_type NOT NULL,
  "status" milestone_status NOT NULL DEFAULT 'pending',
  "completedAt" timestamp,
  "notes" text,
  "createdBy" integer,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "milestones_applicationId_idx" ON "milestones" ("applicationId");
CREATE INDEX IF NOT EXISTS "milestones_milestoneType_idx" ON "milestones" ("milestoneType");
