# Supabase Auth Migration Guide

## Overview

This document outlines the complete migration from **Manus OAuth** to **Supabase Auth** for PardonPath. This migration removes the Manus infrastructure dependency and enables self-hosting.

**Status:** Backend infrastructure is ready. Frontend migration and deployment steps follow below.

---

## Why Migrate?

| Aspect | Manus Auth | Supabase Auth |
|--------|-----------|---------------|
| **Infrastructure** | Manus-hosted | Supabase-hosted (you already use it) |
| **Self-hosting** | ❌ Not possible | ✅ Yes |
| **Cost** | Included in Manus | Included in Supabase free tier |
| **Lock-in** | 🔴 High | 🟢 Low |
| **User limit (free)** | Included | 50,000 MAU |
| **User limit (paid)** | Included | 100,000 MAU, then $0.00325/MAU |

---

## Migration Phases

### Phase 1: Backend Infrastructure (✅ COMPLETE)

The following backend files have been updated to support Supabase Auth:

**New files:**
- `server/_core/supabase-auth.ts` — Supabase Admin client and token verification
- `server/supabase-auth.test.ts` — Tests for Supabase auth integration
- `docs/AUTH_COMPARISON.md` — Detailed comparison of both auth systems

**Modified files:**
- `server/_core/context.ts` — Now verifies tokens with Supabase instead of Manus SDK
- `server/db.ts` — Added `getUserBySupabaseId()` function; `upsertUser()` supports both ID types
- `package.json` — Added `@supabase/supabase-js` dependency

**Status:** ✅ Ready for deployment

---

### Phase 2: Database Schema (⏳ PENDING DEPLOYMENT)

**Migration SQL:** `drizzle/0001_breezy_silhouette.sql`

This migration converts the users table from Manus-based to Supabase-based:

```sql
-- Change users.id from auto-increment integer to UUID
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;
ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;

-- Make openId nullable (for backward compatibility)
ALTER TABLE "users" ALTER COLUMN "openId" DROP NOT NULL;
```

**When to apply:** During deployment, before starting the application

**How to apply:**
1. Via Supabase Dashboard: SQL Editor → paste the migration
2. Via CLI: `psql $SUPABASE_DB_URL < drizzle/0001_breezy_silhouette.sql`
3. Via Node script: `node apply-migration-direct.mjs drizzle/0001_breezy_silhouette.sql`

---

### Phase 3: Frontend Implementation (⏳ PENDING)

The frontend needs the following changes to use Supabase Auth:

**Files to update:**
1. `client/src/const.ts` — Remove `getLoginUrl()`, add Supabase client
2. `client/src/_core/hooks/useAuth.ts` — Replace with Supabase session listener
3. `client/src/lib/trpc.ts` — Update to send Authorization header instead of cookies
4. `client/src/pages/Login.tsx` — Create new login page with email/password and OAuth
5. `client/src/pages/Signup.tsx` — Create signup page
6. `client/src/App.tsx` — Update routing to include login/signup pages

**Expected time:** 1-2 hours

---

### Phase 4: Environment Variables (⏳ PENDING)

**Remove these Manus-specific variables:**
- `VITE_OAUTH_PORTAL_URL`
- `VITE_APP_ID`
- `OAUTH_SERVER_URL`
- `OWNER_OPEN_ID`

**Keep these (already in use):**
- `SUPABASE_URL` ✅ Already set
- `SUPABASE_ANON_KEY` ✅ Already set
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Already set
- `SUPABASE_DB_URL` ✅ Already set

**No new secrets needed!** All required Supabase credentials are already configured.

---

## Deployment Checklist

### Pre-Deployment (Before going live)

- [ ] Review `docs/AUTH_COMPARISON.md` for architecture overview
- [ ] Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in production environment
- [ ] Test Supabase Auth locally (after frontend migration)
- [ ] Verify `server/supabase-auth.test.ts` passes in CI/CD

### Deployment Steps

1. **Apply database migration:**
   ```bash
   node apply-migration-direct.mjs drizzle/0001_breezy_silhouette.sql
   ```
   Or via Supabase Dashboard SQL Editor:
   ```sql
   ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE uuid;
   ALTER TABLE "users" ALTER COLUMN "id" DROP IDENTITY;
   ALTER TABLE "users" ALTER COLUMN "openId" DROP NOT NULL;
   ```

2. **Deploy new backend code:**
   - Includes Supabase Auth token verification in `context.ts`
   - Includes `getUserBySupabaseId()` in `db.ts`

3. **Deploy new frontend code:**
   - Includes Supabase Auth UI
   - Includes new login/signup pages
   - Includes Authorization header in tRPC client

4. **Verify:**
   - Test login with email/password
   - Test OAuth (Google, GitHub, etc.)
   - Check that existing users can still log in (backward compat)
   - Verify dashboard loads after login

### Post-Deployment (After going live)

- [ ] Monitor error logs for auth failures
- [ ] Test login flow end-to-end
- [ ] Verify user data is syncing to the database
- [ ] Check that audit logs are recording user actions
- [ ] Remove old Manus OAuth configuration from any external systems

---

## Data Migration (Existing Users)

**If you have existing Manus Auth users:**

1. **Export Manus users:**
   ```sql
   SELECT openId, email, name, lastSignedIn FROM users;
   ```

2. **Map to Supabase:**
   - Create corresponding users in Supabase Auth
   - Update the `users` table with Supabase UUIDs
   - Keep `openId` for reference (optional)

3. **Backward compatibility:**
   - The schema supports both `id` (UUID) and `openId` (string)
   - Old sessions will fail (users must log in again)
   - This is acceptable for MVP

---

## Rollback Plan

If something goes wrong during deployment:

1. **Revert database migration:**
   ```sql
   -- Restore users.id as auto-increment integer
   ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE integer;
   ALTER TABLE "users" ADD GENERATED ALWAYS AS IDENTITY;
   ALTER TABLE "users" ALTER COLUMN "openId" SET NOT NULL;
   ```

2. **Revert backend code:**
   - Restore `server/_core/context.ts` to use Manus SDK
   - Restore `server/db.ts` to use `getUserByOpenId()`

3. **Revert frontend code:**
   - Restore `client/src/const.ts` with `getLoginUrl()`
   - Restore `client/src/_core/hooks/useAuth.ts` with tRPC-based auth

---

## Testing Checklist

### Unit Tests

```bash
# Test Supabase Auth integration
pnpm test -- server/supabase-auth.test.ts

# Test all routers
pnpm test
```

### Integration Tests (Manual)

1. **Login flow:**
   - [ ] Email/password login works
   - [ ] OAuth (Google) login works
   - [ ] Session persists across page reloads
   - [ ] Logout clears session

2. **Protected routes:**
   - [ ] Unauthenticated users redirected to login
   - [ ] Authenticated users can access dashboard
   - [ ] tRPC procedures receive auth context

3. **Data integrity:**
   - [ ] User data synced to database
   - [ ] Audit logs record login/logout
   - [ ] User profile displays correctly

---

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is not set"

**Error:** `Error: supabaseKey is required.`

**Solution:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your environment:
```bash
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Find it in: Supabase Dashboard → Settings → API → Service Role Key

### "Token verification failed"

**Error:** `[Supabase Auth] Token verification failed: ...`

**Cause:** Invalid or expired token

**Solution:**
- Check that the token is a valid Supabase JWT
- Verify token expiration (default: 1 hour)
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct

### "User not found after upsert"

**Error:** `[Auth] User not found in database after upsert`

**Cause:** Database connection issue or user sync failed

**Solution:**
- Verify `SUPABASE_DB_URL` is correct
- Check that migration was applied (users.id is UUID)
- Review database logs for errors

---

## FAQ

**Q: Will existing users need to log in again?**
A: Yes. Old Manus sessions won't work with Supabase Auth. Users will need to log in once using their email or OAuth.

**Q: Can I keep both auth systems running?**
A: Not recommended. The migration is designed to be a clean cutover.

**Q: What if I need to roll back?**
A: See the "Rollback Plan" section above. You can revert to Manus Auth if needed.

**Q: How do I add more OAuth providers?**
A: In Supabase Dashboard → Authentication → Providers, enable Google, GitHub, Apple, etc. No code changes needed.

**Q: Can I self-host Supabase Auth?**
A: Yes! Supabase can be self-hosted with Docker. See [Supabase Self-Hosting Guide](https://supabase.com/docs/guides/self-hosting).

---

## Next Steps

1. **Frontend migration** (1-2 hours)
   - Create login/signup pages
   - Update useAuth hook
   - Update tRPC client

2. **Testing** (1 hour)
   - Test login flows
   - Test protected routes
   - Verify data sync

3. **Deployment** (30 min)
   - Apply database migration
   - Deploy new code
   - Verify in production

4. **Cleanup** (15 min)
   - Remove Manus OAuth configuration
   - Update documentation
   - Remove old auth files

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review `docs/AUTH_COMPARISON.md` for architecture details
3. Check Supabase documentation: https://supabase.com/docs/guides/auth
4. Review server logs: `.manus-logs/devserver.log`

