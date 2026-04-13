import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  index,
} from "drizzle-orm/pg-core";

// ─── Enum Definitions ────────────────────────────────────────────────────────
// All enums must be defined outside tables so .default() and .notNull() work.

export const userRoleEnum = pgEnum("user_role", ["user", "admin", "paralegal", "partner"]);

export const appStatusEnum = pgEnum("app_status", [
  "intake",
  "documents",
  "review",
  "submission",
  "decision",
  "completed",
  "rejected",
]);

export const appTierEnum = pgEnum("app_tier", ["diy", "done_with_you", "done_for_you"]);

export const eligibilityStatusEnum = pgEnum("eligibility_status", ["pass", "flag", "ineligible"]);

export const paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed"]);

export const pbcDecisionEnum = pgEnum("pbc_decision", ["approved", "denied", "pending"]);

export const documentTypeEnum = pgEnum("document_type", [
  "court_record",
  "police_certificate",
  "id_document",
  "other",
]);

export const aiReviewStatusEnum = pgEnum("ai_review_status", ["pending", "approved", "flagged"]);

export const humanReviewStatusEnum = pgEnum("human_review_status", ["pending", "approved", "rejected"]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "eligibility_confirmed",
  "document_approved",
  "form_ready",
  "submission_sent",
  "decision_received",
  "milestone_update",
]);

export const notificationChannelEnum = pgEnum("notification_channel", ["email", "sms"]);

export const notificationStatusEnum = pgEnum("notification_status", ["pending", "sent", "failed"]);

export const paymentTierEnum = pgEnum("payment_tier", ["diy", "done_with_you", "done_for_you"]);

export const paymentStatusTxEnum = pgEnum("payment_status_enum", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const partnerStatusEnum = pgEnum("partner_status", ["active", "inactive", "suspended"]);

export const milestoneTypeEnum = pgEnum("milestone_type", [
  "intake_started",
  "intake_completed",
  "documents_submitted",
  "documents_approved",
  "form_generated",
  "form_submitted",
  "under_review",
  "decision_received",
  "approved",
  "rejected",
]);

export const milestoneStatusEnum = pgEnum("milestone_status_enum", [
  "pending",
  "completed",
  "skipped",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

/**
 * Core user table backing auth flow.
 * Extended with role-based access control for applicants, paralegals, and B2B partners.
 */
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Applicants table: stores personal and contact information for pardon applicants.
 * Sensitive fields (SIN, charges) are encrypted at the application layer.
 */
export const applicants = pgTable(
  "applicants",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("userId").notNull(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    dateOfBirth: timestamp("dateOfBirth"),
    // Encrypted fields (stored as encrypted strings, decrypted at application layer)
    sinEncrypted: text("sinEncrypted"),
    driversLicenseEncrypted: text("driversLicenseEncrypted"),
    province: varchar("province", { length: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("applicants_userId_idx").on(table.userId),
  })
);

export type Applicant = typeof applicants.$inferSelect;
export type InsertApplicant = typeof applicants.$inferInsert;

/**
 * Applications table: tracks the status and lifecycle of each pardon application.
 */
export const applications = pgTable(
  "applications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicantId: integer("applicantId").notNull(),
    status: appStatusEnum("status").default("intake").notNull(),
    tier: appTierEnum("tier").notNull(),
    offenseTypeEncrypted: text("offenseTypeEncrypted"),
    offenseDateEncrypted: text("offenseDateEncrypted"),
    sentenceDetailsEncrypted: text("sentenceDetailsEncrypted"),
    eligibilityStatus: eligibilityStatusEnum("eligibilityStatus"),
    eligibilityReportUrl: text("eligibilityReportUrl"),
    documentsApproved: boolean("documentsApproved").default(false),
    formGenerated: boolean("formGenerated").default(false),
    formUrl: text("formUrl"),
    paymentId: varchar("paymentId", { length: 255 }),
    paymentStatus: paymentStatusEnum("paymentStatus").default("pending"),
    submittedToPBC: boolean("submittedToPBC").default(false),
    pbcDecision: pbcDecisionEnum("pbcDecision"),
    paralegalAssignedId: integer("paralegalAssignedId"),
    paralegalNotes: text("paralegalNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
 */
export const documents = pgTable(
  "documents",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicationId: integer("applicationId").notNull(),
    documentType: documentTypeEnum("documentType").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileUrl: text("fileUrl").notNull(),
    fileKey: varchar("fileKey", { length: 255 }).notNull(),
    fileSizeBytes: integer("fileSizeBytes"),
    mimeType: varchar("mimeType", { length: 100 }),
    uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
    aiReviewStatus: aiReviewStatusEnum("aiReviewStatus").default("pending"),
    aiReviewNotes: text("aiReviewNotes"),
    humanReviewStatus: humanReviewStatusEnum("humanReviewStatus"),
    humanReviewNotes: text("humanReviewNotes"),
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
 */
export const auditLogs = pgTable(
  "auditLogs",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicationId: integer("applicationId").notNull(),
    userId: integer("userId"),
    action: varchar("action", { length: 100 }).notNull(),
    details: json("details"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
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
 */
export const notifications = pgTable(
  "notifications",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicationId: integer("applicationId").notNull(),
    recipientEmail: varchar("recipientEmail", { length: 320 }),
    recipientPhone: varchar("recipientPhone", { length: 20 }),
    notificationType: notificationTypeEnum("notificationType").notNull(),
    channel: notificationChannelEnum("channel").notNull(),
    status: notificationStatusEnum("status").default("pending"),
    externalId: varchar("externalId", { length: 255 }),
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
export const payments = pgTable(
  "payments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicationId: integer("applicationId").notNull(),
    stripePaymentId: varchar("stripePaymentId", { length: 255 }).notNull().unique(),
    tier: paymentTierEnum("tier").notNull(),
    amountCents: integer("amountCents").notNull(),
    currency: varchar("currency", { length: 3 }).default("CAD").notNull(),
    status: paymentStatusTxEnum("status").default("pending"),
    receiptUrl: text("receiptUrl"),
    receiptSentAt: timestamp("receiptSentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
export const partners = pgTable(
  "partners",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("userId").notNull().unique(),
    companyName: varchar("companyName", { length: 255 }).notNull(),
    businessNumber: varchar("businessNumber", { length: 20 }),
    apiKey: varchar("apiKey", { length: 255 }).notNull().unique(),
    apiKeyRotatedAt: timestamp("apiKeyRotatedAt").defaultNow(),
    maxClients: integer("maxClients").default(100),
    activeClients: integer("activeClients").default(0),
    status: partnerStatusEnum("status").default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
export const partnerClients = pgTable(
  "partnerClients",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    partnerId: integer("partnerId").notNull(),
    applicationId: integer("applicationId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    partnerIdIdx: index("partnerClients_partnerId_idx").on(table.partnerId),
    applicationIdIdx: index("partnerClients_applicationId_idx").on(table.applicationId),
  })
);

export type PartnerClient = typeof partnerClients.$inferSelect;
export type InsertPartnerClient = typeof partnerClients.$inferInsert;

/**
 * Milestones table: tracks progress through application lifecycle stages.
 */
export const milestones = pgTable(
  "milestones",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    applicationId: integer("applicationId").notNull(),
    milestoneType: milestoneTypeEnum("milestoneType").notNull(),
    status: milestoneStatusEnum("status").default("pending").notNull(),
    completedAt: timestamp("completedAt"),
    notes: text("notes"),
    createdBy: integer("createdBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    applicationIdIdx: index("milestones_applicationId_idx").on(table.applicationId),
    milestoneTypeIdx: index("milestones_milestoneType_idx").on(table.milestoneType),
  })
);

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;
