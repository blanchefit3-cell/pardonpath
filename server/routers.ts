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

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
     * Create a document record after S3 upload
     */
    create: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          documentType: z.enum(["court_record", "police_certificate", "id_document", "other"]),
          fileName: z.string().min(1),
          fileUrl: z.string().url(),
          fileKey: z.string().min(1),
          fileSizeBytes: z.number().optional(),
          mimeType: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        }

        try {
          const result = await database.insert(auditLogs).values({
            applicationId: input.applicationId,
            userId: ctx.user.id,
            action: "document_uploaded",
            details: JSON.stringify({
              documentType: input.documentType,
              fileName: input.fileName,
              fileSize: input.fileSizeBytes,
            }),
            ipAddress: ctx.req.ip || "unknown",
            userAgent: ctx.req.headers["user-agent"] || "unknown",
          });

          const documentId = (result as any).insertId as number;

          return { id: documentId, status: "pending" };
        } catch (error) {
          console.error("[Documents.create] Error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create document record" });
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
});

export type AppRouter = typeof appRouter;
