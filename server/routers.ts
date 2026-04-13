import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getDb,
  getApplicationsByApplicantId,
  getApplicationById,
  getDocumentsByApplicationId,
  getAuditLogsByApplicationId,
} from "./db";
import { applicants, applications, auditLogs } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { checkEligibility, OffenseCategory, type EligibilityCheckInput } from "./eligibility-engine";
import {
  findProvidersNearPostalCode,
  findProvidersByProvince,
  findProvidersByCity,
  getProviderById,
  getAllProvinces,
  getProviderStatistics,
} from "./rcmp-locator";
import {
  uploadDocument,
  getDocumentById,
  getDocumentChecklist,
  checkDocumentCompletion,
  updateDocumentAIReview,
  updateDocumentHumanReview,
  DocumentType,
} from "./documents";
import { reviewDocumentCompleteness } from "./document-review";
import { formsRouter } from "./forms-router";
import { statusRouter } from "./status-router";
import { blogRouter, helpRouter } from "./blog-router";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  forms: formsRouter,
  status: statusRouter,
  blog: blogRouter,
  help: helpRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Applications router: handles application lifecycle management
   */
  applications: router({
    /**
     * Get the current user's applications
     */
    list: protectedProcedure.query(async ({ ctx }) => {
      // Get applicant for this user, then get their applications
      const database = await getDb();
      if (!database) return [];
      
      const userApplicants = await database
        .select()
        .from(applicants)
        .where(eq(applicants.userId, ctx.user.id));
      
      if (userApplicants.length === 0) return [];
      
      // Get all applications for this applicant
      const applicantIds = userApplicants.map(a => a.id);
      const allApps = [];
      for (const applicantId of applicantIds) {
        const apps = await getApplicationsByApplicantId(applicantId);
        allApps.push(...apps);
      }
      return allApps;
    }),

    /**
     * Get a specific application by ID
     */
    getById: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        const application = await getApplicationById(input.applicationId);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        return application;
      }),

    /**
     * Create a new application with applicant data
     */
    create: protectedProcedure
      .input(
        z.object({
          tier: z.enum(["diy", "done_with_you", "done_for_you"]),
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Invalid email address"),
          phone: z.string().optional(),
          province: z.string().length(2, "Province must be 2 characters").optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          // Create applicant record
          const applicantResult = await database.insert(applicants).values({
            userId: ctx.user.id,
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone || null,
            province: input.province || null,
          });

          const applicantId = (applicantResult as any).insertId as number;

          // Create application record
          const appResult = await database.insert(applications).values({
            applicantId,
            tier: input.tier,
            status: "intake",
          });

          const applicationId = (appResult as any).insertId as number;

          // Log audit event
          await database.insert(auditLogs).values({
            applicationId,
            userId: ctx.user.id,
            action: "application_created",
            details: JSON.stringify({ tier: input.tier, applicantId }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          return { id: applicationId, applicantId, tier: input.tier, status: "intake" };
        } catch (error) {
          console.error("[Applications.create] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create application" });
        }
      }),

    /**
     * Update application status
     */
    updateStatus: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          status: z.enum(["intake", "documents", "review", "submission", "decision", "completed", "rejected"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const application = await getApplicationById(input.applicationId);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          await database
            .update(applications)
            .set({ status: input.status })
            .where(eq(applications.id, input.applicationId));

          // Log audit event
          await database.insert(auditLogs).values({
            applicationId: input.applicationId,
            userId: ctx.user.id,
            action: "status_changed",
            details: JSON.stringify({ from: application.status, to: input.status }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          return { success: true };
        } catch (error) {
          console.error("[Applications.updateStatus] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update application status" });
        }
      }),
  }),

  /**
   * Documents router: handles document uploads and management
   */
  documents: router({
    /**
     * Get all documents for an application
     */
    list: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return await getDocumentsByApplicationId(input.applicationId);
      }),

    /**
     * Get a specific document by ID
     */
    getById: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .query(async ({ input }) => {
        const doc = await getDocumentById(input.documentId);
        if (!doc) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }
        return doc;
      }),

    /**
     * Upload a document to S3 and store metadata
     */
    upload: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          documentType: z.enum(["court_record", "police_certificate", "id_document", "other"]),
          fileName: z.string().min(1),
          fileBuffer: z.instanceof(Buffer),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          // Upload document to S3 and store metadata
          const doc = await uploadDocument(
            input.applicationId,
            input.documentType as DocumentType,
            input.fileName,
            input.fileBuffer,
            input.mimeType || "application/octet-stream"
          );

          // Log audit event
          await database.insert(auditLogs).values({
            applicationId: input.applicationId,
            userId: ctx.user.id,
            action: "document_uploaded",
            details: JSON.stringify({
              documentId: doc.id,
              documentType: input.documentType,
              fileName: input.fileName,
              fileSize: input.fileBuffer.length,
            }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          return doc;
        } catch (error) {
          console.error("[Documents.upload] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload document" });
        }
      }),

    /**
     * Get required document checklist for a jurisdiction
     */
    getChecklist: publicProcedure
      .input(z.object({ province: z.string() }))
      .query(({ input }) => {
        const required = getDocumentChecklist(input.province);
        return {
          province: input.province,
          required,
          description: `Required documents for ${input.province}`,
        };
      }),

    /**
     * Check document completion status for an application
     */
    checkCompletion: protectedProcedure
      .input(z.object({ applicationId: z.number(), province: z.string() }))
      .query(async ({ input }) => {
        return await checkDocumentCompletion(input.applicationId, input.province);
      }),

    /**
     * Trigger AI-assisted document completeness review
     */
    reviewWithAI: protectedProcedure
      .input(z.object({ documentId: z.number(), documentType: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          const doc = await getDocumentById(input.documentId);
          if (!doc) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
          }

          // Run AI review
          const reviewResult = await reviewDocumentCompleteness(input.documentId, input.documentType);

          // Log audit event
          await database.insert(auditLogs).values({
            applicationId: doc.applicationId,
            userId: ctx.user.id,
            action: "document_ai_reviewed",
            details: JSON.stringify({
              documentId: input.documentId,
              isComplete: reviewResult.isComplete,
              confidence: reviewResult.confidence,
              missingElements: reviewResult.missingElements,
            }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          return reviewResult;
        } catch (error) {
          console.error("[Documents.reviewWithAI] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to review document" });
        }
      }),

    /**
     * Update document AI review status
     */
    updateAIReviewStatus: protectedProcedure
      .input(
        z.object({
          documentId: z.number(),
          status: z.enum(["pending", "approved", "flagged"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          const doc = await getDocumentById(input.documentId);
          if (!doc) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
          }

          const updated = await updateDocumentAIReview(input.documentId, input.status, input.notes);

          // Log audit event
          await database.insert(auditLogs).values({
            applicationId: doc.applicationId,
            userId: ctx.user.id,
            action: "document_ai_status_updated",
            details: JSON.stringify({
              documentId: input.documentId,
              status: input.status,
              notes: input.notes,
            }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          return updated;
        } catch (error) {
          console.error("[Documents.updateAIReviewStatus] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update document status" });
        }
      }),

    /**
     * Update document human review status (admin/paralegal only)
     */
    updateHumanReviewStatus: protectedProcedure
      .input(
        z.object({
          documentId: z.number(),
          status: z.enum(["pending", "approved", "rejected"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Only admins and paralegals can update human review status
        if (ctx.user.role !== "admin" && ctx.user.role !== "paralegal") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins and paralegals can update review status" });
        }

        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          const doc = await getDocumentById(input.documentId);
          if (!doc) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
          }

          const updated = await updateDocumentHumanReview(input.documentId, input.status, input.notes);

          // Log audit event
          await database.insert(auditLogs).values({
            applicationId: doc.applicationId,
            userId: ctx.user.id,
            action: "document_human_reviewed",
            details: JSON.stringify({
              documentId: input.documentId,
              status: input.status,
              notes: input.notes,
              reviewer: ctx.user.id,
            }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          return updated;
        } catch (error) {
          console.error("[Documents.updateHumanReviewStatus] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update document status" });
        }
      }),
  }),

  /**
   * Audit Logs router: compliance and audit trail
   */
  auditLogs: router({
    /**
     * Get audit logs for an application (admin/paralegal only)
     */
    list: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Only admins and paralegals can view audit logs
        if (ctx.user.role !== "admin" && ctx.user.role !== "paralegal") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only admins and paralegals can view audit logs" });
        }

        return await getAuditLogsByApplicationId(input.applicationId);
      }),
  }),

  /**
   * Eligibility router: handles Criminal Records Act eligibility checks
   */
  eligibility: router({
    /**
     * Check eligibility for record suspension
     */
    check: publicProcedure
      .input(
        z.object({
          offenses: z.array(
            z.object({
              type: z.string(),
              category: z.enum(["summary", "indictable", "hybrid", "schedule_1"]),
              convictionDate: z.date(),
              sentenceEndDate: z.date(),
              province: z.string(),
              isFirstOffense: z.boolean(),
            })
          ),
          applicationDate: z.date(),
          hasOutstandingCharges: z.boolean(),
          hasFailedToAppear: z.boolean(),
          hasViolatedConditions: z.boolean(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          // Map input categories to OffenseCategory enum
          const categoryMap: Record<string, OffenseCategory> = {
            summary: OffenseCategory.SUMMARY,
            indictable: OffenseCategory.INDICTABLE,
            hybrid: OffenseCategory.HYBRID,
            schedule_1: OffenseCategory.SCHEDULE_1,
          };

          const eligibilityInput: EligibilityCheckInput = {
            offenses: input.offenses.map(o => ({
              ...o,
              category: categoryMap[o.category] || OffenseCategory.SUMMARY,
            })),
            applicationDate: input.applicationDate,
            hasOutstandingCharges: input.hasOutstandingCharges,
            hasFailedToAppear: input.hasFailedToAppear,
            hasViolatedConditions: input.hasViolatedConditions,
          };

          const result = checkEligibility(eligibilityInput);

          // Note: Audit logs for eligibility checks without an application ID
          // would require a schema change. For now, we only log when there's an application context.
          // This is acceptable for the MVP as eligibility checks are typically done within the application flow.

          return result;
        } catch (error) {
          console.error("[Eligibility.check] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to check eligibility" });
        }
      }),
  }),

  /**
   * Fingerprints router: find RCMP-accredited fingerprint providers
   */
  fingerprints: router({
    /**
     * Find providers near a postal code
     */
    findNear: publicProcedure
      .input(
        z.object({
          postalCode: z.string(),
          maxDistance: z.number().optional().default(50),
          province: z.string().optional(),
        })
      )
      .query(({ input }) => {
        return findProvidersNearPostalCode(input.postalCode, input.maxDistance, input.province);
      }),

    /**
     * Find providers by province
     */
    findByProvince: publicProcedure
      .input(z.object({ province: z.string() }))
      .query(({ input }) => {
        return findProvidersByProvince(input.province);
      }),

    /**
     * Find providers by city
     */
    findByCity: publicProcedure
      .input(
        z.object({
          city: z.string(),
          province: z.string().optional(),
        })
      )
      .query(({ input }) => {
        return findProvidersByCity(input.city, input.province);
      }),

    /**
     * Get provider by ID
     */
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        return getProviderById(input.id);
      }),

    /**
     * Get all provinces with providers
     */
    getAllProvinces: publicProcedure.query(() => {
      return getAllProvinces();
    }),

    /**
     * Get provider statistics
     */
    getStatistics: publicProcedure.query(() => {
      return getProviderStatistics();
    }),
  }),
});

export type AppRouter = typeof appRouter;
