import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for applicants, paralegals, and B2B partners.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "paralegal", "partner"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Applicants table: stores personal and contact information for pardon applicants.
 * Sensitive fields (SIN, charges) are encrypted at the application layer.
 */
export const applicants = mysqlTable(
  "applicants",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    dateOfBirth: timestamp("dateOfBirth"),
    // Encrypted fields (stored as encrypted strings, decrypted at application layer)
    sinEncrypted: text("sinEncrypted"), // Social Insurance Number (encrypted)
    driversLicenseEncrypted: text("driversLicenseEncrypted"), // Driver's license (encrypted)
    province: varchar("province", { length: 2 }), // e.g., "ON", "BC", "QC"
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("applicants_userId_idx").on(table.userId),
  })
);

export type Applicant = typeof applicants.$inferSelect;
export type InsertApplicant = typeof applicants.$inferInsert;

/**
 * Applications table: tracks the status and lifecycle of each pardon application.
 * Immutable audit trail via audit_logs table.
 */
export const applications = mysqlTable(
  "applications",
  {
    id: int("id").autoincrement().primaryKey(),
    applicantId: int("applicantId").notNull(),
    status: mysqlEnum("status", [
      "intake",
      "documents",
      "review",
      "submission",
      "decision",
      "completed",
      "rejected",
    ])
      .default("intake")
      .notNull(),
    tier: mysqlEnum("tier", ["diy", "done_with_you", "done_for_you"]).notNull(),
    // Encrypted fields
    offenseTypeEncrypted: text("offenseTypeEncrypted"), // e.g., "Schedule 1", "Hybrid"
    offenseDateEncrypted: text("offenseDateEncrypted"), // Date of offense (encrypted)
    sentenceDetailsEncrypted: text("sentenceDetailsEncrypted"), // Sentence info (encrypted)
    eligibilityStatus: mysqlEnum("eligibilityStatus", ["pass", "flag", "ineligible"]),
    eligibilityReportUrl: text("eligibilityReportUrl"), // S3 URL to eligibility report PDF
    documentsApproved: boolean("documentsApproved").default(false),
    formGenerated: boolean("formGenerated").default(false),
    formUrl: text("formUrl"), // S3 URL to generated PBC form PDF
    paymentId: varchar("paymentId", { length: 255 }), // Stripe payment ID
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending"),
    submittedToPBC: boolean("submittedToPBC").default(false),
    pbcDecision: mysqlEnum("pbcDecision", ["approved", "denied", "pending"]),
    paralegalAssignedId: int("paralegalAssignedId"), // User ID of assigned paralegal
    paralegalNotes: text("paralegalNotes"), // Notes from paralegal review
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    applicantIdIdx: index("applications_applicantId_idx").on(table.applicantId),
    statusIdx: index("applications_status_idx").on(table.status),
  })
);

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Documents table: tracks uploaded court records, police certificates, and ID documents.
 * Files are stored in S3 with encryption; this table stores metadata and S3 URLs.
 */
export const documents = mysqlTable(
  "documents",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    documentType: mysqlEnum("documentType", [
      "court_record",
      "police_certificate",
      "id_document",
      "other",
    ]).notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileUrl: text("fileUrl").notNull(), // S3 URL (encrypted in transit)
    fileKey: varchar("fileKey", { length: 255 }).notNull(), // S3 file key for retrieval
    fileSizeBytes: int("fileSizeBytes"),
    mimeType: varchar("mimeType", { length: 100 }),
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    aiReviewStatus: mysqlEnum("aiReviewStatus", ["pending", "approved", "flagged"]).default("pending"),
    aiReviewNotes: text("aiReviewNotes"), // AI-generated completeness review notes
    humanReviewStatus: mysqlEnum("humanReviewStatus", ["pending", "approved", "rejected"]),
    humanReviewNotes: text("humanReviewNotes"), // Paralegal review notes
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    applicationIdIdx: index("documents_applicationId_idx").on(table.applicationId),
  })
);

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Audit logs table: immutable record of all application actions for PIPEDA compliance.
 * Every significant action (upload, status change, form generation, payment, review) is logged.
 */
export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    userId: int("userId"), // User who performed the action (null for system actions)
    action: varchar("action", { length: 100 }).notNull(), // e.g., "document_uploaded", "status_changed", "form_generated"
    details: json("details"), // JSON payload with action-specific details
    ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6
    userAgent: text("userAgent"), // Browser user agent
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    applicationIdIdx: index("auditLogs_applicationId_idx").on(table.applicationId),
    timestampIdx: index("auditLogs_timestamp_idx").on(table.timestamp),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Notifications table: tracks email and SMS notifications sent to applicants.
 * Used for audit trail and to prevent duplicate notifications.
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    recipientEmail: varchar("recipientEmail", { length: 320 }),
    recipientPhone: varchar("recipientPhone", { length: 20 }),
    notificationType: mysqlEnum("notificationType", [
      "eligibility_confirmed",
      "document_approved",
      "form_ready",
      "submission_sent",
      "decision_received",
      "milestone_update",
    ]).notNull(),
    channel: mysqlEnum("channel", ["email", "sms"]).notNull(),
    status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending"),
    externalId: varchar("externalId", { length: 255 }), // Resend or Twilio message ID
    sentAt: timestamp("sentAt"),
    failureReason: text("failureReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    applicationIdIdx: index("notifications_applicationId_idx").on(table.applicationId),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Payments table: tracks Stripe transactions for DIY, Done-With-You, and Done-For-You tiers.
 */
export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    applicationId: int("applicationId").notNull(),
    stripePaymentId: varchar("stripePaymentId", { length: 255 }).notNull().unique(),
    tier: mysqlEnum("tier", ["diy", "done_with_you", "done_for_you"]).notNull(),
    amountCents: int("amountCents").notNull(), // Amount in cents (e.g., 19900 for $199.00)
    currency: varchar("currency", { length: 3 }).default("CAD").notNull(),
    status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
    receiptUrl: text("receiptUrl"), // Stripe receipt URL
    receiptSentAt: timestamp("receiptSentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    applicationIdIdx: index("payments_applicationId_idx").on(table.applicationId),
    stripePaymentIdIdx: index("payments_stripePaymentId_idx").on(table.stripePaymentId),
  })
);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * B2B Partners table: tracks law firms and paralegals who use the partner portal.
 */
export const partners = mysqlTable(
  "partners",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    companyName: varchar("companyName", { length: 255 }).notNull(),
    businessNumber: varchar("businessNumber", { length: 20 }), // Canadian business number
    apiKey: varchar("apiKey", { length: 255 }).notNull().unique(), // API key for B2B access
    apiKeyRotatedAt: timestamp("apiKeyRotatedAt").defaultNow(),
    maxClients: int("maxClients").default(100), // Max clients they can manage
    activeClients: int("activeClients").default(0),
    status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("partners_userId_idx").on(table.userId),
  })
);

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Partner clients table: tracks which applicants are managed by which B2B partners.
 */
export const partnerClients = mysqlTable(
  "partnerClients",
  {
    id: int("id").autoincrement().primaryKey(),
    partnerId: int("partnerId").notNull(),
    applicationId: int("applicationId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    partnerIdIdx: index("partnerClients_partnerId_idx").on(table.partnerId),
    applicationIdIdx: index("partnerClients_applicationId_idx").on(table.applicationId),
  })
);

export type PartnerClient = typeof partnerClients.$inferSelect;
export type InsertPartnerClient = typeof partnerClients.$inferInsert;
