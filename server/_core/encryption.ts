import crypto from "crypto";

/**
 * Field-level encryption for sensitive data (SIN, driver's license, offense details)
 * Uses AES-256-GCM for authenticated encryption
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

if (!ENCRYPTION_KEY) {
  console.warn("[Encryption] ENCRYPTION_KEY not set. Encryption will fail at runtime.");
}

/**
 * Encrypt a sensitive string field
 * Returns a JSON string containing IV, authTag, and ciphertext (all base64-encoded)
 */
export function encryptField(plaintext: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  const payload = {
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: encrypted,
  };

  return JSON.stringify(payload);
}

/**
 * Decrypt a sensitive string field
 * Expects a JSON string containing IV, authTag, and ciphertext (all base64-encoded)
 */
export function decryptField(encryptedPayload: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  try {
    const payload = JSON.parse(encryptedPayload);
    const iv = Buffer.from(payload.iv, "base64");
    const authTag = Buffer.from(payload.authTag, "base64");
    const ciphertext = payload.ciphertext;

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Encryption] Decryption failed:", error);
    throw new Error("Failed to decrypt field");
  }
}

/**
 * Helper to generate a random encryption key (for setup)
 * Run this once and store the output in ENCRYPTION_KEY env var
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
