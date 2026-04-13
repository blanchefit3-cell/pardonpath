import { describe, it, expect } from "vitest";
import { sendMilestoneEmail, sendTestEmail } from "./_core/email";

describe("Email Notification Service", () => {
  // Use a valid test email - Resend requires real email addresses
  const testEmail = "delivered@resend.dev";

  it("should send intake_started milestone email", async () => {
    const result = await sendMilestoneEmail({
      applicantName: "John Doe",
      applicantEmail: testEmail,
      applicationId: "APP-001",
      milestoneType: "intake_started",
    });

    if (!result.success) {
      console.error("Email send failed:", result.error);
    }
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should send approved milestone email", async () => {
    const result = await sendMilestoneEmail({
      applicantName: "Jane Smith",
      applicantEmail: testEmail,
      applicationId: "APP-002",
      milestoneType: "approved",
    });

    if (!result.success) {
      console.error("Email send failed:", result.error);
    }
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should send test email", async () => {
    const result = await sendTestEmail(testEmail);

    if (!result.success) {
      console.error("Test email send failed:", result.error);
    }
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should handle invalid milestone type", async () => {
    const result = await sendMilestoneEmail({
      applicantName: "Test User",
      applicantEmail: testEmail,
      applicationId: "APP-003",
      milestoneType: "invalid_milestone" as any,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toContain("Unknown milestone type");
  });

  it("should send all 10 milestone types without errors", async () => {
    const milestoneTypes = [
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
    ] as const;

    for (const milestone of milestoneTypes) {
      const result = await sendMilestoneEmail({
        applicantName: "Test User",
        applicantEmail: testEmail,
        applicationId: "APP-TEST",
        milestoneType: milestone,
      });

      if (!result.success) {
        console.error(`Failed to send ${milestone}:`, result.error);
      }
      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    }
  });
});
