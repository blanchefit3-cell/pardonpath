# PardonPath Architecture

## Overview
PardonPath is a Canadian record suspension (pardon) platform built with a "Centaur" team model (Manus as CTO + User). The architecture is designed for "Exit-Ready" acquisition with API-first design, immutable audit logging, and PIPEDA compliance.

## Tech Stack
- **Frontend:** React 19 + Tailwind 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11
- **Database:** MySQL (via Supabase)
- **ORM:** Drizzle ORM
- **AI:** Claude 3.5 Sonnet (via Anthropic API + Cloudflare AI Gateway)
- **Storage:** S3 (for documents with encryption)
- **Auth:** Manus OAuth
- **Payments:** Stripe
- **Email:** Resend
- **SMS:** Twilio

## Core Principles

### 1. API-First Architecture
All business logic is exposed via tRPC procedures, making the platform "headless" and suitable for B2B white-labeling. The frontend is a consumer of these APIs, not the source of truth.

### 2. Immutable Audit Trail
Every action (document upload, status change, form generation, payment, review decision) is logged in the `auditLogs` table with:
- Timestamp
- User ID
- Action type
- Detailed JSON payload
- IP address and user agent

This ensures PIPEDA compliance and provides a complete audit trail for acquisition due diligence.

### 3. Encrypted Sensitive Fields
Sensitive data (SIN, driver's license, offense type, offense date, sentence details) is encrypted at the application layer before being stored in the database. Encryption/decryption happens in `server/_core/encryption.ts` (to be implemented in Phase 2).

### 4. Role-Based Access Control (RBAC)
The `users.role` field supports four roles:
- **user:** Applicants (default)
- **admin:** Project owner with full access
- **paralegal:** Internal staff who review applications
- **partner:** B2B partners (law firms, paralegals) who manage their own clients

## Database Schema

### Core Tables
1. **users:** Manus OAuth identity + role
2. **applicants:** Personal information (encrypted SIN, driver's license)
3. **applications:** Application lifecycle (status, tier, eligibility, documents, forms, payments)
4. **documents:** Uploaded court records, police certificates, ID documents
5. **auditLogs:** Immutable action log (PIPEDA compliance)
6. **notifications:** Email/SMS milestone alerts
7. **payments:** Stripe transactions (DIY, Done-With-You, Done-For-You)
8. **partners:** B2B partner accounts
9. **partnerClients:** Many-to-many relationship between partners and applications

### Key Relationships
- `users` (1) → (N) `applicants` (via userId)
- `applicants` (1) → (N) `applications` (via applicantId)
- `applications` (1) → (N) `documents` (via applicationId)
- `applications` (1) → (N) `auditLogs` (via applicationId)
- `applications` (1) → (N) `notifications` (via applicationId)
- `applications` (1) → (N) `payments` (via applicationId)
- `partners` (1) → (N) `partnerClients` (via partnerId)
- `partnerClients` (N) → (1) `applications` (via applicationId)

## tRPC Router Structure

### `applications` Router
- `list()` - Get current user's applications
- `getById(applicationId)` - Get specific application
- `create(tier)` - Create new application
- `updateStatus(applicationId, status)` - Update application status

### `documents` Router
- `list(applicationId)` - Get documents for application
- `create(...)` - Create document record after S3 upload

### `auditLogs` Router
- `list(applicationId)` - Get audit logs (admin/paralegal only)

### Future Routers (Phases 2-6)
- `eligibility` - Eligibility check and rules engine
- `forms` - PBC form generation
- `payments` - Stripe integration
- `notifications` - Email/SMS alerts
- `partners` - B2B partner management

## Security & Compliance

### PIPEDA Compliance
- Immutable audit logs for all actions
- Encrypted sensitive fields
- Row-Level Security (RLS) via Supabase
- User consent tracking (to be implemented)

### Data Protection
- S3 encryption for documents
- HTTPS for all communication
- Cloudflare Zero Trust for internal dashboards
- JWT-based session management

### API Security
- tRPC type-safe procedures
- Input validation via Zod
- Protected procedures require authentication
- Role-based access control for sensitive operations

## Deployment
- **Frontend:** Vercel (auto-deploy on git push)
- **Backend:** Vercel Serverless Functions
- **Database:** Supabase (PostgreSQL)
- **Storage:** S3
- **CDN:** Cloudflare

## Monitoring & Logging
- Dev server logs: `.manus-logs/devserver.log`
- Browser console: `.manus-logs/browserConsole.log`
- Network requests: `.manus-logs/networkRequests.log`
- Session replay: `.manus-logs/sessionReplay.log`

## Future Enhancements (Post-MVP)
- Paperclip agent orchestration for autonomous operations
- Advanced analytics dashboard
- Multi-language support (French)
- Mobile app (React Native)
- US I-192 waiver workflow
