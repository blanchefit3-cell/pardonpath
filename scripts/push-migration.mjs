import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function pushMigration() {
  const serviceRoleKey = process.argv[2];
  
  if (!serviceRoleKey) {
    console.error('❌ Service Role Key not provided');
    console.error('Usage: node push-migration.mjs <SERVICE_ROLE_KEY>');
    process.exit(1);
  }

  console.log('🔄 Connecting to Supabase...');
  
  const connection = await mysql.createConnection({
    host: 'mqktnvqoshhnsjgiltso.supabase.co',
    user: 'postgres',
    password: serviceRoleKey,
    database: 'postgres',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });

  try {
    console.log('✅ Connected to Supabase');
    
    const sqlFile = path.join(__dirname, '../drizzle/0002_faithful_raider.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by statement-breakpoint and execute each statement
    const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`);
      try {
        await connection.execute(statement);
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Table already exists (skipping)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('🎉 Milestones table is now available in Supabase');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   → Invalid Service Role Key');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   → Cannot connect to Supabase (check host/port)');
    }
    process.exit(1);
  } finally {
    await connection.end();
  }
}

pushMigration();
