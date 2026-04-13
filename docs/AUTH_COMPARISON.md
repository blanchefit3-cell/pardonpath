# Manus Auth vs Supabase Auth: Detailed Comparison

## Current Architecture: Manus Auth

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                │
├─────────────────────────────────────────────────────────────────┤
│ getLoginUrl()                                                   │
│   ↓                                                              │
│ window.location = "https://manus.im/app-auth?appId=...&..."    │
│   ↓                                                              │
│ User logs in at Manus portal                                    │
│   ↓                                                              │
│ Redirect to /api/oauth/callback?code=...&state=...             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (Express + tRPC)                                        │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/oauth/callback                                        │
│   ↓                                                              │
│ sdk.exchangeCodeForToken(code, state)                           │
│   ↓                                                              │
│ HTTP POST to OAUTH_SERVER_URL (Manus OAuth service)             │
│   ↓                                                              │
│ Response: { accessToken, refreshToken, ... }                    │
│   ↓                                                              │
│ sdk.getUserInfo(accessToken)                                    │
│   ↓                                                              │
│ HTTP POST to OAUTH_SERVER_URL again                             │
│   ↓                                                              │
│ Response: { openId, email, name, platforms, ... }               │
│   ↓                                                              │
│ db.upsertUser({ openId, email, name, ... })                    │
│   ↓                                                              │
│ sdk.createSessionToken(openId, appId, name)                     │
│   ↓                                                              │
│ JWT signed with JWT_SECRET                                      │
│   ↓                                                              │
│ Set cookie: app_session_id = JWT                                │
│   ↓                                                              │
│ Redirect to /                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SUBSEQUENT REQUESTS                                             │
├─────────────────────────────────────────────────────────────────┤
│ Every tRPC call includes cookie: app_session_id                 │
│   ↓                                                              │
│ createContext() calls sdk.authenticateRequest(req)              │
│   ↓                                                              │
│ Verify JWT signature with JWT_SECRET                            │
│   ↓                                                              │
│ Extract openId, appId, name from JWT                            │
│   ↓                                                              │
│ db.getUserByOpenId(openId)                                      │
│   ↓                                                              │
│ Return User object to tRPC context                              │
└─────────────────────────────────────────────────────────────────┘

KEY DEPENDENCIES:
- VITE_OAUTH_PORTAL_URL (frontend)
- VITE_APP_ID (frontend)
- OAUTH_SERVER_URL (backend)
- JWT_SECRET (backend)
- OWNER_OPEN_ID (backend, for notifications)
```

---

## Proposed Architecture: Supabase Auth

```
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND (React)                                                │
├─────────────────────────────────────────────────────────────────┤
│ <Auth0Provider> or <SessionContextProvider>                     │
│   ↓                                                              │
│ supabase.auth.signInWithPassword(email, password)               │
│   OR                                                             │
│ supabase.auth.signInWithOAuth({ provider: 'google' })           │
│   ↓                                                              │
│ Supabase handles OAuth flow (Google, GitHub, etc.)              │
│   ↓                                                              │
│ supabase.auth.onAuthStateChange() listener                      │
│   ↓                                                              │
│ Session object: { user, session }                               │
│   ↓                                                              │
│ session.access_token (JWT from Supabase)                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACKEND (Express + tRPC)                                        │
├─────────────────────────────────────────────────────────────────┤
│ tRPC client sends Authorization header:                         │
│   Authorization: Bearer <access_token>                          │
│   ↓                                                              │
│ createContext() extracts token from header                      │
│   ↓                                                              │
│ supabaseAdmin.auth.getUser(token)                               │
│   ↓                                                              │
│ Response: { user: { id, email, user_metadata, ... } }           │
│   ↓                                                              │
│ db.upsertUser({ id, email, name: user_metadata.name })          │
│   ↓                                                              │
│ Return User object to tRPC context                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ SUBSEQUENT REQUESTS                                             │
├─────────────────────────────────────────────────────────────────┤
│ Every tRPC call includes Authorization header                   │
│   ↓                                                              │
│ createContext() calls supabaseAdmin.auth.getUser(token)         │
│   ↓                                                              │
│ Verify JWT signature (Supabase public key)                      │
│   ↓                                                              │
│ Extract user.id, user.email from JWT                            │
│   ↓                                                              │
│ db.getUserBySupabaseId(user.id)                                 │
│   ↓                                                              │
│ Return User object to tRPC context                              │
└─────────────────────────────────────────────────────────────────┘

KEY DEPENDENCIES:
- SUPABASE_URL (frontend, already have it)
- SUPABASE_ANON_KEY (frontend, already have it)
- SUPABASE_URL (backend, already have it)
- SUPABASE_SERVICE_ROLE_KEY (backend, for admin auth operations)
```

---

## Side-by-Side Comparison

| Aspect | Manus Auth | Supabase Auth |
|--------|-----------|---------------|
| **Portal** | Manus-hosted login page | Supabase-hosted OR self-hosted (Auth UI) |
| **OAuth Providers** | Manus-configured | Google, GitHub, Azure, Apple, Discord, Twitch, etc. |
| **Session Storage** | HTTP-only cookie (`app_session_id`) | HTTP-only cookie OR localStorage + Authorization header |
| **Session Format** | Custom JWT (appId + openId + name) | Standard JWT (sub + email + user_metadata) |
| **Session Verification** | Local JWT verification with JWT_SECRET | Supabase JWT verification (public key) |
| **User Sync** | Manual: OAuth → db.upsertUser() | Automatic: Supabase auth_users table |
| **Password Reset** | Via Manus portal | Via Supabase email link |
| **2FA** | Via Manus portal | Via Supabase TOTP |
| **MFA** | Via Manus portal | Via Supabase phone/email |
| **User Metadata** | Custom fields in users table | Supabase user_metadata JSONB column |
| **Logout** | Clear cookie + db update | Clear session + revoke token |
| **Infrastructure** | Manus servers | Supabase servers (or self-hosted) |
| **Cost** | Included in Manus | Included in Supabase ($25/mo for 50k MAU) |
| **Self-Hosting** | Not possible | Possible with Supabase self-hosted |

---

## Code Changes Required

### 1. **Frontend: Remove Manus OAuth Portal**

**BEFORE (Manus Auth):**
```typescript
// client/src/const.ts
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
```

**AFTER (Supabase Auth):**
```typescript
// client/src/const.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// No getLoginUrl() needed — Supabase Auth UI handles it
```

---

### 2. **Frontend: Replace useAuth Hook**

**BEFORE (Manus Auth):**
```typescript
// client/src/_core/hooks/useAuth.ts
export function useAuth(options?: UseAuthOptions) {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  // ... rest of hook
}
```

**AFTER (Supabase Auth):**
```typescript
// client/src/_core/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '@/const';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function useAuth(options?: UseAuthOptions) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return {
    user: user ? {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || null,
    } : null,
    loading,
    isAuthenticated: !!user,
    logout,
  };
}
```

---

### 3. **Frontend: Create Login Component**

**NEW FILE: `client/src/pages/Login.tsx`**
```typescript
import { useState } from 'react';
import { supabase } from '@/const';
import { useNavigate } from 'wouter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-zinc-100 p-8 w-full max-w-md shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-6">Sign in to PardonPath</h1>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.22_15)]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.22_15)]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-zinc-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full px-4 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </button>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{' '}
          <a href="/signup" className="text-[oklch(0.55_0.22_15)] hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
```

---

### 4. **Backend: Remove Manus OAuth Routes**

**DELETE:**
- `server/_core/oauth.ts` (entire file)
- `server/_core/sdk.ts` (entire file, except keep session signing logic)

**BEFORE: `server/_core/index.ts`**
```typescript
import { registerOAuthRoutes } from "./oauth";

// ...

registerOAuthRoutes(app);
```

**AFTER: `server/_core/index.ts`**
```typescript
// Remove registerOAuthRoutes() call
// No OAuth callback route needed
```

---

### 5. **Backend: Replace Context Authentication**

**BEFORE: `server/_core/context.ts`**
```typescript
import { sdk } from "./sdk";

export async function createContext(opts: CreateContextOptions) {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // user remains null for public procedures
  }

  return { req: opts.req, res: opts.res, user };
}
```

**AFTER: `server/_core/context.ts`**
```typescript
import { supabaseAdmin } from "./supabase";
import * as db from "../db";

export async function createContext(opts: CreateContextOptions) {
  let user: User | null = null;

  try {
    // Extract token from Authorization header
    const authHeader = opts.req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return { req: opts.req, res: opts.res, user: null };
    }

    const token = authHeader.slice(7);

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      return { req: opts.req, res: opts.res, user: null };
    }

    // Sync user to our database
    const dbUser = await db.upsertUser({
      id: supabaseUser.id,
      email: supabaseUser.email || 'unknown@example.com',
      name: supabaseUser.user_metadata?.name || null,
      lastSignedIn: new Date(),
    });

    user = dbUser;
  } catch (error) {
    console.error("[Auth] Context creation failed", error);
  }

  return { req: opts.req, res: opts.res, user };
}
```

---

### 6. **Backend: Update tRPC Client to Send Token**

**BEFORE: `client/src/lib/trpc.ts`**
```typescript
export const trpc = createTRPCReact<AppRouter>();

const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      credentials: "include", // Sends cookies
    }),
  ],
});
```

**AFTER: `client/src/lib/trpc.ts`**
```typescript
import { supabase } from '@/const';

export const trpc = createTRPCReact<AppRouter>();

const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      async headers() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
          authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
        };
      },
    }),
  ],
});
```

---

### 7. **Backend: Update Database Schema**

**BEFORE: `drizzle/schema.ts`**
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: text("open_id").notNull().unique(), // Manus openId
  email: text("email").notNull().unique(),
  name: text("name"),
  loginMethod: text("login_method"),
  lastSignedIn: timestamp("last_signed_in"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**AFTER: `drizzle/schema.ts`**
```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Supabase user.id is UUID
  email: text("email").notNull().unique(),
  name: text("name"),
  lastSignedIn: timestamp("last_signed_in"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Migration SQL:**
```sql
-- Drop old column, add new one
ALTER TABLE users DROP COLUMN open_id;
ALTER TABLE users ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Update foreign key references in other tables
ALTER TABLE applications DROP CONSTRAINT applications_user_id_fkey;
ALTER TABLE applications ADD CONSTRAINT applications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id);
```

---

### 8. **Backend: Update Database Queries**

**BEFORE: `server/db.ts`**
```typescript
export async function getUserByOpenId(openId: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.openId, openId),
  });
}

export async function upsertUser(data: {
  openId: string;
  email: string;
  name?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
}) {
  return db
    .insert(schema.users)
    .values(data)
    .onConflictDoUpdate({
      target: schema.users.openId,
      set: {
        lastSignedIn: data.lastSignedIn,
      },
    })
    .returning();
}
```

**AFTER: `server/db.ts`**
```typescript
export async function getUserBySupabaseId(id: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });
}

export async function upsertUser(data: {
  id: string; // Supabase user.id
  email: string;
  name?: string | null;
  lastSignedIn?: Date;
}) {
  return db
    .insert(schema.users)
    .values(data)
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        lastSignedIn: data.lastSignedIn,
      },
    })
    .returning();
}
```

---

### 9. **Environment Variables**

**BEFORE: `.env.example`**
```env
# Manus Auth
VITE_OAUTH_PORTAL_URL=https://api.manus.im
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your-jwt-secret
OWNER_OPEN_ID=your-owner-open-id
```

**AFTER: `.env.example`**
```env
# Supabase Auth
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Migration Path

### Phase 1: Setup (30 min)
- [ ] Create Supabase Auth client on frontend
- [ ] Create Supabase Admin client on backend
- [ ] Update environment variables

### Phase 2: Frontend (45 min)
- [ ] Replace `getLoginUrl()` with Supabase Auth UI
- [ ] Replace `useAuth()` hook with Supabase session listener
- [ ] Create Login/Signup pages
- [ ] Update Dashboard to use new auth

### Phase 3: Backend (1 hour)
- [ ] Delete `server/_core/oauth.ts` and `server/_core/sdk.ts`
- [ ] Update `server/_core/context.ts` to use Supabase Admin
- [ ] Update `server/db.ts` queries
- [ ] Update database schema and run migration

### Phase 4: Testing (30 min)
- [ ] Test email/password login
- [ ] Test Google OAuth
- [ ] Test protected tRPC procedures
- [ ] Test logout

### Phase 5: Cleanup (15 min)
- [ ] Remove Manus-specific environment variables
- [ ] Update README with self-hosting instructions
- [ ] Document Supabase Auth setup

---

## Benefits of Supabase Auth

✅ **No external dependencies** — everything runs on Supabase (which you already have)
✅ **Standard OAuth 2.0** — works with any provider (Google, GitHub, Azure, etc.)
✅ **Self-hostable** — Supabase can be self-hosted with Docker
✅ **Better UX** — built-in email verification, password reset, 2FA
✅ **Simpler code** — fewer files, fewer API calls
✅ **Cost savings** — included in Supabase pricing
✅ **PIPEDA compliant** — data stays in Canada (Supabase has Toronto region)

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Breaking existing sessions | Run both auth systems in parallel for 1 week, then migrate |
| User data loss | Backup users table before migration |
| OAuth provider config | Test with Google first, then add others |
| Token expiration | Implement refresh token rotation in tRPC client |

---

## Timeline

- **Estimated effort:** 3-4 hours total
- **Complexity:** Medium (auth is critical, needs careful testing)
- **Risk level:** Medium (but low impact if done right)
- **Recommendation:** Do this before Phase 6 (payments)
