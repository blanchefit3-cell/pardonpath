import { describe, it, expect } from "vitest";

/**
 * Validates Supabase connectivity using the REST API.
 * Direct TCP connections to db.*.supabase.co are blocked in the sandbox environment.
 * In production (deployed app), SUPABASE_DB_URL is used for direct PostgreSQL connections.
 */
describe("Supabase Connectivity", () => {
  it("should connect to Supabase REST API and verify tables exist", async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    expect(supabaseUrl, "SUPABASE_URL must be set").toBeTruthy();
    expect(supabaseKey, "SUPABASE_ANON_KEY must be set").toBeTruthy();

    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=1`, {
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    // 200 = table exists and accessible, 401 = auth issue, 404 = table missing
    expect([200, 406], `Unexpected status: ${response.status}`).toContain(response.status);
    console.log(`✅ Supabase REST API reachable. Status: ${response.status}`);
  }, 10000);

  it("should have SUPABASE_DB_URL configured for production database connections", () => {
    const dbUrl = process.env.SUPABASE_DB_URL;
    expect(dbUrl, "SUPABASE_DB_URL must be set for production DB connections").toBeTruthy();
    expect(dbUrl).toMatch(/^postgresql:\/\//);
    expect(dbUrl).toContain("supabase");
    console.log("✅ SUPABASE_DB_URL is configured correctly");
  });
});
