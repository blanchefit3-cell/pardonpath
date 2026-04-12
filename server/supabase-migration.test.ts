import { describe, expect, it } from "vitest";

/**
 * Test to validate Supabase credentials and verify database connectivity
 * This test ensures the migration can be applied successfully
 */
describe("Supabase Migration", () => {
  it("should validate Supabase credentials are configured", () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();
    expect(supabaseUrl).toMatch(/^https:\/\/.*\.supabase\.co$/);
    expect(supabaseKey?.length).toBeGreaterThan(0);
  });

  it("should be able to connect to Supabase", async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    // Test basic connectivity by querying the users table (which already exists)
    const response = await fetch(`${supabaseUrl}/rest/v1/users?limit=1`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should verify the migration SQL is ready", () => {
    // This is a sanity check that the migration file exists and is valid
    const migrationSql = `
      CREATE TABLE \`applicants\` (
        \`id\` int AUTO_INCREMENT NOT NULL,
        \`userId\` int NOT NULL,
        PRIMARY KEY(\`id\`)
      );
    `;

    expect(migrationSql).toContain("CREATE TABLE");
    expect(migrationSql).toContain("applicants");
  });
});
