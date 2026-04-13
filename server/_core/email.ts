import { Resend } from "resend";

/**
 * Email Notification Service
 *
 * For MVP testing: Uses Resend's onboarding domain (onboarding@resend.dev)
 * For production: Set RESEND_FROM_EMAIL to your verified domain (e.g., noreply@pardonpath.ca)
 *
 * Setup instructions:
 * 1. Sign up for Resend (https://resend.com)
 * 2. Verify your domain in Resend dashboard
 * 3. Set RESEND_FROM_EMAIL environment variable
 * 4. Test with sendTestEmail() before going live
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const appUrl = process.env.VITE_APP_URL || "https://pardonpath.ca";

// Must match status-manager.ts MilestoneType exactly
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

interface EmailContext {
  applicantName: string;
  applicantEmail: string;
  applicationId: string;
  milestoneType: MilestoneType;
  additionalData?: Record<string, any>;
}

const emailTemplates: Record<MilestoneType, (ctx: EmailContext) => { subject: string; html: string }> = {
  intake_started: (ctx) => ({
    subject: "Welcome to PardonPath - Your Record Suspension Journey Begins",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome, ${ctx.applicantName}!</h2>
        <p>Your record suspension application has been started. Application ID: <strong>${ctx.applicationId}</strong></p>
        <p>Next step: Complete your eligibility assessment. This typically takes 5-10 minutes.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Your Application</a></p>
        <p>Questions? Contact us at support@pardonpath.ca</p>
      </div>
    `,
  }),

  intake_completed: (ctx) => ({
    subject: "Eligibility Assessment Complete",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Eligibility Assessment Complete ✓</h2>
        <p>Congratulations, ${ctx.applicantName}!</p>
        <p>Your eligibility assessment is complete. Next step: Upload your supporting documents.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Upload Documents</a></p>
      </div>
    `,
  }),

  documents_submitted: (ctx) => ({
    subject: "Documents Received - We're Reviewing Them Now",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Documents Received ✓</h2>
        <p>Thank you for submitting your documents, ${ctx.applicantName}.</p>
        <p>We've received your submission and are now reviewing them for completeness. This typically takes 1-2 business days.</p>
        <p>You'll receive an update as soon as our review is complete.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Check Status</a></p>
      </div>
    `,
  }),

  documents_approved: (ctx) => ({
    subject: "Documents Approved ✓",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Documents Approved ✓</h2>
        <p>Great news, ${ctx.applicantName}!</p>
        <p>Your documents have been reviewed and approved. We're now preparing your application forms.</p>
        <p>You'll receive an update as soon as the forms are ready for submission.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Check Status</a></p>
      </div>
    `,
  }),

  form_generated: (ctx) => ({
    subject: "Application Form Generated",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Form Ready ✓</h2>
        <p>Your Parole Board of Canada application form has been generated, ${ctx.applicantName}.</p>
        <p>The form is ready for review and will be submitted to the Parole Board of Canada.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Form</a></p>
      </div>
    `,
  }),

  form_submitted: (ctx) => ({
    subject: "Application Submitted to Parole Board",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Submitted ✓</h2>
        <p>Your application has been submitted to the Parole Board of Canada, ${ctx.applicantName}.</p>
        <p>You can track the status of your application in your dashboard. The Parole Board typically reviews applications within 6-12 months.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Application</a></p>
      </div>
    `,
  }),

  under_review: (ctx) => ({
    subject: "Your Application is Under Review",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Under Review</h2>
        <p>Your record suspension application is now under review by the Parole Board of Canada, ${ctx.applicantName}.</p>
        <p>The review process typically takes 6-12 months. You can check the status of your application anytime in your dashboard.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Check Status</a></p>
      </div>
    `,
  }),

  decision_received: (ctx) => ({
    subject: "Decision Received from Parole Board of Canada",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Decision Received 📋</h2>
        <p>Hello ${ctx.applicantName},</p>
        <p>The Parole Board of Canada has made a decision on your record suspension application.</p>
        <p>Log in to your dashboard to view the official decision and next steps.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Decision</a></p>
      </div>
    `,
  }),

  approved: (ctx) => ({
    subject: "🎉 Your Record Suspension Has Been APPROVED!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations! Your Application is APPROVED ✓</h2>
        <p>Excellent news, ${ctx.applicantName}!</p>
        <p>The Parole Board of Canada has approved your record suspension application. Your criminal record will be sealed and removed from public access.</p>
        <p>This is a significant milestone. You can now move forward with a clean slate.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Official Decision</a></p>
        <p>Thank you for using PardonPath. We wish you all the best.</p>
      </div>
    `,
  }),

  rejected: (ctx) => ({
    subject: "Update on Your Record Suspension Application",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Application Status Update</h2>
        <p>Hello ${ctx.applicantName},</p>
        <p>The Parole Board of Canada has reviewed your record suspension application.</p>
        <p>Unfortunately, your application was not approved at this time. However, you may be eligible to reapply in the future.</p>
        <p>Please log in to view the detailed decision and feedback from the Parole Board.</p>
        <p><a href="${appUrl}/dashboard" style="background-color: #C41E3A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Decision</a></p>
        <p>Our team is available to discuss next steps. Contact us at support@pardonpath.ca</p>
      </div>
    `,
  }),
};

export async function sendMilestoneEmail(ctx: EmailContext): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const template = emailTemplates[ctx.milestoneType];
    if (!template) {
      return { success: false, error: `Unknown milestone type: ${ctx.milestoneType}` };
    }

    const { subject, html } = template(ctx);

    // Use Resend's onboarding domain for MVP testing
    // For production, configure your own domain in Resend dashboard and set RESEND_FROM_EMAIL
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const response = await resend.emails.send({
      from: `PardonPath <${fromEmail}>`,
      to: ctx.applicantEmail,
      subject,
      html,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function sendTestEmail(email: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    const response = await resend.emails.send({
      from: `PardonPath <${fromEmail}>`,
      to: email,
      subject: "PardonPath Test Email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Test Email from PardonPath</h2>
          <p>If you're seeing this, email notifications are working correctly!</p>
          <p>This is a test email to verify that our notification system is functioning.</p>
        </div>
      `,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true, messageId: response.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}
