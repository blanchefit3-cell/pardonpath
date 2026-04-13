#!/usr/bin/env node

/**
 * Apply Drizzle migrations directly to Supabase PostgreSQL
 * Usage: node apply-migration-direct.mjs [migration-file]
 */

import fs from "fs";
import path from "path";
import postgres from "postgres";

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ ERROR: SUPABASE_DB_URL or DATABASE_URL environment variable is required");
  process.exit(1);
}

const migrationFile = process.argv[2] || "drizzle/0001_breezy_silhouette.sql";

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, "utf-8");

// Split SQL statements by --> statement-breakpoint
const statements = sql
  .split("-->")
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt && !stmt.startsWith("statement-breakpoint"));

console.log(`📋 Found ${statements.length} SQL statements to execute`);

async function applyMigration() {
  const client = postgres(dbUrl, { ssl: dbUrl.includes("supabase") ? "require" : false });

  try {
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      try {
        await client.unsafe(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error.message);
        // Continue with next statement
      }
    }
    console.log("✅ Migration process completed!");
  } finally {
    await client.end();
  }
}

applyMigration().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
