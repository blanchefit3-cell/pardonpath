import mysql from "mysql2/promise.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL environment variable not set");
    process.exit(1);
  }

  console.log("🔄 Connecting to database...");

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✅ Connected to database");

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "../drizzle/0001_graceful_wild_child.sql");
    const migrationSql = fs.readFileSync(migrationPath, "utf-8");

    // Split by statement breakpoints and execute each statement
    const statements = migrationSql
      .split("--> statement-breakpoint")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        await connection.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Ignore "table already exists" errors
        if (error.code === "ER_TABLE_EXISTS_ERROR" || error.message.includes("already exists")) {
          console.log(`⚠️  Statement ${i + 1} skipped (table already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log("✅ Migration completed successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

applyMigration();
