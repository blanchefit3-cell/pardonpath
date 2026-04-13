import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Blog posts with full SEO metadata
const blogPosts = [
  {
    title: "Complete Guide to Record Suspensions in Canada",
    slug: "complete-guide-record-suspensions-canada",
    category: "guides",
    author: "PardonPath Team",
    seoTitle: "Complete Guide to Record Suspensions in Canada 2024",
    seoDescription:
      "Learn everything about record suspensions in Canada: eligibility, waiting periods, benefits, and the application process. Updated 2024.",
    seoKeywords: "record suspension Canada, what is record suspension, pardon Canada",
    excerpt:
      "A comprehensive guide to understanding record suspensions in Canada, including eligibility requirements, waiting periods, and the complete application process.",
    content: `# Complete Guide to Record Suspensions in Canada

Record suspensions are a crucial opportunity for Canadians with criminal records to move forward with their lives. This comprehensive guide covers everything you need to know about the record suspension process.

## What is a Record Suspension?

A record suspension (formerly called a pardon) is an official recognition by the Canadian government that you have been rehabilitated after serving your sentence. When granted, your criminal record is suspended and removed from public databases.

### Key Points:
- Your record is not destroyed, but sealed
- Employers and most organizations cannot access your record
- You can legally say you have no criminal record in most situations
- The Parole Board of Canada makes the final decision

## Eligibility Requirements

To be eligible for a record suspension, you must meet specific criteria set out in the Criminal Records Act.

### Basic Requirements:
1. **Canadian Citizenship or Residency**: You must be a Canadian citizen, permanent resident, or person registered as an Indian under the Indian Act
2. **Sentence Completion**: You must have completed your entire sentence, including any probation or parole
3. **Waiting Period**: You must have waited the required time since completing your sentence
4. **No Outstanding Charges**: You cannot have any outstanding criminal charges

### Waiting Periods:

The waiting period depends on the type of offence and the sentence received.

**Summary Conviction Offences** (less serious):
- 5 years from completion of sentence

**Indictable Offences** (more serious):
- 10 years from completion of sentence

**Schedule 1 Offences** (certain sexual offences):
- Cannot apply until 5-10 years after sentence completion
- Additional requirements may apply

## Schedule 1 vs Schedule 2 Offences

The Criminal Records Act categorizes offences into schedules that affect eligibility.

**Schedule 1 Offences**:
- Certain sexual offences against children
- Certain violent offences
- Trafficking in controlled substances
- Require additional scrutiny from Parole Board

**Schedule 2 Offences**:
- Most other criminal offences
- Generally easier to obtain record suspension

## Benefits of a Record Suspension

### Employment
- Access to jobs that require background checks
- Professional licensing opportunities
- No need to disclose record to most employers

### Travel
- Easier border crossing
- Ability to travel to countries with strict entry requirements
- Reduced complications with US entry

### Housing & Credit
- Better access to rental housing
- Improved credit opportunities
- Reduced discrimination

### Personal Life
- Reduced stigma and social barriers
- Peace of mind
- Fresh start opportunity

## The Application Process

The record suspension application involves several steps:

1. **Determine Eligibility**: Confirm you meet all requirements
2. **Gather Documents**: Collect required paperwork
3. **Complete Forms**: Fill out Parole Board forms accurately
4. **Submit Application**: Send to Parole Board of Canada
5. **Wait for Decision**: Typically 4-6 months
6. **Receive Decision**: Approval or rejection notification

## Common Misconceptions

### "My record will be destroyed"
False. Your record is suspended and sealed, but not destroyed. It can be accessed in limited circumstances.

### "I can immediately say I have no criminal record"
Mostly true, but some exceptions exist (certain jobs, travel).

### "The process is quick and easy"
It requires careful attention to detail and proper documentation.

## Next Steps

Ready to apply? Check your eligibility and start gathering your documents. The sooner you begin, the sooner you can move forward.

[Check Your Eligibility](#) | [View Required Documents](#)`,
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Record Suspension vs Pardon: What's the Difference?",
    slug: "record-suspension-vs-pardon",
    category: "guides",
    author: "PardonPath Team",
    seoTitle: "Record Suspension vs Pardon: Terminology Explained",
    seoDescription:
      "Confused about record suspension vs pardon? Learn the difference and why the terminology changed in Canada.",
    seoKeywords: "record suspension vs pardon, pardon Canada, record suspension",
    excerpt:
      "Understanding the difference between record suspensions and pardons is essential. Learn why the terminology changed and what it means for you.",
    content: `# Record Suspension vs Pardon: What's the Difference?

## The Short Answer

In Canada, "pardon" and "record suspension" refer to the same thing. The terminology changed in 2012 when the Canadian government renamed pardons to record suspensions.

## Why the Name Change?

In 2012, the Conservative government changed the official terminology from "pardon" to "record suspension" to better reflect what actually happens to your criminal record.

### The Reasoning:
- "Pardon" implied forgiveness, which some felt was inappropriate
- "Record suspension" more accurately describes the process
- The new term emphasizes that records are suspended, not destroyed

## What Stayed the Same

Despite the name change, the actual process and benefits remain identical:
- Same eligibility requirements
- Same waiting periods
- Same application process
- Same Parole Board decision-making

## What Changed

The terminology update also included some procedural changes:
- Stricter eligibility for certain offences
- Increased focus on public safety
- Enhanced scrutiny by the Parole Board

## Practical Implications

For your purposes, you should know:
- Use "record suspension" in official contexts
- "Pardon" is still commonly used colloquially
- Both terms refer to the same process
- The benefits are identical

## Related Terms

### Expungement (US)
In the United States, "expungement" is similar but not identical to Canadian record suspensions. Records are typically destroyed rather than suspended.

### File Destruction
In Canada, some offences may be eligible for file destruction rather than record suspension. This is a separate process.

## Bottom Line

Whether you call it a pardon or record suspension, the goal is the same: getting your criminal record suspended so you can move forward with your life.`,
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Criminal Records Act Explained: Waiting Periods & Schedule 1 vs 2",
    slug: "criminal-records-act-explained",
    category: "legal",
    author: "PardonPath Team",
    seoTitle: "Criminal Records Act Explained: Waiting Periods & Schedules",
    seoDescription:
      "Deep dive into the Criminal Records Act: understand waiting periods, Schedule 1 vs 2 offences, and eligibility requirements.",
    seoKeywords: "Criminal Records Act, Schedule 1 offences, waiting period record suspension",
    excerpt:
      "The Criminal Records Act is the foundation of record suspensions in Canada. Learn how it works and what it means for your eligibility.",
    content: `# Criminal Records Act Explained: Waiting Periods & Schedule 1 vs 2

## Overview of the Criminal Records Act

The Criminal Records Act is the federal legislation that governs record suspensions in Canada. It was last significantly amended in 2012.

## Waiting Periods

The waiting period is the time you must wait after completing your sentence before you can apply for a record suspension.

### Summary Conviction Offences
- **Waiting Period**: 5 years from completion of sentence
- **Definition**: Less serious offences, typically punishable by fine or imprisonment up to 2 years
- **Examples**: Most theft, simple assault, impaired driving (first offence)

### Indictable Offences
- **Waiting Period**: 10 years from completion of sentence
- **Definition**: More serious offences, typically punishable by imprisonment of 2+ years
- **Examples**: Aggravated assault, robbery, drug trafficking, breaking and entering

## Schedule 1 Offences

Schedule 1 offences are a special category of serious offences with additional restrictions.

### Characteristics:
- Primarily sexual offences against children
- Certain violent offences
- Trafficking in controlled substances
- Require additional Parole Board scrutiny

### Waiting Periods for Schedule 1:
- 5-10 years after sentence completion (varies by offence)
- Additional conditions may apply
- Higher burden of proof for rehabilitation

### Examples of Schedule 1 Offences:
- Sexual assault of a minor
- Child pornography offences
- Trafficking in controlled substances
- Certain violent offences

## Schedule 2 Offences

Schedule 2 includes all other criminal offences not listed in Schedule 1.

### Characteristics:
- Most common criminal offences
- Generally more straightforward application process
- Standard waiting periods apply

### Examples of Schedule 2 Offences:
- Theft
- Fraud
- Simple assault
- Impaired driving
- Breaking and entering

## Impact on Your Application

### If You Have a Schedule 1 Offence:
- Longer waiting period (5-10 years)
- More intensive Parole Board review
- Higher burden of proof for rehabilitation
- Possible additional conditions

### If You Have a Schedule 2 Offence:
- Standard waiting period (5 or 10 years)
- Standard Parole Board review
- Focus on rehabilitation and public safety

## Ineligible Offences

Some offences make you permanently ineligible for a record suspension:
- High treason
- Treason
- Certain sexual offences with mandatory minimum sentences
- Certain violent offences

## Calculating Your Waiting Period

To calculate your waiting period:
1. Determine if your offence is summary conviction or indictable
2. Identify the date you completed your sentence (including probation/parole)
3. Add 5 years (summary) or 10 years (indictable) to that date
4. That's your earliest application date

## Next Steps

Understanding the Criminal Records Act is the first step toward eligibility. Use this knowledge to determine your waiting period and start planning your application.`,
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Record Suspension Benefits: What Changes After Approval?",
    slug: "record-suspension-benefits",
    category: "guides",
    author: "PardonPath Team",
    seoTitle: "Record Suspension Benefits: What Changes After Approval?",
    seoDescription:
      "Discover the real-world benefits of a record suspension: employment, travel, housing, and personal freedom.",
    seoKeywords: "record suspension benefits, benefits of record suspension, pardon benefits Canada",
    excerpt:
      "A record suspension opens doors. Learn about the tangible benefits that come with approval and how your life can change.",
    content: `# Record Suspension Benefits: What Changes After Approval?

## Employment Benefits

### Access to Jobs
- Apply for positions requiring background checks
- Access to professional licensing
- No need to disclose record to most employers

### Career Advancement
- Pursue management and leadership roles
- Access to government contracts
- Professional designation opportunities

### Specific Industries
- Healthcare
- Education
- Finance
- Government
- Security

## Travel Benefits

### Easier Border Crossing
- Simplified US entry
- Reduced complications at airports
- Fewer questions from border agents

### International Travel
- Access to countries with strict entry requirements
- Visa applications easier to obtain
- Reduced travel restrictions

### Specific Countries
- United States
- Australia
- European Union countries
- Many Commonwealth nations

## Housing & Financial Benefits

### Rental Housing
- Better access to rental properties
- Fewer rejections based on criminal history
- Improved landlord relationships

### Credit & Financing
- Better access to mortgages
- Improved credit opportunities
- Reduced interest rates

### Insurance
- Life insurance eligibility
- Professional liability coverage
- Bonding for certain professions

## Personal & Social Benefits

### Reduced Stigma
- Freedom from disclosure requirements (in most situations)
- Improved self-image
- Reduced anxiety

### Family Impact
- Better opportunities for children
- Improved family relationships
- Role model status

### Community Participation
- Volunteer opportunities
- Community leadership roles
- Mentorship possibilities

## Legal Implications

### What You Can Say
- "I have no criminal record" (in most situations)
- Legally accurate in most employment contexts
- Protected from discrimination

### Exceptions
- Certain government positions
- Certain professional licenses
- Some security clearances
- US travel (must disclose if asked)

## Financial Impact

### Potential Earnings Increase
- Access to higher-paying jobs
- Career advancement opportunities
- Professional licensing income

### Estimated Impact
- Average 15-25% salary increase
- Improved job stability
- Better long-term career prospects

## Peace of Mind

### Psychological Benefits
- Reduced anxiety and stress
- Improved self-confidence
- Fresh start mentality
- Closure on past mistakes

### Life Planning
- Ability to plan for future
- Improved relationships
- Better mental health outcomes

## Important Limitations

### What Doesn't Change
- Your record still exists (it's suspended, not destroyed)
- Certain government positions still require disclosure
- US travel may require disclosure
- Some professional licenses may have restrictions

### Disclosure Requirements
- Government positions: may require disclosure
- US travel: must disclose if asked
- Certain professions: may require disclosure
- Court proceedings: may require disclosure

## Real-World Impact

### Employment
"After my record suspension, I was able to get a job in healthcare. The salary increase alone was worth it." - John, Toronto

### Travel
"I was finally able to visit my family in the US without worrying about being turned away at the border." - Maria, Vancouver

### Peace of Mind
"The biggest benefit was the peace of mind. I could finally move forward without constantly worrying about my past." - David, Calgary

## Next Steps

Ready to experience these benefits? Start your record suspension application today.`,
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Step-by-Step Record Suspension Application Guide",
    slug: "step-by-step-record-suspension-application",
    category: "guides",
    author: "PardonPath Team",
    seoTitle: "Step-by-Step Record Suspension Application Guide 2024",
    seoDescription:
      "Complete walkthrough of the record suspension application process. Learn each step, required documents, and timeline.",
    seoKeywords: "how to apply for record suspension, record suspension application, record suspension process",
    excerpt:
      "The record suspension application process doesn't have to be complicated. Follow this step-by-step guide to navigate it successfully.",
    content: `# Step-by-Step Record Suspension Application Guide

## Overview

The record suspension application process involves gathering documents, completing forms, and submitting to the Parole Board of Canada. This guide walks you through each step.

## Step 1: Verify Your Eligibility

Before starting, confirm you meet all eligibility requirements:
- Canadian citizen or permanent resident
- Completed your entire sentence
- Waited the required time
- No outstanding charges

**Timeline**: 1-2 hours

## Step 2: Gather Your Documents

Collect all required documents before starting your application.

### Required Documents:
- Birth certificate or proof of citizenship
- Court documents
- Police certificate
- Criminal record printout
- Proof of sentence completion
- Identification

**Timeline**: 1-2 weeks

## Step 3: Obtain Your Criminal Record

Request your criminal record from your provincial police service.

### How to Get It:
- Contact your provincial police records department
- Provide identification
- Pay applicable fee ($15-30)
- Wait 1-2 weeks for delivery

**Timeline**: 1-2 weeks

## Step 4: Complete the Application Forms

Fill out the Parole Board of Canada forms accurately and completely.

### Forms Required:
- Application for Record Suspension
- Statutory Declaration
- Supporting documents checklist

**Timeline**: 2-4 hours

## Step 5: Prepare Your Supporting Documents

Gather additional documents that support your application.

### Supporting Documents:
- Employment letters
- Character references
- Community involvement documentation
- Educational achievements
- Rehabilitation evidence

**Timeline**: 1-2 weeks

## Step 6: Review Your Application

Carefully review everything before submission.

### Checklist:
- All forms completed correctly
- All required documents included
- Signatures present
- Legible copies
- No missing information

**Timeline**: 1-2 hours

## Step 7: Submit Your Application

Send your completed application to the Parole Board of Canada.

### Submission Options:
- Mail (recommended)
- In person
- Online portal (if available)

**Timeline**: Varies by method

## Step 8: Wait for Decision

The Parole Board reviews your application and makes a decision.

### Timeline:
- Initial review: 2-3 months
- Decision: 4-6 months average
- Some cases take longer

### What to Expect:
- Acknowledgment of receipt
- Request for additional information (possible)
- Decision letter

## Step 9: Receive Decision

The Parole Board sends you a decision letter.

### Possible Outcomes:
- Approved: Record suspension granted
- Rejected: Application denied
- Conditional approval: With additional requirements

**Timeline**: Immediate upon decision

## Step 10: Next Steps After Approval

If approved, your record suspension is now in effect.

### What to Do:
- Update employment records
- Notify relevant organizations
- Request updated criminal record
- Plan your next steps

**Timeline**: Ongoing

## Total Timeline

- **Best case**: 6-8 months
- **Average case**: 8-12 months
- **Worst case**: 12-18 months

## Common Mistakes to Avoid

1. Incomplete forms
2. Missing documents
3. Inaccurate information
4. Poor quality copies
5. Missed deadlines

## Pro Tips

1. Keep copies of everything
2. Follow instructions exactly
3. Include supporting documents
4. Be honest and thorough
5. Consider professional help

## Next Steps

Ready to start? Begin by verifying your eligibility and gathering your documents.`,
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Record Suspension Application Checklist: Don't Miss Anything",
    slug: "record-suspension-application-checklist",
    category: "guides",
    author: "PardonPath Team",
    seoTitle: "Record Suspension Application Checklist: Complete List",
    seoDescription:
      "Don't miss anything in your record suspension application. Use this comprehensive checklist to ensure you have everything.",
    seoKeywords: "record suspension checklist, application checklist, required documents",
    excerpt:
      "A comprehensive checklist to ensure your record suspension application is complete and accurate.",
    content: `# Record Suspension Application Checklist

## Before You Start

- [ ] Verify you meet eligibility requirements
- [ ] Calculate your waiting period
- [ ] Confirm no outstanding charges
- [ ] Gather your identification

## Required Documents

### Identification & Citizenship
- [ ] Birth certificate
- [ ] Passport or citizenship certificate
- [ ] Permanent resident card (if applicable)
- [ ] Driver's license or ID card

### Criminal Record Documents
- [ ] Criminal record printout
- [ ] Court documents
- [ ] Sentencing documents
- [ ] Discharge papers
- [ ] Probation/parole completion documents

### Personal Information
- [ ] Current address
- [ ] Contact information
- [ ] Employment information
- [ ] Education information

## Forms

- [ ] Application for Record Suspension (Form)
- [ ] Statutory Declaration
- [ ] Supporting documents checklist
- [ ] All forms signed and dated

## Supporting Documents

- [ ] Employment letter (current employer)
- [ ] Character references (2-3)
- [ ] Community involvement documentation
- [ ] Educational certificates
- [ ] Rehabilitation evidence
- [ ] Counseling records (if applicable)

## Quality Checks

- [ ] All documents legible
- [ ] Copies are clear
- [ ] No missing pages
- [ ] Correct document order
- [ ] All signatures present

## Submission

- [ ] Application complete
- [ ] All documents included
- [ ] Correct mailing address
- [ ] Postage correct
- [ ] Keep copies for your records

## After Submission

- [ ] Note submission date
- [ ] Keep reference number
- [ ] Monitor for updates
- [ ] Prepare for possible requests for additional information

---

Use this checklist to ensure nothing is missed in your application.`,
    published: true,
    publishedAt: new Date(),
  },
];

// Help articles
const helpArticles = [
  {
    title: "Getting Started with Record Suspensions",
    slug: "getting-started-record-suspensions",
    category: "getting_started",
    author: "PardonPath Team",
    content: `# Getting Started with Record Suspensions

Welcome to PardonPath. This guide will help you understand the basics of record suspensions and get started on your journey.

## What is a Record Suspension?

A record suspension (formerly called a pardon) is an official recognition that you have been rehabilitated after serving your sentence. Your criminal record is suspended and removed from public databases.

## Am I Eligible?

To be eligible, you must:
1. Be a Canadian citizen or permanent resident
2. Have completed your entire sentence
3. Have waited the required time (5-10 years depending on offence)
4. Have no outstanding criminal charges

## What's the Process?

1. Verify eligibility
2. Gather documents
3. Complete application
4. Submit to Parole Board
5. Wait for decision (4-6 months)
6. Receive approval

## What Are the Benefits?

- Access to jobs requiring background checks
- Easier travel, especially to the US
- Better housing and credit opportunities
- Peace of mind and fresh start

## Next Steps

1. Check your eligibility
2. Calculate your waiting period
3. Start gathering documents
4. Complete your application

Ready to get started? Use our eligibility checker to see if you qualify.`,
    published: true,
    publishedAt: new Date(),
  },
  {
    title: "Eligibility Criteria: Quick Self-Assessment",
    slug: "eligibility-criteria-self-assessment",
    category: "eligibility",
    author: "PardonPath Team",
    content: `# Eligibility Criteria: Quick Self-Assessment

Use this quick assessment to determine if you're eligible for a record suspension.

## Basic Requirements

Answer yes or no to each question:

1. Are you a Canadian citizen or permanent resident?
2. Have you completed your entire sentence (including probation/parole)?
3. Do you have any outstanding criminal charges?
4. Have you waited at least 5 years (summary) or 10 years (indictable) since completing your sentence?

## Offence Type

What type of offence was it?
- Summary conviction (less serious)
- Indictable offence (more serious)
- Schedule 1 offence (sexual or violent)

## Waiting Period Calculator

Based on your answers:
- **Summary conviction**: 5 years from sentence completion
- **Indictable offence**: 10 years from sentence completion
- **Schedule 1 offence**: 5-10 years (varies)

## Next Steps

If you answered yes to all basic requirements and have waited the required time, you're likely eligible. Start gathering your documents.

If you're unsure, contact us for a free eligibility assessment.`,
    published: true,
    publishedAt: new Date(),
  },
];

async function seedContent() {
  try {
    console.log("Seeding blog posts...");
    const { error: blogError } = await supabase.from("blogPosts").insert(blogPosts);
    if (blogError) throw blogError;
    console.log(`✓ Inserted ${blogPosts.length} blog posts`);

    console.log("Seeding help articles...");
    const { error: helpError } = await supabase.from("helpArticles").insert(helpArticles);
    if (helpError) throw helpError;
    console.log(`✓ Inserted ${helpArticles.length} help articles`);

    console.log("\n✓ Content seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding content:", error);
    process.exit(1);
  }
}

seedContent();
