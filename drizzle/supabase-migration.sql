-- PardonPath PostgreSQL Migration for Supabase
-- Convert from MySQL to PostgreSQL syntax

-- Create users table (extend existing)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320) NOT NULL UNIQUE,
  "loginMethod" VARCHAR(64),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'paralegal', 'partner')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastSignedIn" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create applicants table
CREATE TABLE IF NOT EXISTS applicants (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20),
  "dateOfBirth" TIMESTAMP,
  "sinEncrypted" TEXT,
  "driversLicenseEncrypted" TEXT,
  province VARCHAR(2),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  "applicantId" INTEGER NOT NULL REFERENCES applicants(id),
  status VARCHAR(50) NOT NULL DEFAULT 'intake' CHECK (status IN ('intake', 'documents', 'review', 'submission', 'decision', 'completed', 'rejected')),
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('diy', 'done_with_you', 'done_for_you')),
  "offenseTypeEncrypted" TEXT,
  "offenseDateEncrypted" TEXT,
  "sentenceDetailsEncrypted" TEXT,
  "eligibilityStatus" VARCHAR(50) CHECK ("eligibilityStatus" IN ('pass', 'flag', 'ineligible')),
  "eligibilityReportUrl" TEXT,
  "documentsApproved" BOOLEAN DEFAULT false,
  "formGenerated" BOOLEAN DEFAULT false,
  "formUrl" TEXT,
  "paymentId" VARCHAR(255),
  "paymentStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("paymentStatus" IN ('pending', 'completed', 'failed')),
  "submittedToPBC" BOOLEAN DEFAULT false,
  "pbcDecision" VARCHAR(50) CHECK ("pbcDecision" IN ('approved', 'denied', 'pending')),
  "paralegalAssignedId" INTEGER REFERENCES users(id),
  "paralegalNotes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create auditLogs table
CREATE TABLE IF NOT EXISTS "auditLogs" (
  id SERIAL PRIMARY KEY,
  "applicationId" INTEGER NOT NULL REFERENCES applications(id),
  "userId" INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "timestamp" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  "applicationId" INTEGER NOT NULL REFERENCES applications(id),
  "documentType" VARCHAR(50) NOT NULL CHECK ("documentType" IN ('court_record', 'police_certificate', 'id_document', 'other')),
  "fileName" VARCHAR(255) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileKey" VARCHAR(255) NOT NULL,
  "fileSizeBytes" INTEGER,
  "mimeType" VARCHAR(100),
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "aiReviewStatus" VARCHAR(50) DEFAULT 'pending' CHECK ("aiReviewStatus" IN ('pending', 'approved', 'flagged')),
  "aiReviewNotes" TEXT,
  "humanReviewStatus" VARCHAR(50) CHECK ("humanReviewStatus" IN ('pending', 'approved', 'rejected')),
  "humanReviewNotes" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  "applicationId" INTEGER NOT NULL REFERENCES applications(id),
  "recipientEmail" VARCHAR(320),
  "recipientPhone" VARCHAR(20),
  "notificationType" VARCHAR(50) NOT NULL CHECK ("notificationType" IN ('eligibility_confirmed', 'document_approved', 'form_ready', 'submission_sent', 'decision_received', 'milestone_update')),
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'sms')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  "externalId" VARCHAR(255),
  "sentAt" TIMESTAMP,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES users(id),
  "companyName" VARCHAR(255) NOT NULL,
  "businessNumber" VARCHAR(20),
  "apiKey" VARCHAR(255) NOT NULL UNIQUE,
  "apiKeyRotatedAt" TIMESTAMP DEFAULT NOW(),
  "maxClients" INTEGER DEFAULT 100,
  "activeClients" INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create partnerClients table
CREATE TABLE IF NOT EXISTS "partnerClients" (
  id SERIAL PRIMARY KEY,
  "partnerId" INTEGER NOT NULL REFERENCES partners(id),
  "applicationId" INTEGER NOT NULL REFERENCES applications(id),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  "applicationId" INTEGER NOT NULL REFERENCES applications(id),
  "stripePaymentId" VARCHAR(255) NOT NULL UNIQUE,
  tier VARCHAR(50) NOT NULL CHECK (tier IN ('diy', 'done_with_you', 'done_for_you')),
  "amountCents" INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'CAD',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  "receiptUrl" TEXT,
  "receiptSentAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS applicants_userId_idx ON applicants("userId");
CREATE INDEX IF NOT EXISTS applications_applicantId_idx ON applications("applicantId");
CREATE INDEX IF NOT EXISTS applications_status_idx ON applications(status);
CREATE INDEX IF NOT EXISTS "auditLogs_applicationId_idx" ON "auditLogs"("applicationId");
CREATE INDEX IF NOT EXISTS "auditLogs_timestamp_idx" ON "auditLogs"("timestamp");
CREATE INDEX IF NOT EXISTS documents_applicationId_idx ON documents("applicationId");
CREATE INDEX IF NOT EXISTS notifications_applicationId_idx ON notifications("applicationId");
CREATE INDEX IF NOT EXISTS "partnerClients_partnerId_idx" ON "partnerClients"("partnerId");
CREATE INDEX IF NOT EXISTS "partnerClients_applicationId_idx" ON "partnerClients"("applicationId");
CREATE INDEX IF NOT EXISTS partners_userId_idx ON partners("userId");
CREATE INDEX IF NOT EXISTS payments_applicationId_idx ON payments("applicationId");
CREATE INDEX IF NOT EXISTS payments_stripePaymentId_idx ON payments("stripePaymentId");
