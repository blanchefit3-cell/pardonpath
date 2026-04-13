import { storagePut, storageGet } from "./storage";
import { getDb } from "./db";
import { documents, Document as SchemaDocument } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Document types from schema
 */
export enum DocumentType {
  COURT_RECORD = "court_record",
  POLICE_CERTIFICATE = "police_certificate",
  ID_DOCUMENT = "id_document",
  OTHER = "other",
}

/**
 * Upload a document to S3 and store metadata in database
 */
export async function uploadDocument(
  applicationId: number,
  documentType: DocumentType,
  filename: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<SchemaDocument> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate unique S3 key with application ID and timestamp
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const fileKey = `applications/${applicationId}/documents/${timestamp}-${randomSuffix}-${filename}`;

  // Upload to S3
  const { url: fileUrl } = await storagePut(fileKey, fileBuffer, mimeType);

  // Store metadata in database
  const result = await db.insert(documents).values({
    applicationId,
    documentType,
    fileName: filename,
    fileUrl,
    fileKey,
    fileSizeBytes: fileBuffer.length,
    mimeType,
    uploadedAt: new Date(),
    aiReviewStatus: "pending",
    createdAt: new Date(),
  });

  // Note: Drizzle ORM doesn't return insertId directly
  // We'll fetch the most recently uploaded document for this application
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.applicationId, applicationId))
    .orderBy(documents.uploadedAt)
    .limit(1);

  if (!rows.length) throw new Error("Failed to retrieve uploaded document");

  return rows[0];
}

/**
 * Get a document by ID
 */
export async function getDocumentById(documentId: number): Promise<SchemaDocument | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Get all documents for an application
 */
export async function getDocumentsByApplicationId(applicationId: number): Promise<SchemaDocument[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.applicationId, applicationId))
    .orderBy(documents.uploadedAt);

  return rows;
}

/**
 * Update document AI review status
 */
export async function updateDocumentAIReview(
  documentId: number,
  status: "pending" | "approved" | "flagged",
  notes?: string
): Promise<SchemaDocument | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(documents)
    .set({
      aiReviewStatus: status,
      aiReviewNotes: notes,
    })
    .where(eq(documents.id, documentId));

  return getDocumentById(documentId);
}

/**
 * Update document human review status
 */
export async function updateDocumentHumanReview(
  documentId: number,
  status: "pending" | "approved" | "rejected",
  notes?: string
): Promise<SchemaDocument | null> {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(documents)
    .set({
      humanReviewStatus: status,
      humanReviewNotes: notes,
    })
    .where(eq(documents.id, documentId));

  return getDocumentById(documentId);
}

/**
 * Get a presigned URL for downloading a document
 */
export async function getDocumentDownloadUrl(documentId: number): Promise<string | null> {
  const doc = await getDocumentById(documentId);
  if (!doc) return null;

  const { url } = await storageGet(doc.fileKey);
  return url;
}

/**
 * Get document checklist for a jurisdiction
 */
export function getDocumentChecklist(province: string): DocumentType[] {
  // Base documents required for all provinces
  const baseDocuments = [DocumentType.COURT_RECORD, DocumentType.POLICE_CERTIFICATE, DocumentType.ID_DOCUMENT];

  // Jurisdiction-specific additions (could be expanded)
  const provinceSpecific: Record<string, DocumentType[]> = {
    ON: [], // Ontario - base docs only
    BC: [], // British Columbia - base docs only
    AB: [], // Alberta - base docs only
    MB: [], // Manitoba - base docs only
    SK: [], // Saskatchewan - base docs only
    QC: [], // Quebec - base docs only
    NB: [], // New Brunswick - base docs only
    NS: [], // Nova Scotia - base docs only
    PE: [], // Prince Edward Island - base docs only
    NL: [], // Newfoundland and Labrador - base docs only
    NT: [], // Northwest Territories - base docs only
    NU: [], // Nunavut - base docs only
    YT: [], // Yukon - base docs only
  };

  const additional = provinceSpecific[province] || [];
  return [...baseDocuments, ...additional];
}

/**
 * Check if all required documents have been uploaded
 */
export async function checkDocumentCompletion(applicationId: number, province: string): Promise<{
  complete: boolean;
  uploaded: DocumentType[];
  missing: DocumentType[];
}> {
  const required = getDocumentChecklist(province);
  const uploaded = await getDocumentsByApplicationId(applicationId);
  const uploadedTypes = uploaded.map(d => d.documentType as DocumentType);

  const missing = required.filter(type => !uploadedTypes.includes(type));

  return {
    complete: missing.length === 0,
    uploaded: uploadedTypes,
    missing,
  };
}
