import { describe, expect, it } from "vitest";
import { validateFormData, type FormFieldMapping } from "./form-generator";

describe("Form Generator", () => {
  describe("validateFormData", () => {
    const validFormData: FormFieldMapping = {
      applicantFirstName: "John",
      applicantLastName: "Doe",
      applicantDateOfBirth: "1990-01-15",
      applicantSIN: "123456789",
      applicantGender: "M",
      applicantEmail: "john@example.com",
      applicantPhone: "6135551234",
      applicantAddress: "123 Main Street",
      applicantCity: "Ottawa",
      applicantProvince: "ON",
      applicantPostalCode: "K1A 0B1",
      offenseType: "Theft",
      offenseDate: "2015-06-20",
      sentenceLength: "2 years",
      sentenceType: "Custody",
      employmentStatus: "Employed",
      employerName: "Tech Corp",
      jobTitle: "Software Developer",
    };

    it("should validate correct form data", () => {
      const result = validateFormData(validFormData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject missing required fields", () => {
      const invalidData = { ...validFormData };
      delete (invalidData as any).applicantFirstName;

      const result = validateFormData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("First name is required");
    });

    it("should reject invalid date format", () => {
      const invalidData = { ...validFormData, applicantDateOfBirth: "01/15/1990" };

      const result = validateFormData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("date of birth"))).toBe(true);
    });

    it("should reject invalid SIN format", () => {
      const invalidData = { ...validFormData, applicantSIN: "12345678" };

      const result = validateFormData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("SIN"))).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = { ...validFormData, applicantEmail: "not-an-email" };

      const result = validateFormData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("email"))).toBe(true);
    });

    it("should reject invalid postal code", () => {
      const invalidData = { ...validFormData, applicantPostalCode: "12345" };

      const result = validateFormData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes("postal code"))).toBe(true);
    });

    it("should accept valid postal code formats", () => {
      const validPostalCodes = [
        "K1A 0B1",
        "K1A0B1",
        "M5V 3A8",
        "V6B 4X8",
      ];

      for (const postalCode of validPostalCodes) {
        const data = { ...validFormData, applicantPostalCode: postalCode };
        const result = validateFormData(data);
        expect(result.valid).toBe(true);
      }
    });

    it("should accept optional fields", () => {
      const dataWithoutOptional = { ...validFormData };
      delete (dataWithoutOptional as any).employerName;
      delete (dataWithoutOptional as any).jobTitle;
      delete (dataWithoutOptional as any).reference1Name;

      const result = validateFormData(dataWithoutOptional);
      expect(result.valid).toBe(true);
    });

    it("should validate all required offense types", () => {
      const offenseTypes = [
        "Theft",
        "Assault",
        "Drug Possession",
        "Fraud",
        "Other",
      ];

      for (const offenseType of offenseTypes) {
        const data = { ...validFormData, offenseType };
        const result = validateFormData(data);
        expect(result.valid).toBe(true);
      }
    });

    it("should validate all required sentence types", () => {
      const sentenceTypes: Array<"Custody" | "Conditional Sentence" | "Probation" | "Fine" | "Other"> = [
        "Custody",
        "Conditional Sentence",
        "Probation",
        "Fine",
        "Other",
      ];

      for (const sentenceType of sentenceTypes) {
        const data = { ...validFormData, sentenceType };
        const result = validateFormData(data);
        expect(result.valid).toBe(true);
      }
    });

    it("should validate all employment statuses", () => {
      const statuses: Array<"Employed" | "Self-Employed" | "Unemployed" | "Student" | "Retired"> = [
        "Employed",
        "Self-Employed",
        "Unemployed",
        "Student",
        "Retired",
      ];

      for (const status of statuses) {
        const data = { ...validFormData, employmentStatus: status };
        const result = validateFormData(data);
        expect(result.valid).toBe(true);
      }
    });

    it("should validate all gender options", () => {
      const genders: Array<"M" | "F" | "X"> = ["M", "F", "X"];

      for (const gender of genders) {
        const data = { ...validFormData, applicantGender: gender };
        const result = validateFormData(data);
        expect(result.valid).toBe(true);
      }
    });

    it("should provide multiple error messages for multiple invalid fields", () => {
      const invalidData = {
        applicantFirstName: "",
        applicantLastName: "",
        applicantDateOfBirth: "invalid",
        applicantSIN: "123",
        applicantGender: "M" as const,
        applicantEmail: "invalid",
        applicantPhone: "123",
        applicantAddress: "",
        applicantCity: "",
        applicantProvince: "ON",
        applicantPostalCode: "invalid",
        offenseType: "",
        offenseDate: "invalid",
        sentenceLength: "",
        sentenceType: "Custody" as const,
        employmentStatus: "Employed" as const,
      };

      const result = validateFormData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });
});
