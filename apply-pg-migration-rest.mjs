import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function applyMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY not set");
    process.exit(1);
  }

  try {
    // Read migration file
    const migrationSql = fs.readFileSync(
      path.join(__dirname, "drizzle/supabase-migration.sql"),
      "utf-8"
    );

    // Split by semicolons and execute each statement
    const statements = migrationSql
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ sql: statement }),
        });

        if (!response.ok) {
          const error = await response.text();
          if (error.includes("already exists")) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
          } else {
            throw new Error(error);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (error) {
        if (error.message.includes("already exists")) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          // Continue with next statement instead of throwing
        }
      }
    }

    console.log("✅ Migration process completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

applyMigration();
