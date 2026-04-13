import { checkEligibility, OffenseCategory } from './server/eligibility-engine.ts';

const input = {
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
console.log('Status:', result.status);
console.log('Eligible:', result.eligible);
console.log('Eligible Date:', result.eligibleDate);
console.log('Waiting Period:', result.waitingPeriodMonths);
console.log('Reason:', result.reason);
