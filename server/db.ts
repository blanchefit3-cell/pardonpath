import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  InsertUser,
  users,
  applicants,
  applications,
  documents,
  auditLogs,
  notifications,
  payments,
  partners,
  milestones,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _client: postgres.Sql | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
// Prefers SUPABASE_DB_URL (PostgreSQL) over DATABASE_URL (platform-managed MySQL).
export async function getDb() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!_db && dbUrl) {
    try {
      _client = postgres(dbUrl, { ssl: dbUrl.includes('supabase') ? 'require' : undefined });
      _db = drizzle(_client);
      console.log(`[Database] Connected via ${process.env.SUPABASE_DB_URL ? 'SUPABASE_DB_URL' : 'DATABASE_URL'}`);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // PostgreSQL upsert using ON CONFLICT
    await db
      .insert(users)
      .values(values)
      .onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<typeof users.$inferSelect | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get user by Supabase ID (UUID)
 * For Supabase Auth integration: openId is the Supabase user ID
 */
export async function getUserBySupabaseId(supabaseId: string): Promise<typeof users.$inferSelect | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, supabaseId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Application queries
 */
export async function getApplicationById(applicationId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getApplicationsByApplicantId(applicantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(applications)
    .where(eq(applications.applicantId, applicantId))
    .orderBy(desc(applications.createdAt));
}

export async function createApplication(data: typeof applications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(applications).values(data);
  return result;
}

export async function updateApplicationStatus(
  applicationId: number,
  status: typeof applications.$inferSelect["status"]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(applications)
    .set({ status, updatedAt: new Date() })
    .where(eq(applications.id, applicationId));
}

/**
 * Document queries
 */
export async function getDocumentsByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(documents)
    .where(eq(documents.applicationId, applicationId))
    .orderBy(desc(documents.uploadedAt));
}

export async function createDocument(data: typeof documents.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(documents).values(data);
  return result;
}

export async function updateDocumentReviewStatus(
  documentId: number,
  aiReviewStatus: typeof documents.$inferSelect["aiReviewStatus"],
  aiReviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(documents)
    .set({ aiReviewStatus, aiReviewNotes })
    .where(eq(documents.id, documentId));
}

/**
 * Audit log queries
 */
export async function logAuditEvent(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) {
    console.warn("[Audit] Cannot log event: database not available");
    return;
  }

  try {
    await db.insert(auditLogs).values(data);
  } catch (error) {
    console.error("[Audit] Failed to log event:", error);
  }
}

export async function getAuditLogsByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.applicationId, applicationId))
    .orderBy(desc(auditLogs.timestamp));
}

/**
 * Notification queries
 */
export async function createNotification(data: typeof notifications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(data);
  return result;
}

export async function updateNotificationStatus(
  notificationId: number,
  status: typeof notifications.$inferSelect["status"],
  externalId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(notifications)
    .set({ status, externalId, sentAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

/**
 * Payment queries
 */
export async function createPayment(data: typeof payments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(payments).values(data);
  return result;
}

export async function getPaymentByStripeId(stripePaymentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(payments)
    .where(eq(payments.stripePaymentId, stripePaymentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(
  paymentId: number,
  status: typeof payments.$inferSelect["status"],
  receiptUrl?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(payments)
    .set({ status, receiptUrl, updatedAt: new Date() })
    .where(eq(payments.id, paymentId));
}

/**
 * Partner queries
 */
export async function getPartnerByUserId(userId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(partners)
    .where(eq(partners.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getPartnerByApiKey(apiKey: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(partners)
    .where(eq(partners.apiKey, apiKey))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createPartner(data: typeof partners.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(partners).values(data);
  return result;
}
