#!/usr/bin/env node

import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xa3RudnFvc2hobnNqZ2lsdHNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAyNTA4NCwiZXhwIjoyMDkxNjAxMDg0fQ.7LCpts_wTJrzVatfSMfOJ8E5VuhDF3dqxYhQWI5ES6k';

// Construct the connection string for PostgreSQL
const connectionString = `postgresql://postgres.mqktnvqoshhnsjgiltso:${serviceRoleKey}@db.mqktnvqoshhnsjgiltso.supabase.co:5432/postgres`;

async function applyMigration() {
  try {
    console.log('🔗 Connecting to Supabase PostgreSQL...');
    const sql = postgres(connectionString, {
      ssl: 'require',
      max: 1,
    });

    // Read the migration SQL file
    const migrationPath = resolve(process.cwd(), 'drizzle/0000_yielding_satana.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📝 Applying migration...');
    
    // Split by statement-breakpoint and execute each statement
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        try {
          console.log(`  [${i + 1}/${statements.length}] Executing...`);
          await sql.unsafe(stmt);
        } catch (error) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`  [${i + 1}/${statements.length}] ⚠️  Already exists, skipping`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log('✅ Migration applied successfully!');
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

applyMigration();
