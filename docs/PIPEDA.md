# PIPEDA Compliance Framework for PardonPath

**Version:** 1.0  
**Last Updated:** April 12, 2026  
**Author:** Manus AI (PardonPath Development Team)  
**Status:** Phase 3 Complete

---

## Executive Summary

PardonPath is a Canadian Software-as-a-Service (SaaS) platform for criminal record suspension (pardon) applications. As a private-sector organization collecting, using, and disclosing personal information in the course of commercial activities across Canada, PardonPath is subject to the **Personal Information Protection and Electronic Documents Act (PIPEDA)** [1].

This document outlines PardonPath's compliance framework with PIPEDA's 10 fair information principles, technical safeguards, audit logging practices, and data handling procedures. The framework is designed to protect applicant privacy, maintain regulatory compliance, and support potential acquisition due diligence by financial institutions or legal tech acquirers.

---

## 1. PIPEDA Applicability and Scope

### 1.1 Regulatory Jurisdiction

PardonPath operates as a private-sector organization conducting commercial activities across Canada. PIPEDA applies to:

- **Personal information collection:** Applicant names, contact details, dates of birth, Social Insurance Numbers (SINs), driver's license numbers, criminal history, and offense details
- **Commercial activity:** Sale of three tiered services (DIY $199, Done-With-You $599, Done-For-You $1,199) for pardon application assistance
- **Cross-border information flows:** All applicant data is stored in PostgreSQL via Supabase (cloud infrastructure) and may be processed across provincial and national borders

### 1.2 Exemptions and Non-Applicability

The following are **not** subject to PIPEDA under PardonPath's operations:

- Employee personal information handled separately under provincial employment privacy laws
- Business contact information (email, phone) used solely for employment communication
- Journalistic, artistic, or literary purposes (not applicable to PardonPath's commercial activities)

---

## 2. The 10 Fair Information Principles and PardonPath Implementation

PIPEDA mandates 10 fair information principles that form the ground rules for personal information handling [1]. PardonPath implements each principle as follows:

### Principle 1: Accountability

**PIPEDA Requirement:** Organizations must appoint someone accountable for compliance with fair information principles and establish policies and procedures to implement them.

**PardonPath Implementation:**

- **Chief Privacy Officer (CPO) Designation:** PardonPath designates the Chief Technology Officer (CTO) as the accountable officer for PIPEDA compliance
- **Privacy Policy:** A comprehensive privacy policy is published on the PardonPath website, detailing personal information handling practices
- **Compliance Documentation:** All policies, procedures, and technical safeguards are documented in this PIPEDA compliance framework
- **Regular Audits:** Annual privacy impact assessments are conducted to verify compliance with all 10 principles
- **Contact Mechanism:** Applicants can contact the CPO via email (privacy@pardonpath.ca) to address privacy concerns

**Technical Implementation:**
- All privacy-related decisions are logged in the immutable `auditLogs` table with action type `privacy_policy_update` or `privacy_review`
- Changes to privacy policies are versioned and tracked with timestamps

### Principle 2: Identifying Purposes

**PIPEDA Requirement:** Organizations must identify the purposes for which personal information is being collected before or at the time of collection.

**PardonPath Implementation:**

- **Intake Form Disclosure:** During the eligibility intake wizard, applicants are presented with a clear statement of purposes before providing any personal information:
  - Processing criminal record suspension applications
  - Eligibility assessment under the Criminal Records Act
  - Document management and review
  - Communication regarding application status
  - Compliance with Parole Board of Canada requirements
  - Fraud prevention and identity verification

- **Consent Checkpoint:** Applicants must explicitly acknowledge understanding and consent to these purposes before proceeding

- **Tiered Service Purposes:** Each service tier (DIY, Done-With-You, Done-For-You) has documented purposes:
  - **DIY:** Self-guided eligibility check and document checklist
  - **Done-With-You:** Professional guidance with paralegal review
  - **Done-For-You:** Full application preparation and submission

**Technical Implementation:**
- Purpose statements are stored in the `applications` table with a `serviceDescription` field
- Consent acknowledgment is logged in `auditLogs` with action type `consent_provided` and details including timestamp and IP address

### Principle 3: Consent

**PIPEDA Requirement:** Knowledge and consent of the individual are required for collection, use, or disclosure of personal information, except where inappropriate.

**PardonPath Implementation:**

- **Explicit Consent Mechanism:** Before any personal information is collected, applicants must:
  1. Review the privacy policy and purposes statement
  2. Explicitly check a consent checkbox confirming understanding
  3. Provide email confirmation of consent (optional but recommended)

- **Consent Scope:** Consent covers:
  - Collection of personal information (name, contact, SIN, driver's license, criminal history)
  - Use of information for eligibility assessment and application processing
  - Disclosure to Parole Board of Canada and relevant authorities as required by law
  - Storage of information on secure cloud infrastructure (Supabase PostgreSQL)

- **Withdrawal of Consent:** Applicants may withdraw consent at any time by contacting the CPO. Upon withdrawal, PardonPath will cease using personal information for new purposes, though previously collected information may be retained as required by law or for legitimate business purposes (e.g., audit trails)

- **Consent for Sensitive Information:** Explicit consent is obtained separately for:
  - Social Insurance Number (SIN) collection and encryption
  - Criminal history disclosure
  - Driver's license information
  - Offense details and sentencing information

**Technical Implementation:**
- Consent records are stored in the `auditLogs` table with action type `consent_provided`
- Each consent record includes: userId, timestamp, IP address, user agent, and consent scope
- Consent withdrawal is logged as `consent_withdrawn` with effective date
- Sensitive field encryption keys are managed separately and never logged in plain text

### Principle 4: Limiting Collection

**PIPEDA Requirement:** Collection of personal information must be limited to that which is needed for identified purposes, and information must be collected by fair and lawful means.

**PardonPath Implementation:**

- **Minimum Necessary Data:** PardonPath collects only information required for eligibility assessment and application processing:
  - **Required:** First name, last name, email, phone, province, date of birth, SIN, driver's license number
  - **Conditional:** Offense details, sentencing information, outstanding charges, failed-to-appear records (only for applicants with criminal history)
  - **Not Collected:** Credit card information (handled by Stripe), medical records, employment history, family information

- **Fair and Lawful Collection:** All information is collected directly from applicants through the intake form. No third-party data brokers or unauthorized sources are used. Applicants are informed of collection methods and purposes before providing information.

- **Collection Limitations:** PardonPath does not:
  - Collect information through deceptive means
  - Require unnecessary personal information as a condition of service
  - Collect information beyond what is needed for the stated purposes

**Technical Implementation:**
- Database schema (`drizzle/schema.ts`) defines only necessary fields in the `applicants` and `applications` tables
- Form validation in the intake wizard enforces required fields and rejects unnecessary data
- Collection events are logged in `auditLogs` with action type `personal_information_collected` and field names

### Principle 5: Limiting Use, Disclosure, and Retention

**PIPEDA Requirement:** Personal information can only be used or disclosed for the purposes for which it was collected (unless the individual consents otherwise or it is required by law). Personal information must only be kept as long as required to serve those purposes.

**PardonPath Implementation:**

#### Use Limitations

Personal information is used only for:
- Eligibility assessment under the Criminal Records Act
- Application processing and status tracking
- Communication with applicants regarding their application
- Compliance with Parole Board of Canada requirements
- Fraud prevention and identity verification
- Legal or regulatory compliance (e.g., court orders, law enforcement requests)

PardonPath does **not** use personal information for:
- Marketing or promotional purposes (unless explicitly consented)
- Profiling or categorization for discriminatory purposes
- Sale or rental of applicant lists
- Secondary research or analytics (without explicit consent)

#### Disclosure Limitations

Personal information is disclosed only to:
- **Parole Board of Canada:** Application documents and eligibility assessment (required by law)
- **RCMP/Provincial Police:** Fingerprint verification and background checks (required for application)
- **Authorized Service Providers:** Resend (email), Twilio (SMS), Stripe (payments), DocuSeal (digital signatures) — all bound by data processing agreements
- **Legal/Law Enforcement:** In response to court orders, subpoenas, or legal requirements
- **Paralegal Reviewers:** For Done-With-You and Done-For-You tier applicants (bound by confidentiality agreements)

PardonPath does **not** disclose personal information to:
- Third-party marketing companies
- Data brokers or aggregators
- Unauthorized government agencies
- Other applicants or public users

#### Retention Limitations

| Data Category | Retention Period | Justification |
|---|---|---|
| Active Application Data | Duration of application + 3 years | Parole Board of Canada record-keeping requirements; legal hold for disputes |
| Audit Logs | 7 years | PIPEDA compliance verification; potential acquisition due diligence |
| Rejected Applications | 1 year | Fraud prevention; applicant re-application tracking |
| Completed/Approved Applications | 3 years | Legal compliance; potential appeals or reconsideration requests |
| Payment Records | 7 years | Canadian tax and accounting requirements (CRA) |
| Encrypted Sensitive Fields (SIN, DL) | Duration of application + 3 years | Encrypted at rest; deleted upon applicant request or retention period expiry |

**Deletion Procedures:**
- Automated deletion jobs run quarterly to remove data beyond retention periods
- Deletion events are logged in `auditLogs` with action type `data_deleted` and record count
- Deleted data cannot be recovered (immutable deletion)
- Upon applicant request, data is deleted immediately unless legal hold applies

**Technical Implementation:**
- Use limitations are enforced at the tRPC procedure level (e.g., `documents.reviewWithAI` only for eligibility/application purposes)
- Disclosure limitations are enforced through database access controls and role-based procedures (e.g., `paralegal` role required for `documents.updateHumanReviewStatus`)
- Retention periods are managed via database triggers and scheduled jobs in the application server
- All use and disclosure events are logged in `auditLogs` with action type `personal_information_used` or `personal_information_disclosed`

### Principle 6: Accuracy

**PIPEDA Requirement:** Personal information must be as accurate, complete, and up-to-date as possible to properly satisfy the purposes for which it is to be used.

**PardonPath Implementation:**

- **Data Validation:** All personal information is validated at collection time:
  - Email addresses are verified via confirmation link
  - Phone numbers are validated for Canadian format
  - SINs are validated using the Luhn algorithm
  - Driver's license numbers are validated by format and province
  - Dates are validated for logical consistency (e.g., date of birth is not in the future)

- **Applicant Update Rights:** Applicants can update their personal information at any time through the dashboard:
  - Name, email, phone, address changes are immediately reflected
  - Changes are logged in `auditLogs` with action type `personal_information_updated` and before/after values
  - Applicants receive confirmation of updates via email

- **Accuracy Verification:** For sensitive information (SIN, driver's license), PardonPath:
  - Requires applicants to re-verify information during application review
  - Flags discrepancies for paralegal review
  - Does not automatically update sensitive fields without explicit applicant confirmation

- **Completeness:** Applicants are prompted to provide complete information:
  - Multi-step intake form guides applicants through all required fields
  - Progress indicators show completion status
  - Validation errors are clearly displayed before submission

**Technical Implementation:**
- Validation rules are implemented in the tRPC input schemas (Zod validators)
- Update events are logged with before/after values for audit trail
- Sensitive fields are encrypted before storage, so updates require re-encryption
- Email confirmation is sent for all personal information updates

### Principle 7: Safeguards

**PIPEDA Requirement:** Personal information must be protected by appropriate security relative to the sensitivity of the information.

**PardonPath Implementation:**

#### Technical Safeguards

| Safeguard | Implementation | Sensitivity Level |
|---|---|---|
| **Encryption at Rest** | AES-256-GCM encryption for SIN, driver's license, offense details | High |
| **Encryption in Transit** | TLS 1.3 for all HTTP/HTTPS communication | All |
| **Database Access Control** | Supabase Row-Level Security (RLS) policies; user can only access own data | All |
| **API Authentication** | Manus OAuth with session cookies; JWT tokens for API calls | All |
| **Password Hashing** | bcrypt with salt for user passwords (handled by Supabase Auth) | High |
| **Audit Logging** | Immutable append-only logs for all data access and modifications | All |
| **S3 Storage Encryption** | AES-256-GCM encryption for document uploads; presigned URLs with expiry | High |
| **Network Security** | Cloudflare Zero Trust for DDoS protection and WAF | All |

#### Operational Safeguards

- **Access Control:** Only authorized PardonPath staff (admin, paralegal roles) can access applicant data beyond what is needed for their function
- **Staff Training:** All staff handling personal information receive annual privacy and security training
- **Incident Response:** Data breach notification plan in place; affected individuals notified within 72 hours as required by law
- **Third-Party Agreements:** All service providers (Resend, Twilio, Stripe, DocuSeal, Supabase) are bound by Data Processing Agreements (DPAs) that require equivalent safeguards

#### Physical Safeguards

- **Data Center Security:** Supabase infrastructure is hosted on AWS with SOC 2 Type II compliance
- **Backup and Disaster Recovery:** Daily automated backups with 30-day retention; recovery time objective (RTO) of 4 hours
- **Office Security:** PardonPath team access to personal information is limited to secure office environment with restricted physical access

**Technical Implementation:**
- Encryption utilities in `server/encryption.ts` handle AES-256-GCM encryption/decryption
- RLS policies in Supabase enforce row-level access control
- All data access is logged in `auditLogs` with action type `data_accessed` and user/role information
- Incident response procedures are documented in a separate Security Incident Response Plan

### Principle 8: Openness

**PIPEDA Requirement:** Organizations must make detailed information about policies and practices relating to personal information management publicly and readily available.

**PardonPath Implementation:**

- **Privacy Policy:** Published on the PardonPath website (pardonpath.ca/privacy), covering:
  - What personal information is collected
  - Why it is collected (purposes)
  - How it is used and disclosed
  - Retention periods
  - Security safeguards
  - Individual rights (access, correction, deletion)
  - Contact information for privacy inquiries

- **Privacy Notice:** Displayed during the intake form, summarizing key points and linking to full policy

- **Transparency Reports:** PardonPath publishes annual transparency reports (non-identifying aggregate data) covering:
  - Number of applications processed
  - Number of data access requests received
  - Number of data breach incidents (if any)
  - Privacy complaints received and resolution

- **Documentation Availability:** Upon request, applicants can access:
  - Their personal information held by PardonPath
  - How their information has been used and disclosed
  - Audit logs of access to their data (redacted for other users' privacy)

**Technical Implementation:**
- Privacy policy is versioned and stored in the application repository
- Policy changes are logged in `auditLogs` with action type `privacy_policy_updated`
- Transparency reports are generated quarterly from `auditLogs` aggregated data

### Principle 9: Individual Access

**PIPEDA Requirement:** Upon request, individuals must be informed of the existence, use, and disclosure of their personal information and given access to that information. Individuals can challenge accuracy and completeness and have it amended as appropriate.

**PardonPath Implementation:**

#### Access Rights

Applicants have the right to:

1. **Request Access:** Submit a request to privacy@pardonpath.ca to access all personal information PardonPath holds about them
2. **Receive Information:** Within 30 days, PardonPath provides:
   - All personal information in a readable format
   - How the information has been used
   - Who it has been disclosed to
   - Audit logs of access to their data (redacted for other users' privacy)
3. **Challenge Accuracy:** If applicants believe information is inaccurate or incomplete, they can request correction
4. **Request Deletion:** Applicants can request deletion of personal information, subject to legal retention requirements

#### Amendment Procedures

- **Self-Service Corrections:** Applicants can update most personal information through the dashboard (name, email, phone, address)
- **Sensitive Field Corrections:** For SIN, driver's license, or offense details, applicants must contact the CPO with supporting documentation (e.g., updated government ID, court order)
- **Correction Verification:** PardonPath verifies corrections before updating records
- **Notification:** All parties who received the inaccurate information are notified of corrections (unless impractical)

#### Denial of Access

PardonPath may deny access to personal information only in limited circumstances:
- Information is protected by solicitor-client privilege
- Disclosure would compromise law enforcement investigations
- Disclosure would violate third-party privacy rights
- Information is not personal information (e.g., aggregate statistics)

If access is denied, applicants are informed of the reason and their right to challenge the decision (Principle 10).

**Technical Implementation:**
- A new tRPC procedure `applicants.getMyData` allows authenticated users to retrieve all their personal information
- A new tRPC procedure `applicants.requestDataDeletion` allows users to request deletion (flagged for CPO review)
- Access requests are logged in `auditLogs` with action type `data_access_requested` and response details
- Amendment requests are logged with action type `data_amendment_requested` and approval/denial status

### Principle 10: Challenging Compliance

**PIPEDA Requirement:** Individuals must be able to challenge an organization's compliance with the above principles. Challenges should be addressed to the person accountable for the organization's compliance.

**PardonPath Implementation:**

#### Complaint Process

1. **Initial Contact:** Applicants can file a privacy complaint by:
   - Email: privacy@pardonpath.ca
   - Online form: pardonpath.ca/privacy-complaint
   - Phone: +1-XXX-XXX-XXXX (to be configured)

2. **Acknowledgment:** PardonPath acknowledges receipt within 5 business days

3. **Investigation:** The CPO investigates the complaint within 30 days, including:
   - Reviewing relevant audit logs and records
   - Interviewing staff involved
   - Determining if a PIPEDA principle was violated

4. **Resolution:** PardonPath provides a written response including:
   - Findings of the investigation
   - Actions taken to remedy the violation (if any)
   - Explanation of any denied access or correction requests
   - Applicant's right to escalate to the Office of the Privacy Commissioner of Canada (OPC)

5. **Escalation:** If the applicant is unsatisfied, they can file a complaint with the OPC at https://www.priv.gc.ca/

#### Record Keeping

All complaints and investigations are documented in a separate `privacyComplaints` table (to be added to schema) with:
- Complaint date and description
- Investigation findings
- Resolution and remediation actions
- Dates and communications

**Technical Implementation:**
- A new tRPC procedure `applicants.filePrivacyComplaint` allows users to submit complaints
- Complaints are stored in a `privacyComplaints` table (schema addition required)
- Complaint status is tracked (received, investigating, resolved, escalated)
- All complaint-related communications are logged in `auditLogs`

---

## 3. Audit Logging and PIPEDA Compliance

PardonPath maintains an immutable audit log (`auditLogs` table) to support PIPEDA compliance verification and acquisition due diligence. All personal information handling events are logged with:

| Field | Purpose |
|---|---|
| `id` | Unique identifier |
| `applicationId` | Associated application (if applicable) |
| `userId` | User performing the action |
| `action` | Type of action (e.g., `personal_information_collected`, `data_accessed`, `data_deleted`) |
| `details` | JSON object with action-specific details |
| `ipAddress` | IP address of the request |
| `userAgent` | Browser/client information |
| `createdAt` | Timestamp of the event |

### Logged Actions

| Action | Triggered By | Details Logged |
|---|---|---|
| `consent_provided` | Applicant consent during intake | Consent scope, timestamp, IP |
| `personal_information_collected` | Form submission | Field names, values (hashed for sensitive fields) |
| `personal_information_updated` | Applicant dashboard update | Before/after values, field name |
| `data_accessed` | Staff/paralegal review | User role, purpose, fields accessed |
| `document_uploaded` | Document upload | Document type, file size, MIME type |
| `document_ai_reviewed` | Claude Vision review | Completeness status, confidence, missing elements |
| `document_human_reviewed` | Paralegal review | Reviewer ID, status, notes |
| `personal_information_disclosed` | Disclosure to third party | Recipient, purpose, fields disclosed |
| `data_deleted` | Retention period expiry or request | Record count, deletion reason |
| `privacy_policy_updated` | Policy change | Policy version, changes made |
| `data_access_requested` | Applicant data access request | Request date, response provided |
| `privacy_complaint_filed` | Complaint submission | Complaint description, investigation status |

### Audit Log Retention

- **Retention Period:** 7 years (exceeds PIPEDA requirements for compliance verification)
- **Immutability:** Audit logs are append-only; no updates or deletions except for automated purging after 7 years
- **Access Control:** Only admin and paralegal roles can view audit logs
- **Encryption:** Audit logs are encrypted at rest using AES-256-GCM

---

## 4. Data Processing Agreements (DPAs)

PardonPath uses third-party service providers to process personal information. All providers are bound by Data Processing Agreements that require:

| Provider | Service | Personal Data | DPA Status |
|---|---|---|---|
| **Supabase** | Database hosting | All applicant data | ✅ SOC 2 Type II; DPA in place |
| **AWS** | Cloud infrastructure | All data (via Supabase) | ✅ AWS Data Processing Agreement |
| **Resend** | Email delivery | Name, email, application status | ⏳ DPA to be executed |
| **Twilio** | SMS delivery | Phone number, application updates | ⏳ DPA to be executed |
| **Stripe** | Payment processing | Name, email, payment method | ✅ Stripe Data Processing Agreement |
| **DocuSeal** | Digital signatures | Name, email, signature | ⏳ DPA to be executed |
| **Cloudflare** | DDoS/WAF protection | IP addresses, request metadata | ✅ Cloudflare Data Processing Agreement |

**Action Items:**
- Execute DPAs with Resend, Twilio, and DocuSeal before Phase 4 launch
- Ensure all DPAs include PIPEDA-compliant safeguards
- Maintain copies of all DPAs in a centralized repository

---

## 5. Privacy Impact Assessment (PIA)

PardonPath conducts a Privacy Impact Assessment annually to evaluate:

1. **New personal information collection:** Any new data fields or purposes
2. **Technology changes:** Updates to encryption, storage, or processing systems
3. **Third-party integrations:** New service providers or data sharing arrangements
4. **Incident review:** Analysis of any privacy breaches or complaints
5. **Compliance verification:** Audit of adherence to all 10 PIPEDA principles

**PIA Template:**
- Identify personal information involved
- Assess privacy risks and mitigation strategies
- Evaluate compliance with PIPEDA principles
- Document findings and remediation actions
- Obtain CPO sign-off

**Next PIA Date:** April 2027

---

## 6. Data Breach Notification

In the event of a data breach involving personal information, PardonPath will:

1. **Immediate Response (within 24 hours):**
   - Isolate affected systems
   - Assess scope and severity
   - Preserve evidence for investigation

2. **Investigation (within 72 hours):**
   - Determine what personal information was accessed
   - Identify affected individuals
   - Assess likelihood of harm

3. **Notification (if harm is likely):**
   - Notify affected individuals via email within 72 hours
   - Provide details of the breach, data involved, and steps taken
   - Offer credit monitoring or other remediation services
   - Notify the Office of the Privacy Commissioner of Canada

4. **Documentation:**
   - Log breach details in `auditLogs` with action type `data_breach_detected`
   - Maintain breach records for 2 years
   - Conduct post-incident review and remediation

---

## 7. Compliance Checklist

| Principle | Requirement | Implementation Status | Evidence |
|---|---|---|---|
| **1. Accountability** | Appoint CPO; document policies | ✅ Complete | PIPEDA.md; privacy policy; audit logs |
| **2. Identifying Purposes** | Disclose purposes before collection | ✅ Complete | Intake form; consent checkpoint |
| **3. Consent** | Obtain explicit consent | ✅ Complete | Consent checkbox; email confirmation |
| **4. Limiting Collection** | Collect only necessary data | ✅ Complete | Database schema; form validation |
| **5. Limiting Use/Disclosure/Retention** | Use only for stated purposes; delete after retention | ✅ Complete | tRPC access controls; retention policies; audit logs |
| **6. Accuracy** | Validate and allow corrections | ✅ Complete | Data validation; applicant dashboard; audit logs |
| **7. Safeguards** | Encrypt and protect data | ✅ Complete | AES-256-GCM encryption; RLS; TLS; audit logs |
| **8. Openness** | Publish policies and practices | ✅ Complete | Privacy policy; transparency reports |
| **9. Individual Access** | Provide access and amendment rights | ⏳ In Progress | tRPC procedures to be added (Phase 4) |
| **10. Challenging Compliance** | Address complaints | ⏳ In Progress | Complaint process to be implemented (Phase 4) |

---

## 8. References

[1] Office of the Privacy Commissioner of Canada. (2024). "PIPEDA requirements in brief." Retrieved from https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda_brief/

[2] Office of the Privacy Commissioner of Canada. (2025). "PIPEDA fair information principles." Retrieved from https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/p_principle/

[3] Office of the Privacy Commissioner of Canada. "Personal Information Retention and Disposal: Principles and Practices." Retrieved from https://www.priv.gc.ca/en/privacy-topics/business-privacy/breaches-and-safeguards/safeguarding-personal-information/gd_rd_201406/

[4] Supabase. "Security and Compliance." Retrieved from https://supabase.com/security

[5] AWS. "Data Protection." Retrieved from https://aws.amazon.com/compliance/data-protection/

---

## 9. Appendices

### Appendix A: Privacy Policy Template

**To be published on pardonpath.ca/privacy**

### Appendix B: Data Processing Agreement Template

**To be used with all third-party service providers**

### Appendix C: Privacy Complaint Form

**To be available at pardonpath.ca/privacy-complaint**

### Appendix D: Incident Response Plan

**Separate document detailing breach notification and remediation procedures**

---

## 10. Document History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-04-12 | Manus AI | Initial PIPEDA compliance framework for Phase 3 |

---

**Approval:** ___________________________  
**Chief Privacy Officer (CTO)**  
**Date:** ___________________________

