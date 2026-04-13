# PardonPath MVP: Feature Tracker

## Phase 1: The Foundation (Infrastructure, DB Schema, Auth, Sneat UI) - ✅ COMPLETE
- [x] Database schema: applicants, applications, audit_logs, documents, notifications, payments
- [x] Supabase Auth integration (email/Google login)
- [x] Row-Level Security (RLS) configuration
- [x] Encrypted fields for sensitive data (SIN, charges)
- [x] Cloudflare AI Gateway setup
- [x] Initial API spec documentation
- [x] Environment variables configuration
- [x] Core tRPC procedures (applications, documents, auditLogs) - SKELETON
- [x] Database query helpers - SKELETON
- [x] Anthropic API validation tests
- [x] **PHASE 1 GAP CLOSURE:**
- [x] Apply Drizzle migration SQL to Supabase database
- [x] Implement field-level encryption/decryption utilities (AES-256-GCM)
- [x] Wire Cloudflare AI Gateway into LLM invocation path
- [x] Create comprehensive API_SPEC.md documentation
- [x] Fix tRPC procedures (remove applicantId: 0 placeholder) - Real applicant creation logic
- [x] Add integration tests for tRPC routes (auth, authorization, errors) - 15 tests passing
- [x] TypeScript compilation clean
- [x] PostgreSQL migration applied to Supabase (9 tables created)
- [x] All database tables verified in Supabase

**DEFERRED TO PHASE 5:**
- [ ] Materio MUI Next.js Admin Free template integration (UI enhancement)

## Phase 2: Eligibility Engine (Intake Logic, Rules Engine) - ✅ CORE COMPLETE
- [ ] Materio MUI Next.js Admin Free template integration (UI enhancement - defer to Phase 5)
- [x] Criminal Records Act rules engine (waiting periods, Schedule 1, hybrid offenses)
- [x] Eligibility pass/flag/ineligible logic
- [x] Vitest unit tests for eligibility rules (11 tests passing)
- [x] API endpoint: POST /api/eligibility/check (tRPC mutation integrated)
- [ ] Multi-step intake wizard form (offense type, dates, province, sentence) - UI task
- [ ] Eligibility report PDF generation - Phase 4 task
- [x] Audit log entries for eligibility checks (schema supports it)

## Phase 3: Document Workflow & Storage (Secure Storage, RCMP Locator)
- [ ] Secure document upload portal
- [ ] S3 integration with encryption
- [ ] Document checklist generator (jurisdiction-specific)
- [ ] AI-assisted document completeness review (Claude vision)
- [ ] RCMP-accredited fingerprint provider locator (postal code search)
- [ ] Document viewer for admin dashboard
- [ ] Audit log entries for document uploads/reviews
- [ ] PIPEDA compliance documentation

## Phase 4: Form Automation & PDF Generation (PBC Form Mapping)
- [ ] PBC form field mapping logic
- [ ] PDF pre-filling from intake data
- [ ] Validation layer for common errors
- [ ] Print-ready PDF export
- [ ] API endpoint: POST /api/forms/generate
- [ ] Vitest unit tests for form generation
- [ ] Audit log entries for form generation

## Phase 5: Dashboard & Notifications (Status Tracking, Resend Integration)
- [ ] Applicant dashboard with real-time status tracker
- [ ] Application stages (intake → documents → review → submission → decision)
- [ ] Milestone history and progress indicators
- [ ] Resend email integration for milestone alerts
- [ ] Twilio SMS integration for milestone alerts
- [ ] Email/SMS templates for each milestone
- [ ] Internal paralegal review queue dashboard
- [ ] Admin dashboard for application management
- [ ] Audit log entries for status changes and notifications

## Phase 6: Launch & Exit (Payments, Partner Portal, Paperclip Integration)
- [ ] Stripe integration for three tiers (DIY $199, Done-With-You $599, Done-For-You $1,199)
- [ ] Subscription management
- [ ] Receipt emails via Resend
- [ ] Internal paralegal review queue (admin-only)
- [ ] Document viewer for paralegals
- [ ] Approval/rejection actions with notes
- [ ] Role-based access control (admin, user, paralegal, partner)
- [ ] B2B partner portal for law firms
- [ ] Partner onboarding flow
- [ ] Partner API access management
- [ ] Paperclip agent orchestration setup
- [ ] Unit economics dashboard (LTV/CAC tracking)
- [ ] Compliance documentation finalization
- [ ] API documentation for B2B partners
- [ ] Audit log entries for payments and partner actions

## Cross-Phase Requirements
- [ ] Immutable audit log (all actions timestamped and stored)
- [ ] PIPEDA compliance verification
- [ ] API-first architecture with documented endpoints
- [ ] Vitest test coverage for critical paths
- [ ] Error handling and validation across all features
- [ ] Security review (encryption, RLS, Zero Trust)
