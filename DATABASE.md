# PardonPath Database Schema

## Schema Overview
The PardonPath database is designed with the following principles:
- **Immutability:** Audit logs are append-only
- **Encryption:** Sensitive fields are encrypted at the application layer
- **Normalization:** Proper relationships to avoid data duplication
- **Indexing:** Strategic indexes for query performance

## Tables

### `users`
Core user identity table backed by Manus OAuth.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Surrogate key |
| openId | VARCHAR(64) | UNIQUE, NOT NULL | Manus OAuth identifier |
| email | VARCHAR(320) | UNIQUE, NOT NULL | User email |
| name | TEXT | NULL | User full name |
| loginMethod | VARCHAR(64) | NULL | OAuth provider (e.g., "google", "manus") |
| role | ENUM | NOT NULL, DEFAULT 'user' | user, admin, paralegal, partner |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE | Last update time |
| lastSignedIn | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last login time |

**Indexes:** openId (UNIQUE), email (UNIQUE)

---

### `applicants`
Personal information for pardon applicants.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Applicant ID |
| userId | INT | NOT NULL, FK | Links to users table |
| firstName | VARCHAR(100) | NOT NULL | First name |
| lastName | VARCHAR(100) | NOT NULL | Last name |
| email | VARCHAR(320) | NOT NULL | Contact email |
| phone | VARCHAR(20) | NULL | Contact phone |
| dateOfBirth | TIMESTAMP | NULL | Date of birth |
| sinEncrypted | TEXT | NULL | **ENCRYPTED** Social Insurance Number |
| driversLicenseEncrypted | TEXT | NULL | **ENCRYPTED** Driver's license number |
| province | VARCHAR(2) | NULL | Province code (e.g., "ON", "BC") |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE | Last update time |

**Indexes:** userId

**Encryption:** SIN and driver's license are encrypted using AES-256-GCM at the application layer.

---

### `applications`
Main application record tracking the lifecycle of a pardon request.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Application ID |
| applicantId | INT | NOT NULL, FK | Links to applicants table |
| status | ENUM | NOT NULL, DEFAULT 'intake' | intake, documents, review, submission, decision, completed, rejected |
| tier | ENUM | NOT NULL | diy, done_with_you, done_for_you |
| offenseTypeEncrypted | TEXT | NULL | **ENCRYPTED** Offense type (e.g., "Schedule 1") |
| offenseDateEncrypted | TEXT | NULL | **ENCRYPTED** Date of offense |
| sentenceDetailsEncrypted | TEXT | NULL | **ENCRYPTED** Sentence information |
| eligibilityStatus | ENUM | NULL | pass, flag, ineligible |
| eligibilityReportUrl | TEXT | NULL | S3 URL to eligibility report PDF |
| documentsApproved | BOOLEAN | DEFAULT FALSE | Whether all documents are approved |
| formGenerated | BOOLEAN | DEFAULT FALSE | Whether PBC form has been generated |
| formUrl | TEXT | NULL | S3 URL to generated PBC form |
| paymentId | VARCHAR(255) | NULL | Stripe payment ID |
| paymentStatus | ENUM | DEFAULT 'pending' | pending, completed, failed |
| submittedToPBC | BOOLEAN | DEFAULT FALSE | Whether submitted to Parole Board |
| pbcDecision | ENUM | NULL | approved, denied, pending |
| paralegalAssignedId | INT | NULL, FK | User ID of assigned paralegal |
| paralegalNotes | TEXT | NULL | Paralegal review notes |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Application creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE | Last update time |

**Indexes:** applicantId, status

**Encryption:** Offense type, date, and sentence details are encrypted using AES-256-GCM.

---

### `documents`
Uploaded court records, police certificates, and ID documents.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Document ID |
| applicationId | INT | NOT NULL, FK | Links to applications table |
| documentType | ENUM | NOT NULL | court_record, police_certificate, id_document, other |
| fileName | VARCHAR(255) | NOT NULL | Original file name |
| fileUrl | TEXT | NOT NULL | S3 URL (encrypted in transit via HTTPS) |
| fileKey | VARCHAR(255) | NOT NULL | S3 file key for retrieval |
| fileSizeBytes | INT | NULL | File size in bytes |
| mimeType | VARCHAR(100) | NULL | MIME type (e.g., "application/pdf") |
| uploadedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Upload timestamp |
| aiReviewStatus | ENUM | DEFAULT 'pending' | pending, approved, flagged |
| aiReviewNotes | TEXT | NULL | AI-generated completeness review notes |
| humanReviewStatus | ENUM | NULL | pending, approved, rejected |
| humanReviewNotes | TEXT | NULL | Paralegal review notes |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:** applicationId

**Storage:** Files are stored in S3 with encryption at rest. The fileUrl and fileKey are stored in the database for retrieval.

---

### `auditLogs`
Immutable log of all application actions for PIPEDA compliance.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Log entry ID |
| applicationId | INT | NOT NULL, FK | Links to applications table |
| userId | INT | NULL, FK | User who performed the action (NULL for system actions) |
| action | VARCHAR(100) | NOT NULL | Action type (e.g., "document_uploaded", "status_changed") |
| details | JSON | NULL | Action-specific details as JSON |
| ipAddress | VARCHAR(45) | NULL | IPv4 or IPv6 address |
| userAgent | TEXT | NULL | Browser user agent |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT NOW() | Action timestamp |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:** applicationId, timestamp

**Immutability:** This table is append-only. Entries are never updated or deleted.

---

### `notifications`
Email and SMS notifications sent to applicants.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Notification ID |
| applicationId | INT | NOT NULL, FK | Links to applications table |
| recipientEmail | VARCHAR(320) | NULL | Recipient email address |
| recipientPhone | VARCHAR(20) | NULL | Recipient phone number |
| notificationType | ENUM | NOT NULL | eligibility_confirmed, document_approved, form_ready, submission_sent, decision_received, milestone_update |
| channel | ENUM | NOT NULL | email, sms |
| status | ENUM | DEFAULT 'pending' | pending, sent, failed |
| externalId | VARCHAR(255) | NULL | Resend or Twilio message ID |
| sentAt | TIMESTAMP | NULL | Time notification was sent |
| failureReason | TEXT | NULL | Reason for failure (if applicable) |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:** applicationId

---

### `payments`
Stripe transactions for DIY, Done-With-You, and Done-For-You tiers.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Payment ID |
| applicationId | INT | NOT NULL, FK | Links to applications table |
| stripePaymentId | VARCHAR(255) | UNIQUE, NOT NULL | Stripe payment ID |
| tier | ENUM | NOT NULL | diy, done_with_you, done_for_you |
| amountCents | INT | NOT NULL | Amount in cents (e.g., 19900 for $199.00) |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'CAD' | Currency code |
| status | ENUM | DEFAULT 'pending' | pending, completed, failed, refunded |
| receiptUrl | TEXT | NULL | Stripe receipt URL |
| receiptSentAt | TIMESTAMP | NULL | Time receipt email was sent |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Payment creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE | Last update time |

**Indexes:** applicationId, stripePaymentId

**Pricing:**
- DIY: $199 CAD (19900 cents)
- Done-With-You: $599 CAD (59900 cents)
- Done-For-You: $1,199 CAD (119900 cents)

---

### `partners`
B2B partner accounts (law firms, paralegals).

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Partner ID |
| userId | INT | UNIQUE, NOT NULL, FK | Links to users table |
| companyName | VARCHAR(255) | NOT NULL | Law firm or paralegal company name |
| businessNumber | VARCHAR(20) | NULL | Canadian business number |
| apiKey | VARCHAR(255) | UNIQUE, NOT NULL | API key for B2B access |
| apiKeyRotatedAt | TIMESTAMP | DEFAULT NOW() | Last API key rotation time |
| maxClients | INT | DEFAULT 100 | Maximum clients they can manage |
| activeClients | INT | DEFAULT 0 | Current active clients |
| status | ENUM | DEFAULT 'active' | active, inactive, suspended |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Partner account creation time |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() ON UPDATE | Last update time |

**Indexes:** userId, apiKey

---

### `partnerClients`
Many-to-many relationship between partners and applications.

| Column | Type | Constraints | Notes |
| --- | --- | --- | --- |
| id | INT | PK, AUTO_INCREMENT | Relationship ID |
| partnerId | INT | NOT NULL, FK | Links to partners table |
| applicationId | INT | NOT NULL, FK | Links to applications table |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Relationship creation time |

**Indexes:** partnerId, applicationId

---

## Encryption Strategy

### Encrypted Fields
The following fields are encrypted at the application layer using AES-256-GCM:
- `applicants.sinEncrypted` - Social Insurance Number
- `applicants.driversLicenseEncrypted` - Driver's license
- `applications.offenseTypeEncrypted` - Offense type
- `applications.offenseDateEncrypted` - Date of offense
- `applications.sentenceDetailsEncrypted` - Sentence details

### Encryption Implementation
Encryption/decryption is handled in `server/_core/encryption.ts` (to be implemented in Phase 2). The encryption key is stored in environment variables and never exposed to the frontend.

---

## Query Patterns

### Get all applications for a user
```sql
SELECT a.* FROM applications a
JOIN applicants ap ON a.applicantId = ap.id
WHERE ap.userId = ?
ORDER BY a.createdAt DESC;
```

### Get audit log for an application
```sql
SELECT * FROM auditLogs
WHERE applicationId = ?
ORDER BY timestamp DESC;
```

### Get pending notifications
```sql
SELECT * FROM notifications
WHERE status = 'pending'
ORDER BY createdAt ASC;
```

### Get applications by status
```sql
SELECT * FROM applications
WHERE status = ?
ORDER BY updatedAt DESC;
```

---

## PIPEDA Compliance
- All user actions are logged in `auditLogs`
- Sensitive data is encrypted at rest
- Access is controlled via role-based permissions
- Data retention policies are enforced (to be implemented)
- User consent tracking is implemented (to be implemented in Phase 2)
