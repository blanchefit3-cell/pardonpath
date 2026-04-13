import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.SUPABASE_HOST || 'mqktnvqoshhnsjgiltso.supabase.co',
    user: process.env.SUPABASE_USER || 'postgres',
    password: process.env.SUPABASE_PASSWORD,
    database: process.env.SUPABASE_DB || 'postgres',
    port: 3306,
  });

  try {
    const sqlFile = path.join(__dirname, '../drizzle/0002_faithful_raider.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
    
    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await connection.execute(statement);
    }
    
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigration();
