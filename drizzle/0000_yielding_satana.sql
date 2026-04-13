CREATE TABLE "applicants" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applicants_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"dateOfBirth" timestamp,
	"sinEncrypted" text,
	"driversLicenseEncrypted" text,
	"province" varchar(2),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"applicantId" integer NOT NULL,
	"status" "app_status" DEFAULT 'intake' NOT NULL,
	"tier" "app_tier" NOT NULL,
	"offenseTypeEncrypted" text,
	"offenseDateEncrypted" text,
	"sentenceDetailsEncrypted" text,
	"eligibilityStatus" "eligibility_status",
	"eligibilityReportUrl" text,
	"documentsApproved" boolean DEFAULT false,
	"formGenerated" boolean DEFAULT false,
	"formUrl" text,
	"paymentId" varchar(255),
	"paymentStatus" "payment_status" DEFAULT 'pending',
	"submittedToPBC" boolean DEFAULT false,
	"pbcDecision" "pbc_decision",
	"paralegalAssignedId" integer,
	"paralegalNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auditLogs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "auditLogs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"applicationId" integer NOT NULL,
	"userId" integer,
	"action" varchar(100) NOT NULL,
	"details" json,
	"ipAddress" varchar(45),
	"userAgent" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"applicationId" integer NOT NULL,
	"documentType" "document_type" NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileUrl" text NOT NULL,
	"fileKey" varchar(255) NOT NULL,
	"fileSizeBytes" integer,
	"mimeType" varchar(100),
	"uploadedAt" timestamp DEFAULT now() NOT NULL,
	"aiReviewStatus" "ai_review_status" DEFAULT 'pending',
	"aiReviewNotes" text,
	"humanReviewStatus" "human_review_status",
	"humanReviewNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "milestones_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"applicationId" integer NOT NULL,
	"milestoneType" "milestone_type" NOT NULL,
	"status" "milestone_status_enum" DEFAULT 'pending' NOT NULL,
	"completedAt" timestamp,
	"notes" text,
	"createdBy" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"applicationId" integer NOT NULL,
	"recipientEmail" varchar(320),
	"recipientPhone" varchar(20),
	"notificationType" "notification_type" NOT NULL,
	"channel" "notification_channel" NOT NULL,
	"status" "notification_status" DEFAULT 'pending',
	"externalId" varchar(255),
	"sentAt" timestamp,
	"failureReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partnerClients" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "partnerClients_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"partnerId" integer NOT NULL,
	"applicationId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "partners_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"companyName" varchar(255) NOT NULL,
	"businessNumber" varchar(20),
	"apiKey" varchar(255) NOT NULL,
	"apiKeyRotatedAt" timestamp DEFAULT now(),
	"maxClients" integer DEFAULT 100,
	"activeClients" integer DEFAULT 0,
	"status" "partner_status" DEFAULT 'active',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "partners_userId_unique" UNIQUE("userId"),
	CONSTRAINT "partners_apiKey_unique" UNIQUE("apiKey")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "payments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"applicationId" integer NOT NULL,
	"stripePaymentId" varchar(255) NOT NULL,
	"tier" "payment_tier" NOT NULL,
	"amountCents" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'CAD' NOT NULL,
	"status" "payment_status_enum" DEFAULT 'pending',
	"receiptUrl" text,
	"receiptSentAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payments_stripePaymentId_unique" UNIQUE("stripePaymentId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320) NOT NULL,
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "applicants_userId_idx" ON "applicants" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "applications_applicantId_idx" ON "applications" USING btree ("applicantId");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "auditLogs_applicationId_idx" ON "auditLogs" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "auditLogs_timestamp_idx" ON "auditLogs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "documents_applicationId_idx" ON "documents" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "milestones_applicationId_idx" ON "milestones" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "milestones_milestoneType_idx" ON "milestones" USING btree ("milestoneType");--> statement-breakpoint
CREATE INDEX "notifications_applicationId_idx" ON "notifications" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "partnerClients_partnerId_idx" ON "partnerClients" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "partnerClients_applicationId_idx" ON "partnerClients" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "partners_userId_idx" ON "partners" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "payments_applicationId_idx" ON "payments" USING btree ("applicationId");--> statement-breakpoint
CREATE INDEX "payments_stripePaymentId_idx" ON "payments" USING btree ("stripePaymentId");