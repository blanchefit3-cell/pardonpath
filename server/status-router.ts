import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import {
  getApplicationStatus,
  getMilestoneHistory,
  updateApplicationStatus,
  recordMilestone,
  getApplicationProgress,
  ApplicationStatus,
  MilestoneType,
} from "./status-manager";

export const statusRouter = router({
  /**
   * Get current application status
   * Public procedure - any authenticated user can view their own application
   */
  getStatus: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return getApplicationStatus(input.applicationId);
    }),

  /**
   * Get milestone history for an application
   * Public procedure - any authenticated user can view their own application
   */
  getMilestones: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return getMilestoneHistory(input.applicationId);
    }),

  /**
   * Get application progress summary
   * Public procedure - any authenticated user can view their own application
   */
  getProgress: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(async ({ input }) => {
      return getApplicationProgress(input.applicationId);
    }),

  /**
   * Update application status
   * Admin-only procedure
   */
  updateStatus: adminProcedure
    .input(
      z.object({
        applicationId: z.number(),
        newStatus: z.enum(["intake", "documents", "review", "submission", "decision", "completed", "rejected"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return updateApplicationStatus(input.applicationId, input.newStatus as ApplicationStatus, ctx.user.id, input.notes);
    }),

  /**
   * Record a milestone completion
   * Admin-only procedure
   */
  recordMilestone: adminProcedure
    .input(
      z.object({
        applicationId: z.number(),
        milestoneType: z.enum([
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
        ]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return recordMilestone(input.applicationId, input.milestoneType as MilestoneType, ctx.user.id, input.notes);
    }),
});
