# PardonPath MVP Deployment Guide

## Pre-Deployment Checklist

### Environment Variables
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (backend only)
- [ ] `VITE_SUPABASE_URL` - Same as SUPABASE_URL (frontend)
- [ ] `VITE_SUPABASE_ANON_KEY` - Same as SUPABASE_ANON_KEY (frontend)
- [ ] `RESEND_API_KEY` - Resend email service API key
- [ ] `JWT_SECRET` - Session signing secret (generate: `openssl rand -base64 32`)
- [ ] `ENCRYPTION_KEY` - AES-256 encryption key (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] `CLOUDFLARE_AI_GATEWAY_URL` - Cloudflare AI Gateway endpoint
- [ ] `CF_AIG_TOKEN` - Cloudflare AI Gateway token
- [ ] `ANTHROPIC_API_KEY` - Anthropic API key (if not using Cloudflare gateway)

### Database Schema Migration

**Step 1: Review Migration SQL**
See `docs/MIGRATION_SQL.sql` for complete, tested migration script that:
- Converts users.id from integer to UUID
- Updates all foreign key references (applicants, documents, applications, payments, partners, milestones, auditLogs)
- Maintains data integrity with CASCADE constraints
- Makes openId nullable for backward compatibility

**Step 2: Execute in Supabase SQL Editor**
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy entire contents of `docs/MIGRATION_SQL.sql`
4. Paste into SQL Editor
5. Click "Run"
6. Wait for completion (should take <1 minute)
7. Verify no errors in output

**Step 3: Verify Migration**
After successful execution, run these verification queries:
```sql
-- Check users table structure (should show id as uuid)
SELECT column_name, data_type FROM information_schema.columns WHERE table_name='users';

-- Verify no data loss
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM applicants;
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM applications;
```

### Resend Email Configuration

**Step 1: Verify Domain**
1. Go to Resend Dashboard → Domains
2. Add your domain (pardonpath.ca)
3. Complete DNS verification
4. Wait for verification (can take 24-48 hours)

**For MVP (Testing Phase):**
- Emails will be sent from `onboarding@resend.dev` (Resend test domain)
- This is sufficient for testing; update to custom domain before production

**Step 2: Create Email Templates**
- Milestone templates are auto-generated in code
- No manual template setup required

### Admin User Setup

**Step 1: Create Admin Account**
1. Sign up via `/login` page with email: `admin@pardonpath.ca`
2. Verify email in Supabase Auth dashboard

**Step 2: Promote to Admin**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@pardonpath.ca';
```

**Step 3: Verify Admin Access**
1. Log in with admin account
2. Navigate to `/admin`
3. Should see Admin Dashboard with analytics

### Security Checklist

- [ ] Enable HTTPS (Manus provides automatic SSL)
- [ ] Enable RLS on all tables in Supabase
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
  -- ... repeat for all tables
  ```
- [ ] Verify encryption keys are secure (not in version control)
- [ ] Enable audit logging (auditLogs table)
- [ ] Configure Cloudflare DDoS protection
- [ ] Set up monitoring and alerting

### Testing Checklist

**Authentication Flow**
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] GitHub OAuth works
- [ ] Session persists across page reloads
- [ ] Logout clears session

**Eligibility Engine**
- [ ] Eligibility check returns correct results
- [ ] Ineligible applicants see rejection message
- [ ] Eligible applicants can proceed

**Document Upload**
- [ ] Document upload to S3 works
- [ ] AI document review completes
- [ ] Paralegal can approve/reject documents
- [ ] Audit log records all actions

**Status Tracking**
- [ ] Milestones update correctly
- [ ] Email notifications send on milestone updates
- [ ] Dashboard shows correct status
- [ ] Paralegal queue shows pending items

**Admin Dashboard**
- [ ] Admin can view all applications
- [ ] Analytics display correctly
- [ ] Filtering works (by status, tier, etc.)
- [ ] Application details modal opens

**Paralegal Queue**
- [ ] Paralegal can see pending documents
- [ ] Paralegal can approve/reject with notes
- [ ] Applicant receives email notification
- [ ] Status updates in dashboard

### Performance Testing

- [ ] Load test with 10+ concurrent users
- [ ] Database query performance acceptable (<500ms)
- [ ] S3 upload/download speed acceptable
- [ ] Email delivery within 5 minutes
- [ ] No memory leaks in dev server

### Monitoring & Logging

**Set Up Monitoring**
- [ ] Enable Supabase monitoring
- [ ] Enable Cloudflare analytics
- [ ] Set up error tracking (Sentry or similar)
- [ ] Configure log aggregation

**Key Metrics to Monitor**
- API response times
- Database query times
- Error rates
- Email delivery success rate
- User signup/login rates
- Document upload success rate

### Post-Deployment

**Day 1**
- [ ] Monitor error logs for 24 hours
- [ ] Verify email delivery
- [ ] Check database performance
- [ ] Gather user feedback

**Week 1**
- [ ] Review analytics
- [ ] Check for any data inconsistencies
- [ ] Verify audit logs are complete
- [ ] Performance optimization if needed

**Ongoing**
- [ ] Daily monitoring of error logs
- [ ] Weekly performance review
- [ ] Monthly security audit
- [ ] Quarterly backup verification

## Rollback Plan

If critical issues occur after deployment:

1. **Immediate Rollback**
   ```bash
   # Revert to previous checkpoint
   git revert HEAD
   pnpm build
   # Redeploy
   ```

2. **Database Rollback**
   ```sql
   -- Revert UUID migration if needed
   -- (Keep backup of original schema)
   ```

3. **Notify Users**
   - Send email to all users
   - Post status update on website
   - Monitor support channels

## Troubleshooting

### Email Not Sending
- Check RESEND_API_KEY is set correctly
- Verify domain is verified in Resend
- Check email logs in Resend dashboard
- Verify applicant email is valid

### Database Connection Fails
- Verify SUPABASE_DB_URL is correct
- Check SSL certificate is valid
- Verify network connectivity
- Check Supabase status page

### Authentication Fails
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase Auth configuration
- Verify OAuth provider settings (Google, GitHub)
- Clear browser cookies and try again

### Admin Dashboard Not Accessible
- Verify user role is 'admin' in database
- Check JWT_SECRET is correct
- Verify Authorization header is sent
- Check browser console for errors

## Support

For deployment issues:
1. Check logs: `tail -f .manus-logs/devserver.log`
2. Review error messages in browser console
3. Check Supabase dashboard for database errors
4. Verify all environment variables are set

Contact: support@pardonpath.ca
