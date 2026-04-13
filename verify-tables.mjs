import mysql from "mysql2/promise.js";

async function verifyTables() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }

  try {
    const connection = await mysql.createConnection(databaseUrl);
    console.log("✅ Connected to database");

    // Query to show all tables
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
    );

    console.log("\n📋 Tables in database:");
    if (tables.length === 0) {
      console.log("❌ No tables found!");
    } else {
      tables.forEach((table) => {
        console.log(`  ✅ ${table.TABLE_NAME}`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

verifyTables();
