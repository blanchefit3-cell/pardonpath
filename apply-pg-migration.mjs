import postgres from "postgres";

async function applyMigration() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY not set");
    process.exit(1);
  }

  // Extract host from URL
  const url = new URL(supabaseUrl);
  const host = url.hostname;
  const dbName = "postgres";

  const connectionString = `postgres://postgres.${host.split('.')[0]}:${supabaseKey}@${host}:5432/${dbName}`;

  try {
    const sql = postgres(connectionString);
    console.log("✅ Connected to Supabase PostgreSQL");

    // Read migration file
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    
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
        await sql.unsafe(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        if (error.message.includes("already exists")) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
        } else {
          console.error(`❌ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log("✅ Migration completed successfully!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

applyMigration();
