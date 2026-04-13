/**
 * Platform-agnostic notification service for PardonPath.
 *
 * This module abstracts notification delivery so the app is not tied to any
 * specific platform (Manus, Resend, SendGrid, etc.). Configure the provider
 * via environment variables:
 *
 *   EMAIL_PROVIDER=resend|sendgrid|smtp|manus (default: manus in dev, resend in prod)
 *   RESEND_API_KEY=re_...
 *   EMAIL_FROM=noreply@pardonpath.ca
 *   ADMIN_EMAIL=admin@pardonpath.ca
 */

interface NotifyOptions {
  title: string;
  content: string;
  to?: string; // recipient email; defaults to ADMIN_EMAIL
}

interface NotifyResult {
  success: boolean;
  provider: string;
  error?: string;
}

/**
 * Send an internal operational notification (e.g., new application, form generated).
 * Routes to the configured email provider or falls back to console logging in dev.
 */
export async function notify(opts: NotifyOptions): Promise<NotifyResult> {
  const provider = process.env.EMAIL_PROVIDER || "manus";

  try {
    switch (provider) {
      case "resend":
        return await notifyViaResend(opts);
      case "manus":
        return await notifyViaManus(opts);
      default:
        // Fallback: log to console (useful in local dev without credentials)
        console.log(`[Notify] ${opts.title}: ${opts.content}`);
        return { success: true, provider: "console" };
    }
  } catch (error: any) {
    console.error(`[Notify] Failed to send via ${provider}:`, error.message);
    return { success: false, provider, error: error.message };
  }
}

/**
 * Send via Resend (https://resend.com) — recommended for production.
 * Requires: RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAIL
 */
async function notifyViaResend(opts: NotifyOptions): Promise<NotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "noreply@pardonpath.ca";
  const to = opts.to || process.env.ADMIN_EMAIL;

  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  if (!to) throw new Error("No recipient email configured (set ADMIN_EMAIL or pass opts.to)");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: opts.title,
      html: `<p>${opts.content.replace(/\n/g, "<br>")}</p>`,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error ${response.status}: ${err}`);
  }

  return { success: true, provider: "resend" };
}

/**
 * Send via Manus built-in notification (platform-specific, used in Manus-hosted deployments).
 * Falls back gracefully if Manus platform is not available.
 */
async function notifyViaManus(opts: NotifyOptions): Promise<NotifyResult> {
  try {
    // Dynamically import to avoid hard dependency on Manus platform
    const { notifyOwner } = await import("./_core/notification");
    const delivered = await notifyOwner({ title: opts.title, content: opts.content });
    return { success: delivered, provider: "manus" };
  } catch {
    // Manus platform not available — log to console
    console.log(`[Notify:manus] ${opts.title}: ${opts.content}`);
    return { success: true, provider: "manus-console" };
  }
}

/**
 * Notify admin of a new application submission.
 */
export async function notifyNewApplication(applicationId: number, applicantName: string): Promise<void> {
  await notify({
    title: "New PardonPath Application Submitted",
    content: `Applicant ${applicantName} has submitted a new application (ID: ${applicationId}). Please review in the admin dashboard.`,
  });
}

/**
 * Notify admin of a completed form generation.
 */
export async function notifyFormGenerated(applicationId: number, formUrl: string): Promise<void> {
  await notify({
    title: "PBC Form Generated",
    content: `A PBC form has been generated for application ID ${applicationId}.\nForm URL: ${formUrl}`,
  });
}

/**
 * Notify admin of a document upload requiring review.
 */
export async function notifyDocumentUploaded(
  applicationId: number,
  documentType: string,
  fileName: string
): Promise<void> {
  await notify({
    title: "Document Uploaded — Review Required",
    content: `A new ${documentType} document "${fileName}" has been uploaded for application ID ${applicationId}. AI review is pending.`,
  });
}
