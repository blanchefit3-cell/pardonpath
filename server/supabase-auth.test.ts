import { describe, it, expect } from "vitest";
import { supabaseAdmin } from "./_core/supabase-auth";

describe("Supabase Auth Integration", () => {
  it("should verify that Supabase Admin client is properly initialized", async () => {
    // This test validates that SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
    // by attempting to list auth users (a lightweight admin operation)
    expect(supabaseAdmin).toBeDefined();

    try {
      // Try to call a simple admin operation to verify credentials
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        throw new Error(`Supabase Auth failed: ${error.message}`);
      }

      // If we get here, the credentials are valid
      expect(data).toBeDefined();
      expect(Array.isArray(data.users)).toBe(true);
    } catch (error: any) {
      // If the error is about missing credentials, that's a setup issue
      if (error.message?.includes("supabaseKey is required")) {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY is not set. Please provide the Service Role Key from your Supabase dashboard."
        );
      }
      // Other errors (like auth failures) indicate invalid credentials
      throw error;
    }
  });

  it("should extract Bearer token correctly", async () => {
    const { extractBearerToken } = await import("./_core/supabase-auth");

    expect(extractBearerToken("Bearer abc123")).toBe("abc123");
    expect(extractBearerToken("Bearer ")).toBe(null);
    expect(extractBearerToken("Basic abc123")).toBe(null);
    expect(extractBearerToken(undefined)).toBe(null);
    expect(extractBearerToken("")).toBe(null);
  });
});
