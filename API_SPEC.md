# PardonPath API Specification

## Overview
PardonPath exposes all business logic through **tRPC procedures**, providing end-to-end type safety from backend to frontend. This document outlines all available endpoints, their inputs, outputs, and authentication requirements.

## Authentication
All procedures except those explicitly marked as `publicProcedure` require authentication via Manus OAuth. The authenticated user is available as `ctx.user` in all procedures.

## Error Handling
All procedures return either a successful response or throw a `TRPCError` with one of the following codes:
- `NOT_FOUND` (404): Resource does not exist
- `FORBIDDEN` (403): User lacks permission
- `BAD_REQUEST` (400): Invalid input
- `INTERNAL_SERVER_ERROR` (500): Server error

## Routers

### `auth` Router
Authentication-related procedures.

#### `auth.me`
Get the current authenticated user.

**Type:** `publicProcedure.query()`  
**Input:** None  
**Output:**
```typescript
{
  id: number;
  openId: string;
  email: string;
  name: string | null;
  role: "user" | "admin" | "paralegal" | "partner";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
} | null
```

**Example:**
```typescript
const user = await trpc.auth.me.useQuery();
```

---

#### `auth.logout`
Log out the current user and clear the session cookie.

**Type:** `publicProcedure.mutation()`  
**Input:** None  
**Output:**
```typescript
{ success: true }
```

**Example:**
```typescript
await trpc.auth.logout.useMutation();
```

---

### `applications` Router
Application lifecycle management.

#### `applications.list`
Get all applications for the current user.

**Type:** `protectedProcedure.query()`  
**Input:** None  
**Output:**
```typescript
Array<{
  id: number;
  applicantId: number;
  status: "intake" | "documents" | "review" | "submission" | "decision" | "completed" | "rejected";
  tier: "diy" | "done_with_you" | "done_for_you";
  eligibilityStatus: "pass" | "flag" | "ineligible" | null;
  eligibilityReportUrl: string | null;
  documentsApproved: boolean;
  formGenerated: boolean;
  formUrl: string | null;
  paymentStatus: "pending" | "completed" | "failed";
  submittedToPBC: boolean;
  pbcDecision: "approved" | "denied" | "pending" | null;
  createdAt: Date;
  updatedAt: Date;
}>
```

**Example:**
```typescript
const { data: applications } = trpc.applications.list.useQuery();
```

---

#### `applications.getById`
Get a specific application by ID.

**Type:** `protectedProcedure.query()`  
**Input:**
```typescript
{
  applicationId: number;
}
```

**Output:** Same as `applications.list` (single object)

**Errors:**
- `NOT_FOUND`: Application does not exist

**Example:**
```typescript
const { data: application } = trpc.applications.getById.useQuery({ applicationId: 123 });
```

---

#### `applications.create`
Create a new application.

**Type:** `protectedProcedure.mutation()`  
**Input:**
```typescript
{
  tier: "diy" | "done_with_you" | "done_for_you";
}
```

**Output:**
```typescript
{
  id: number;
  tier: "diy" | "done_with_you" | "done_for_you";
  status: "intake";
}
```

**Audit Log:** `application_created` action logged with tier information

**Example:**
```typescript
const { mutate } = trpc.applications.create.useMutation();
mutate({ tier: "diy" });
```

---

#### `applications.updateStatus`
Update the status of an application.

**Type:** `protectedProcedure.mutation()`  
**Input:**
```typescript
{
  applicationId: number;
  status: "intake" | "documents" | "review" | "submission" | "decision" | "completed" | "rejected";
}
```

**Output:**
```typescript
{ success: true }
```

**Errors:**
- `NOT_FOUND`: Application does not exist
- `FORBIDDEN`: User is not the application owner (unless admin/paralegal)

**Audit Log:** `status_changed` action logged with before/after status

**Example:**
```typescript
const { mutate } = trpc.applications.updateStatus.useMutation();
mutate({ applicationId: 123, status: "documents" });
```

---

### `documents` Router
Document upload and management.

#### `documents.list`
Get all documents for an application.

**Type:** `protectedProcedure.query()`  
**Input:**
```typescript
{
  applicationId: number;
}
```

**Output:**
```typescript
Array<{
  id: number;
  applicationId: number;
  documentType: "court_record" | "police_certificate" | "id_document" | "other";
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSizeBytes: number | null;
  mimeType: string | null;
  uploadedAt: Date;
  aiReviewStatus: "pending" | "approved" | "flagged";
  aiReviewNotes: string | null;
  humanReviewStatus: "pending" | "approved" | "rejected" | null;
  humanReviewNotes: string | null;
  createdAt: Date;
}>
```

**Example:**
```typescript
const { data: documents } = trpc.documents.list.useQuery({ applicationId: 123 });
```

---

#### `documents.create`
Create a document record after S3 upload.

**Type:** `protectedProcedure.mutation()`  
**Input:**
```typescript
{
  applicationId: number;
  documentType: "court_record" | "police_certificate" | "id_document" | "other";
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileSizeBytes?: number;
  mimeType?: string;
}
```

**Output:**
```typescript
{
  id: number;
  status: "pending";
}
```

**Audit Log:** `document_uploaded` action logged with document type, file name, and size

**Example:**
```typescript
const { mutate } = trpc.documents.create.useMutation();
mutate({
  applicationId: 123,
  documentType: "court_record",
  fileName: "court_order.pdf",
  fileUrl: "https://s3.amazonaws.com/...",
  fileKey: "app-123/court_order.pdf",
  fileSizeBytes: 245000,
  mimeType: "application/pdf",
});
```

---

### `auditLogs` Router
Audit trail and compliance.

#### `auditLogs.list`
Get audit logs for an application (admin/paralegal only).

**Type:** `protectedProcedure.query()`  
**Input:**
```typescript
{
  applicationId: number;
}
```

**Output:**
```typescript
Array<{
  id: number;
  applicationId: number;
  userId: number | null;
  action: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
  createdAt: Date;
}>
```

**Errors:**
- `FORBIDDEN`: User is not admin or paralegal

**Example:**
```typescript
const { data: logs } = trpc.auditLogs.list.useQuery({ applicationId: 123 });
```

---

## Audit Log Actions

The following actions are logged for compliance and audit purposes:

| Action | Trigger | Details Logged |
| --- | --- | --- |
| `application_created` | New application created | tier |
| `status_changed` | Application status updated | from, to |
| `document_uploaded` | Document added to application | documentType, fileName, fileSize |
| `eligibility_checked` | Eligibility rules evaluated | result (pass/flag/ineligible) |
| `form_generated` | PBC form created | formUrl |
| `payment_completed` | Stripe payment processed | tier, amount, stripePaymentId |
| `paralegal_review_started` | Paralegal assigned | paralegalId |
| `paralegal_decision` | Paralegal approved/rejected | decision, notes |
| `submitted_to_pbc` | Application submitted to PBC | submissionId |
| `pbc_decision_received` | PBC decision received | decision |

---

## Future Routers (Phases 2-6)

### `eligibility` Router (Phase 2)
- `eligibility.check()` - Evaluate eligibility rules
- `eligibility.getReport()` - Retrieve eligibility report

### `forms` Router (Phase 4)
- `forms.generate()` - Generate PBC form
- `forms.validate()` - Validate form completeness

### `payments` Router (Phase 6)
- `payments.create()` - Initiate Stripe payment
- `payments.getReceipt()` - Retrieve payment receipt

### `partners` Router (Phase 6)
- `partners.create()` - Onboard B2B partner
- `partners.rotateApiKey()` - Rotate partner API key
- `partners.getClients()` - List partner's clients

---

## Rate Limiting
API calls are rate-limited to prevent abuse:
- **Authenticated users:** 1,000 requests per hour
- **Public endpoints:** 100 requests per hour

---

## Versioning
The API follows semantic versioning. Breaking changes will increment the major version number and be announced in advance.

---

## Support
For API issues or questions, contact support@pardonpath.ca or file an issue on GitHub.
