import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { generatePBCForm, validateFormData, type FormFieldMapping } from "./form-generator";
import { TRPCError } from "@trpc/server";
import { logAuditEvent } from "./db";
import { auditLogs } from "../drizzle/schema";

const FormFieldSchema = z.object({
  applicantFirstName: z.string().min(1, "First name required"),
  applicantLastName: z.string().min(1, "Last name required"),
  applicantDateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  applicantSIN: z.string().regex(/^\d{9}$/, "SIN must be 9 digits"),
  applicantGender: z.enum(["M", "F", "X"]),
  applicantEmail: z.string().email("Invalid email"),
  applicantPhone: z.string().min(10, "Invalid phone number"),
  applicantAddress: z.string().min(5, "Address required"),
  applicantCity: z.string().min(2, "City required"),
  applicantProvince: z.string().length(2, "Province code required"),
  applicantPostalCode: z.string().regex(/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/, "Invalid postal code"),
  offenseType: z.string().min(1, "Offense type required"),
  offenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date format: YYYY-MM-DD"),
  sentenceLength: z.string().min(1, "Sentence length required"),
  sentenceType: z.enum(["Custody", "Conditional Sentence", "Probation", "Fine", "Other"]),
  employmentStatus: z.enum(["Employed", "Self-Employed", "Unemployed", "Student", "Retired"]),
  employerName: z.string().optional(),
  jobTitle: z.string().optional(),
  reference1Name: z.string().optional(),
  reference1Relationship: z.string().optional(),
  reference1Phone: z.string().optional(),
  reference2Name: z.string().optional(),
  reference2Relationship: z.string().optional(),
  reference2Phone: z.string().optional(),
});

export const formsRouter = router({
  /**
   * Generate a PBC Record Suspension Application Form PDF
   */
  generate: protectedProcedure
    .input(
      z.object({
        applicationId: z.number().positive("Invalid application ID"),
        formData: FormFieldSchema,
        templateUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate form data
        const validation = validateFormData(input.formData);
        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Form validation failed: ${validation.errors.join(", ")}`,
          });
        }

        // Generate PDF
        const { url, fileKey } = await generatePBCForm(
          input.formData,
          input.templateUrl
        );

        // Audit log
        await logAuditEvent({
          applicationId: input.applicationId,
          userId: ctx.user.id,
          action: "form_generated",
          details: {
            formType: "pbc_record_suspension",
            fileKey,
            applicantName: `${input.formData.applicantFirstName} ${input.formData.applicantLastName}`,
            offenseType: input.formData.offenseType,
          },
          ipAddress: ctx.req.ip || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });

        return {
          success: true,
          url,
          fileKey,
          message: "PBC form generated successfully",
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Audit log for failure
        await logAuditEvent({
          applicationId: input.applicationId,
          userId: ctx.user.id,
          action: "form_generation_failed",
          details: {
            formType: "pbc_record_suspension",
            error: errorMessage,
          },
          ipAddress: ctx.req.ip || "unknown",
          userAgent: ctx.req.headers["user-agent"] || "unknown",
        });

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate form: ${errorMessage}`,
        });
      }
    }),

  /**
   * Validate form data without generating PDF
   */
  validate: protectedProcedure
    .input(z.object({ formData: FormFieldSchema }))
    .query(({ input }) => {
      const validation = validateFormData(input.formData);
      return {
        valid: validation.valid,
        errors: validation.errors,
      };
    }),
});
