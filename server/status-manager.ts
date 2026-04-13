import { getDb, logAuditEvent } from "./db";
import { applications, milestones } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export type ApplicationStatus = "intake" | "documents" | "review" | "submission" | "decision" | "completed" | "rejected";
export type MilestoneType = 
  | "intake_started"
  | "intake_completed"
  | "documents_submitted"
  | "documents_approved"
  | "form_generated"
  | "form_submitted"
  | "under_review"
  | "decision_received"
  | "approved"
  | "rejected";

/**
 * Get current application status
 */
export async function getApplicationStatus(applicationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });

  if (!app) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found",
    });
  }

  return {
    id: app.id,
    status: app.status,
    tier: app.tier,
    eligibilityStatus: app.eligibilityStatus,
    documentsApproved: app.documentsApproved,
    formGenerated: app.formGenerated,
    submittedToPBC: app.submittedToPBC,
    pbcDecision: app.pbcDecision,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

/**
 * Get milestone history for an application
 */
export async function getMilestoneHistory(applicationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const milestoneRecords = await db.query.milestones.findMany({
    where: eq(milestones.applicationId, applicationId),
    orderBy: (m) => m.createdAt,
  });

  return milestoneRecords.map((m) => ({
    id: m.id,
    milestoneType: m.milestoneType,
    status: m.status,
    completedAt: m.completedAt,
    notes: m.notes,
    createdAt: m.createdAt,
  }));
}

/**
 * Update application status and log the change
 * Admin-only operation
 */
export async function updateApplicationStatus(
  applicationId: number,
  newStatus: ApplicationStatus,
  userId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get current application
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });

  if (!app) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found",
    });
  }

  // Validate status transition
  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    intake: ["documents", "rejected"],
    documents: ["review", "rejected"],
    review: ["submission", "rejected"],
    submission: ["decision", "rejected"],
    decision: ["completed", "rejected"],
    completed: [],
    rejected: [],
  };

  if (!validTransitions[app.status as ApplicationStatus]?.includes(newStatus)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Cannot transition from ${app.status} to ${newStatus}`,
    });
  }

  // Update application status
  await db
    .update(applications)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(applications.id, applicationId));

  // Log the status change
  await logAuditEvent({
    applicationId,
    userId,
    action: "status_updated",
    details: {
      oldStatus: app.status,
      newStatus,
      notes,
    },
    ipAddress: "system",
    userAgent: "status-manager",
  });

  return {
    success: true,
    applicationId,
    oldStatus: app.status,
    newStatus,
  };
}

/**
 * Record a milestone completion
 */
export async function recordMilestone(
  applicationId: number,
  milestoneType: MilestoneType,
  userId: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if milestone already exists and is completed
  const existing = await db.query.milestones.findFirst({
    where: and(
      eq(milestones.applicationId, applicationId),
      eq(milestones.milestoneType, milestoneType)
    ),
  });

  if (existing && existing.status === "completed") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Milestone ${milestoneType} already completed`,
    });
  }

  // Create or update milestone
  if (existing) {
    await db
      .update(milestones)
      .set({
        status: "completed",
        completedAt: new Date(),
        notes,
        createdBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(milestones.id, existing.id));
  } else {
    await db.insert(milestones).values({
      applicationId,
      milestoneType,
      status: "completed",
      completedAt: new Date(),
      notes,
      createdBy: userId,
    });
  }

  // Log the milestone
  await logAuditEvent({
    applicationId,
    userId,
    action: "milestone_recorded",
    details: {
      milestoneType,
      notes,
    },
    ipAddress: "system",
    userAgent: "status-manager",
  });

  return {
    success: true,
    applicationId,
    milestoneType,
  };
}

/**
 * Get application progress summary
 */
export async function getApplicationProgress(applicationId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
  });

  if (!app) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Application not found",
    });
  }

  const milestoneRecords = await db.query.milestones.findMany({
    where: eq(milestones.applicationId, applicationId),
    orderBy: (m: any) => m.createdAt,
  });

  const completedMilestones = milestoneRecords.filter((m) => m.status === "completed").length;
  const totalMilestones = milestoneRecords.length;
  const progressPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return {
    applicationId,
    status: app.status,
    tier: app.tier,
    completedMilestones,
    totalMilestones,
    progressPercentage,
    eligibilityStatus: app.eligibilityStatus,
    documentsApproved: app.documentsApproved,
    formGenerated: app.formGenerated,
    submittedToPBC: app.submittedToPBC,
    pbcDecision: app.pbcDecision,
    lastUpdated: app.updatedAt,
  };
}
