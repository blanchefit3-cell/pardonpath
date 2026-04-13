import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend Email Integration", () => {
  const resendApiKey = process.env.RESEND_API_KEY;

  it("should have RESEND_API_KEY configured", () => {
    expect(resendApiKey).toBeDefined();
    expect(resendApiKey).toBeTruthy();
  });

  it("should initialize Resend client with valid API key", () => {
    const resend = new Resend(resendApiKey);
    expect(resend).toBeDefined();
  });

  it("should validate API key format", () => {
    // Resend API keys start with 're_'
    expect(resendApiKey).toMatch(/^re_/);
  });
});
