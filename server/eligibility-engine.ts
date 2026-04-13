/**
 * PardonPath Eligibility Engine
 * 
 * Implements Canadian Criminal Records Act (CRA) rules for record suspension eligibility.
 * References: Criminal Records Act (R.S.C., 1985, c. C-47), Parole Board of Canada guidelines
 * 
 * Key Rules:
 * - Schedule 1 offenses: Ineligible (murder, treason, etc.)
 * - Hybrid offenses: Treated as indictable for eligibility purposes
 * - Waiting periods: 5-10 years depending on offense type and sentence
 * - Bill S-207: Automatic expiry after waiting period (future feature)
 */

import { z } from "zod";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export enum OffenseCategory {
  SCHEDULE_1 = "schedule_1", // Ineligible
  INDICTABLE = "indictable", // 10-year waiting period
  SUMMARY = "summary", // 5-year waiting period
  HYBRID = "hybrid", // Treated as indictable (10 years)
}

export enum EligibilityStatus {
  PASS = "pass", // Eligible for record suspension
  FLAG = "flag", // Eligible but requires manual review (e.g., multiple offenses)
  INELIGIBLE = "ineligible", // Not eligible
}

export interface OffenseInput {
  type: string; // e.g., "theft", "assault", "drug_possession"
  category: OffenseCategory;
  convictionDate: Date;
  sentenceEndDate: Date;
  province: string; // e.g., "ON", "BC", "AB"
  isFirstOffense: boolean;
  sentenceLength?: number; // in months
}

export interface EligibilityCheckInput {
  offenses: OffenseInput[];
  applicationDate: Date;
  hasOutstandingCharges: boolean;
  hasFailedToAppear: boolean;
  hasViolatedConditions: boolean;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  eligible: boolean;
  reason: string;
  waitingPeriodMonths: number;
  eligibleDate: Date | null;
  flags: string[];
  recommendations: string[];
}

// ============================================================================
// SCHEDULE 1 OFFENSES (INELIGIBLE)
// ============================================================================

const SCHEDULE_1_OFFENSES = new Set([
  "murder",
  "manslaughter",
  "attempted_murder",
  "treason",
  "high_treason",
  "sedition",
  "piracy",
  "sexual_assault_with_weapon",
  "aggravated_sexual_assault",
  "sexual_assault_of_minor",
  "child_sexual_abuse_material",
  "trafficking_persons",
  "human_trafficking",
  "terrorism",
  "terrorist_activity",
  "hostage_taking",
  "criminal_harassment_repeat",
  "uttering_threats_death",
]);

// ============================================================================
// WAITING PERIOD RULES
// ============================================================================

/**
 * Calculate waiting period in months based on offense category and conviction date
 * 
 * Rules:
 * - Summary conviction: 5 years (60 months)
 * - Indictable offense: 10 years (120 months)
 * - Hybrid offense: Treated as indictable (10 years)
 * - Multiple offenses: Use longest waiting period
 */
function calculateWaitingPeriod(offenses: OffenseInput[]): number {
  if (offenses.length === 0) return 0;

  const waitingPeriods = offenses.map((offense) => {
    switch (offense.category) {
      case OffenseCategory.SUMMARY:
        return 60; // 5 years
      case OffenseCategory.INDICTABLE:
        return 120; // 10 years
      case OffenseCategory.HYBRID:
        return 120; // 10 years (treated as indictable)
      case OffenseCategory.SCHEDULE_1:
        return Infinity; // Ineligible
      default:
        return 120; // Default to 10 years
    }
  });

  return Math.max(...waitingPeriods);
}

/**
 * Calculate the date when an applicant becomes eligible
 */
function calculateEligibleDate(
  offense: OffenseInput,
  waitingPeriodMonths: number
): Date {
  // Waiting period starts from the END of the sentence, not the conviction date
  const startDate = new Date(offense.sentenceEndDate);
  const eligibleDate = new Date(startDate);
  eligibleDate.setMonth(eligibleDate.getMonth() + waitingPeriodMonths);
  return eligibleDate;
}

// ============================================================================
// ELIGIBILITY CHECK LOGIC
// ============================================================================

/**
 * Main eligibility check function
 * 
 * Returns:
 * - PASS: Applicant is eligible
 * - FLAG: Applicant is eligible but requires manual review
 * - INELIGIBLE: Applicant is not eligible
 */
export function checkEligibility(
  input: EligibilityCheckInput
): EligibilityResult {
  const flags: string[] = [];
  const recommendations: string[] = [];

  // =========================================================================
  // STEP 1: Check for disqualifying factors
  // =========================================================================

  if (input.hasOutstandingCharges) {
    flags.push("Outstanding criminal charges");
  }

  if (input.hasFailedToAppear) {
    flags.push("History of failure to appear");
  }

  if (input.hasViolatedConditions) {
    flags.push("History of violating court conditions");
  }

  // If any disqualifying factors, return ineligible
  if (flags.length > 0) {
    return {
      status: EligibilityStatus.INELIGIBLE,
      eligible: false,
      reason:
        "Applicant has disqualifying factors: " + flags.join(", "),
      waitingPeriodMonths: 0,
      eligibleDate: null,
      flags,
      recommendations: [
        "Resolve all outstanding charges before applying",
        "Ensure no active warrants or court conditions",
      ],
    };
  }

  // =========================================================================
  // STEP 2: Check for Schedule 1 offenses
  // =========================================================================

  for (const offense of input.offenses) {
    if (SCHEDULE_1_OFFENSES.has(offense.type.toLowerCase())) {
      return {
        status: EligibilityStatus.INELIGIBLE,
        eligible: false,
        reason: `Schedule 1 offense (${offense.type}) is ineligible for record suspension`,
        waitingPeriodMonths: Infinity,
        eligibleDate: null,
        flags: ["Schedule 1 offense"],
        recommendations: [
          "This offense is permanently ineligible for record suspension under the Criminal Records Act",
          "Consider consulting with a lawyer for other legal remedies",
        ],
      };
    }
  }

  // =========================================================================
  // STEP 3: Calculate waiting period
  // =========================================================================

  const waitingPeriodMonths = calculateWaitingPeriod(input.offenses);

  if (waitingPeriodMonths === Infinity) {
    return {
      status: EligibilityStatus.INELIGIBLE,
      eligible: false,
      reason: "One or more offenses are ineligible",
      waitingPeriodMonths: Infinity,
      eligibleDate: null,
      flags: ["Ineligible offense"],
      recommendations: [],
    };
  }

  // =========================================================================
  // STEP 4: Check if waiting period has been satisfied
  // =========================================================================

  const mostRecentOffense = input.offenses.reduce((prev, current) =>
    new Date(current.sentenceEndDate) > new Date(prev.sentenceEndDate)
      ? current
      : prev
  );

  const eligibleDate = calculateEligibleDate(
    mostRecentOffense,
    waitingPeriodMonths
  );
  const isEligible = input.applicationDate >= eligibleDate;

  // =========================================================================
  // STEP 5: Determine final status
  // =========================================================================

  let status = EligibilityStatus.PASS;
  let reason = `Applicant is eligible for record suspension`;

  // Flag for manual review if multiple offenses
  if (input.offenses.length > 1) {
    status = EligibilityStatus.FLAG;
    flags.push("Multiple offenses");
    recommendations.push(
      "Manual review recommended for applicants with multiple offenses"
    );
  }

  // If not yet eligible, return ineligible
  if (!isEligible) {
    const monthsRemaining = Math.ceil(
      (eligibleDate.getTime() - input.applicationDate.getTime()) /
        (1000 * 60 * 60 * 24 * 30.44)
    );
    return {
      status: EligibilityStatus.INELIGIBLE,
      eligible: false,
      reason: `Waiting period not yet satisfied. Eligible in ${monthsRemaining} months (${eligibleDate.toLocaleDateString()})`,
      waitingPeriodMonths,
      eligibleDate,
      flags: ["Waiting period not satisfied"],
      recommendations: [
        `Reapply after ${eligibleDate.toLocaleDateString()}`,
        `Current waiting period: ${waitingPeriodMonths} months from end of sentence`,
      ],
    };
  }

  return {
    status,
    eligible: true,
    reason,
    waitingPeriodMonths,
    eligibleDate,
    flags,
    recommendations: [
      "Proceed with document collection",
      "Ensure all required documents are obtained",
      "Submit application to Parole Board of Canada",
    ],
  };
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const OffenseInputSchema = z.object({
  type: z.string().min(1, "Offense type is required"),
  category: z.nativeEnum(OffenseCategory),
  convictionDate: z.coerce.date(),
  sentenceEndDate: z.coerce.date(),
  province: z.string().length(2, "Province must be 2-letter code"),
  isFirstOffense: z.boolean(),
  sentenceLength: z.number().optional(),
});

export const EligibilityCheckInputSchema = z.object({
  offenses: z.array(OffenseInputSchema).min(1, "At least one offense required"),
  applicationDate: z.coerce.date(),
  hasOutstandingCharges: z.boolean().default(false),
  hasFailedToAppear: z.boolean().default(false),
  hasViolatedConditions: z.boolean().default(false),
});
