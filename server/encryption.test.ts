import { describe, expect, it } from "vitest";
import { encryptField, decryptField } from "./_core/encryption";

describe("Field-Level Encryption", () => {
  it("should encrypt and decrypt a SIN", () => {
    const originalSIN = "123-456-789";
    const encrypted = encryptField(originalSIN);

    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe("string");

    // Verify it's JSON-encoded
    const payload = JSON.parse(encrypted);
    expect(payload).toHaveProperty("iv");
    expect(payload).toHaveProperty("authTag");
    expect(payload).toHaveProperty("ciphertext");

    // Decrypt and verify
    const decrypted = decryptField(encrypted);
    expect(decrypted).toBe(originalSIN);
  });

  it("should encrypt and decrypt a driver's license", () => {
    const originalLicense = "D1234567";
    const encrypted = encryptField(originalLicense);
    const decrypted = decryptField(encrypted);

    expect(decrypted).toBe(originalLicense);
  });

  it("should encrypt and decrypt offense details", () => {
    const originalDetails = "Schedule 1 offense - Theft under $5000 - 2020-01-15";
    const encrypted = encryptField(originalDetails);
    const decrypted = decryptField(encrypted);

    expect(decrypted).toBe(originalDetails);
  });

  it("should produce different ciphertexts for the same plaintext (due to random IV)", () => {
    const plaintext = "test data";
    const encrypted1 = encryptField(plaintext);
    const encrypted2 = encryptField(plaintext);

    // Both should decrypt to the same value
    expect(decryptField(encrypted1)).toBe(plaintext);
    expect(decryptField(encrypted2)).toBe(plaintext);

    // But the encrypted values should be different (random IV)
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("should handle special characters and unicode", () => {
    const originalText = "Offense: Assault & Battery (Français: Agression)";
    const encrypted = encryptField(originalText);
    const decrypted = decryptField(encrypted);

    expect(decrypted).toBe(originalText);
  });

  it("should fail to decrypt corrupted data", () => {
    const corruptedData = JSON.stringify({
      iv: "aW52YWxpZA==",
      authTag: "aW52YWxpZA==",
      ciphertext: "corrupted",
    });

    expect(() => decryptField(corruptedData)).toThrow();
  });
});
