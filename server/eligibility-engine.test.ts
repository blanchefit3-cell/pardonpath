import { describe, it, expect } from "vitest";
import {
  checkEligibility,
  OffenseCategory,
  EligibilityStatus,
  type EligibilityCheckInput,
} from "./eligibility-engine";

describe("Eligibility Engine", () => {
  describe("Schedule 1 Offenses", () => {
    it("should mark murder as ineligible", () => {
      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "murder",
            category: OffenseCategory.SCHEDULE_1,
            convictionDate: new Date("2010-01-01"),
            sentenceEndDate: new Date("2020-01-01"),
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate: new Date("2024-01-01"),
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.INELIGIBLE);
      expect(result.eligible).toBe(false);
      expect(result.flags).toContain("Schedule 1 offense");
    });
  });

  describe("Summary Convictions", () => {
    it("should be eligible after 5-year waiting period", () => {
      const sentenceEndDate = new Date("2019-01-01");
      const applicationDate = new Date("2024-01-01");

      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2018-01-01"),
            sentenceEndDate,
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate,
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.PASS);
      expect(result.eligible).toBe(true);
      expect(result.waitingPeriodMonths).toBe(60);
    });

    it("should be ineligible before 5-year waiting period", () => {
      const sentenceEndDate = new Date("2020-01-01");
      const applicationDate = new Date("2024-01-01");

      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2019-01-01"),
            sentenceEndDate,
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate,
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.INELIGIBLE);
      expect(result.eligible).toBe(false);
      expect(result.flags).toContain("Waiting period not satisfied");
    });
  });

  describe("Indictable Offenses", () => {
    it("should be eligible after 10-year waiting period", () => {
      const sentenceEndDate = new Date("2014-01-01");
      const applicationDate = new Date("2024-01-01");

      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "assault",
            category: OffenseCategory.INDICTABLE,
            convictionDate: new Date("2012-01-01"),
            sentenceEndDate,
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate,
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.PASS);
      expect(result.eligible).toBe(true);
      expect(result.waitingPeriodMonths).toBe(120);
    });
  });

  describe("Hybrid Offenses", () => {
    it("should use 10-year waiting period (indictable treatment)", () => {
      const sentenceEndDate = new Date("2014-01-01");
      const applicationDate = new Date("2024-01-01");

      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "sexual_assault",
            category: OffenseCategory.HYBRID,
            convictionDate: new Date("2012-01-01"),
            sentenceEndDate,
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate,
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.waitingPeriodMonths).toBe(120);
      expect(result.eligible).toBe(true);
    });
  });

  describe("Multiple Offenses", () => {
    it("should use longest waiting period for multiple offenses", () => {
      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2019-01-01"),
            sentenceEndDate: new Date("2014-06-01"),
            province: "ON",
            isFirstOffense: true,
          },
          {
            type: "assault",
            category: OffenseCategory.INDICTABLE,
            convictionDate: new Date("2012-01-01"),
            sentenceEndDate: new Date("2014-01-01"),
            province: "ON",
            isFirstOffense: false,
          },
        ],
        applicationDate: new Date("2024-06-01"),
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.waitingPeriodMonths).toBe(120);
      expect(result.status).toBe(EligibilityStatus.FLAG);
      expect(result.flags).toContain("Multiple offenses");
      expect(result.eligible).toBe(true);
    });

    it("should flag multiple offenses for manual review", () => {
      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2019-01-01"),
            sentenceEndDate: new Date("2019-06-01"),
            province: "ON",
            isFirstOffense: true,
          },
          {
            type: "fraud",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2020-01-01"),
            sentenceEndDate: new Date("2020-06-01"),
            province: "ON",
            isFirstOffense: false,
          },
        ],
        applicationDate: new Date("2025-06-01"),
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.FLAG);
      expect(result.flags).toContain("Multiple offenses");
    });
  });

  describe("Disqualifying Factors", () => {
    it("should be ineligible with outstanding charges", () => {
      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2019-01-01"),
            sentenceEndDate: new Date("2019-06-01"),
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate: new Date("2024-06-01"),
        hasOutstandingCharges: true,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.INELIGIBLE);
      expect(result.eligible).toBe(false);
      expect(result.flags).toContain("Outstanding criminal charges");
    });

    it("should be ineligible with failure to appear history", () => {
      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2019-01-01"),
            sentenceEndDate: new Date("2019-06-01"),
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate: new Date("2024-06-01"),
        hasOutstandingCharges: false,
        hasFailedToAppear: true,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.INELIGIBLE);
      expect(result.flags).toContain("History of failure to appear");
    });

    it("should be ineligible with condition violations", () => {
      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2019-01-01"),
            sentenceEndDate: new Date("2019-06-01"),
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate: new Date("2024-06-01"),
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: true,
      };

      const result = checkEligibility(input);
      expect(result.status).toBe(EligibilityStatus.INELIGIBLE);
      expect(result.flags).toContain("History of violating court conditions");
    });
  });

  describe("Edge Cases", () => {
    it("should calculate eligible date correctly", () => {
      const sentenceEndDate = new Date("2019-01-01");
      const applicationDate = new Date("2024-01-01");

      const input: EligibilityCheckInput = {
        offenses: [
          {
            type: "theft",
            category: OffenseCategory.SUMMARY,
            convictionDate: new Date("2018-01-01"),
            sentenceEndDate,
            province: "ON",
            isFirstOffense: true,
          },
        ],
        applicationDate,
        hasOutstandingCharges: false,
        hasFailedToAppear: false,
        hasViolatedConditions: false,
      };

      const result = checkEligibility(input);
      expect(result.eligible).toBe(true);
      expect(result.eligibleDate).toBeDefined();
      expect(result.waitingPeriodMonths).toBe(60);
    });
  });
});
