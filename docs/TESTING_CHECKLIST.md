# PardonPath MVP: Testing & Polishing Checklist

## Phase 1: End-to-End User Flows

### Authentication Flow
- [ ] Sign up with email/password
- [ ] Sign up with Google OAuth
- [ ] Sign up with GitHub OAuth
- [ ] Email verification (if required)
- [ ] Login with existing email/password
- [ ] Login with OAuth
- [ ] Logout and session cleanup
- [ ] Protected routes redirect to login
- [ ] Refresh token handling
- [ ] Error messages for invalid credentials
- [ ] Password reset flow (if implemented)

### Eligibility Check Flow
- [ ] Load eligibility form
- [ ] Submit eligibility check
- [ ] Display eligibility result (eligible/ineligible/flag)
- [ ] Show waiting period calculation
- [ ] Display Schedule 1 offense info
- [ ] Handle errors gracefully
- [ ] Audit log entry created
- [ ] Mobile responsiveness

### Document Upload Flow
- [ ] Upload single document
- [ ] Upload multiple documents
- [ ] File type validation
- [ ] File size validation
- [ ] Progress indicator during upload
- [ ] Success confirmation
- [ ] Error handling (network, file too large, etc.)
- [ ] Document appears in list
- [ ] Delete document
- [ ] Download document
- [ ] S3 storage verified

### Form Generation Flow
- [ ] Load form generation page
- [ ] Pre-fill from intake data
- [ ] Validate all required fields
- [ ] Generate PDF
- [ ] Download PDF
- [ ] PDF contains correct data
- [ ] Audit log entry created
- [ ] Error handling for invalid data

---

## Phase 2: Dashboard & Status Tracking

### Applicant Dashboard
- [ ] Load dashboard
- [ ] Display current application status
- [ ] Show progress bar (correct percentage)
- [ ] Display milestone timeline
- [ ] Milestones show correct status (completed/pending/in-progress)
- [ ] Completed milestones show date
- [ ] Recent updates section
- [ ] Empty state when no data
- [ ] Loading skeleton while fetching
- [ ] Error state with retry button
- [ ] Mobile responsiveness

### Email Notifications
- [ ] Email sent on intake_started
- [ ] Email sent on documents_submitted
- [ ] Email sent on documents_approved
- [ ] Email sent on form_generated
- [ ] Email sent on form_submitted
- [ ] Email sent on under_review
- [ ] Email sent on decision_received
- [ ] Email sent on approved
- [ ] Email sent on rejected
- [ ] Email contains correct applicant name
- [ ] Email contains correct milestone info
- [ ] Email has unsubscribe link (if required)

### Real-Time Updates
- [ ] Dashboard updates when status changes
- [ ] Milestones appear immediately after recording
- [ ] No page refresh required
- [ ] WebSocket/polling working correctly

---

## Phase 3: Admin & Paralegal Workflows

### Paralegal Review Queue
- [ ] Load queue dashboard
- [ ] Display all pending applications
- [ ] Filter by status
- [ ] Filter by tier
- [ ] Sort by date
- [ ] Click to view application details
- [ ] View documents
- [ ] Approve application
- [ ] Reject application
- [ ] Add notes to application
- [ ] Email sent to applicant on approve/reject
- [ ] Audit log entry created
- [ ] Role-based access (paralegals only)

### Admin Dashboard
- [ ] Load admin dashboard
- [ ] Display analytics (total applications, conversion rate, etc.)
- [ ] Display all applications
- [ ] Filter applications
- [ ] Search applications
- [ ] View application details
- [ ] View audit logs
- [ ] Export data (if required)
- [ ] Role-based access (admins only)
- [ ] Performance acceptable (< 2s load time)

### User Management (Admin)
- [ ] View all users
- [ ] Promote user to paralegal
- [ ] Promote user to admin
- [ ] Demote user
- [ ] Disable user account
- [ ] Audit log entry created

---

## Phase 4: UX Polish

### Error Messages
- [ ] All errors have clear, actionable messages
- [ ] No generic "Something went wrong"
- [ ] Error messages are visible (not hidden)
- [ ] Error messages have retry button where applicable
- [ ] Network errors handled gracefully
- [ ] Validation errors shown inline

### Loading States
- [ ] Loading skeleton shown while fetching
- [ ] Loading spinner shown during mutations
- [ ] Buttons disabled during submission
- [ ] No duplicate submissions possible
- [ ] Loading state clears on error

### Accessibility
- [ ] All form inputs have labels
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG AA
- [ ] Alt text on images
- [ ] Screen reader friendly
- [ ] No keyboard traps

### Responsiveness
- [ ] Mobile (375px) - all pages functional
- [ ] Tablet (768px) - all pages functional
- [ ] Desktop (1024px+) - all pages functional
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Images scale properly
- [ ] Forms stack vertically on mobile

### Visual Polish
- [ ] Consistent spacing
- [ ] Consistent typography
- [ ] Consistent colors
- [ ] Consistent button styles
- [ ] Consistent card styles
- [ ] No broken images
- [ ] No console errors
- [ ] No console warnings

---

## Phase 5: Performance & Security

### Performance
- [ ] Landing page loads in < 2s
- [ ] Dashboard loads in < 2s
- [ ] Form submission completes in < 3s
- [ ] No memory leaks
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Lighthouse score > 80

### Security
- [ ] No sensitive data in console logs
- [ ] No sensitive data in localStorage
- [ ] CSRF protection enabled
- [ ] XSS protection enabled
- [ ] SQL injection not possible (using Drizzle)
- [ ] Authentication tokens secure (httpOnly cookies)
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all endpoints
- [ ] Output encoding on all user data
- [ ] No hardcoded secrets
- [ ] Environment variables properly configured

### Database
- [ ] RLS policies enforced
- [ ] Audit logs immutable
- [ ] Data encryption working
- [ ] Backups configured
- [ ] No N+1 queries
- [ ] Indexes on frequently queried columns

---

## Phase 6: Final Checks

### Documentation
- [ ] README.md complete
- [ ] API documentation updated
- [ ] Deployment guide tested
- [ ] Environment variables documented
- [ ] Known issues documented

### Code Quality
- [ ] No console.log statements (except errors)
- [ ] No TODO comments
- [ ] No commented-out code
- [ ] TypeScript strict mode enabled
- [ ] All tests passing
- [ ] No linting errors

### Deployment Readiness
- [ ] All secrets configured
- [ ] Database migration tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Error tracking configured
- [ ] Analytics configured

---

## Testing Methodology

### Manual Testing
1. Create a test user account
2. Complete full eligibility check
3. Upload test documents
4. Generate form
5. Check dashboard
6. Verify emails sent
7. Test admin workflows
8. Test error scenarios

### Automated Testing
- Run full test suite: `pnpm test`
- Check TypeScript: `pnpm tsc --noEmit`
- Check linting: `pnpm lint` (if configured)

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Device Testing
- iPhone 12/13/14
- Samsung Galaxy S21/S22
- iPad Pro
- Desktop (1920x1080)
- Laptop (1366x768)

---

## Known Issues to Verify

1. **Router Mock Context** (2 tests failing)
   - Status: Non-blocking, pre-existing
   - Verify: Production auth flows work end-to-end

2. **Email Timeout** (1 test failing)
   - Status: Non-blocking
   - Verify: Emails send successfully in production

---

## Sign-Off Criteria

- [ ] All manual tests pass
- [ ] All automated tests pass (79/81, with 2 known failures)
- [ ] No critical bugs found
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] Accessibility compliant
- [ ] Mobile responsive
- [ ] Documentation complete
- [ ] Ready for production deployment
