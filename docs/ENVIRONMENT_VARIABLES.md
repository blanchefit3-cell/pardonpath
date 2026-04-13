# PardonPath Environment Variables Reference

## Required Environment Variables

### Supabase Configuration
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://project-id.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (public) | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (backend only) | `eyJhbGc...` |
| `SUPABASE_DB_URL` | ✅ | PostgreSQL connection string | `postgresql://postgres:pass@host:5432/db` |
| `VITE_SUPABASE_URL` | ✅ | Frontend Supabase URL (same as SUPABASE_URL) | `https://project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Frontend Supabase key (same as SUPABASE_ANON_KEY) | `eyJhbGc...` |

### Authentication & Security
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `JWT_SECRET` | ✅ | Session signing secret (32+ chars) | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | ✅ | AES-256 encryption key (64 hex chars) | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Email Service (Resend)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `RESEND_API_KEY` | ✅ | Resend API key for email sending | `re_...` |

### LLM Provider
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `CLOUDFLARE_AI_GATEWAY_URL` | ✅ | Cloudflare AI Gateway endpoint | `https://api.cloudflare.com/client/v4/accounts/.../ai/run` |
| `CF_AIG_TOKEN` | ✅ | Cloudflare AI Gateway token | `Bearer ...` |
| `ANTHROPIC_API_KEY` | ⚠️ | Direct Anthropic API (if not using Cloudflare) | `sk-ant-...` |

### Application Configuration
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_APP_TITLE` | ✅ | Application title | `PardonPath` |
| `VITE_APP_LOGO` | ⚠️ | Application logo URL | `https://cdn.example.com/logo.png` |

### Analytics (Optional)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_ANALYTICS_ENDPOINT` | ❌ | Analytics service endpoint | `https://analytics.manus.im` |
| `VITE_ANALYTICS_WEBSITE_ID` | ❌ | Analytics website ID | `abc123` |

### Manus Built-in APIs (Auto-injected)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `BUILT_IN_FORGE_API_URL` | ⚠️ | Manus API endpoint | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | ⚠️ | Manus API key | `Bearer ...` |
| `VITE_FRONTEND_FORGE_API_URL` | ⚠️ | Frontend Manus API endpoint | `https://api.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | ⚠️ | Frontend Manus API key | `Bearer ...` |

## Legend
- ✅ = Required for MVP
- ⚠️ = Required for specific features (Cloudflare OR Anthropic, Manus hosting OR self-hosting)
- ❌ = Optional

## Getting Values

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` and `anon public key`
5. For service role key: Settings → API → Service role key

### Resend
1. Go to [Resend Dashboard](https://resend.com)
2. Go to API Keys
3. Create new API key
4. Copy the key

### Cloudflare AI Gateway
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to AI → Gateway
3. Create new gateway
4. Copy Account ID and API token

### Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Go to API Keys
3. Create new API key
4. Copy the key

## Generating Secrets

### JWT_SECRET
```bash
openssl rand -base64 32
```

### ENCRYPTION_KEY
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Environment-Specific Configuration

### Development
```
NODE_ENV=development
SUPABASE_URL=https://dev-project.supabase.co
RESEND_API_KEY=re_test_...
```

### Production
```
NODE_ENV=production
SUPABASE_URL=https://prod-project.supabase.co
RESEND_API_KEY=re_live_...
```

## Security Best Practices

1. **Never commit secrets to version control**
   - Add `.env.local` to `.gitignore`
   - Use environment variable management tools

2. **Rotate secrets regularly**
   - JWT_SECRET: Every 6 months
   - ENCRYPTION_KEY: Every 12 months
   - API keys: Every 3 months

3. **Use different keys for different environments**
   - Development: Test keys
   - Staging: Staging keys
   - Production: Production keys

4. **Audit secret access**
   - Log who accesses secrets
   - Monitor for unauthorized access
   - Use Supabase audit logs

5. **Secure secret storage**
   - Use Manus Secrets panel
   - Use environment variable management tools (1Password, Vault, etc.)
   - Never share secrets via email or chat

## Troubleshooting

### "SUPABASE_URL is not configured"
- Verify SUPABASE_URL is set in environment
- Check for typos in variable name
- Ensure URL is complete (includes https://)

### "RESEND_API_KEY is invalid"
- Verify key is correct in Resend dashboard
- Check for extra spaces or characters
- Regenerate key if needed

### "Encryption key is invalid"
- Verify ENCRYPTION_KEY is 64 hex characters
- Regenerate using command above
- Ensure no spaces or special characters

### "JWT verification failed"
- Verify JWT_SECRET is consistent across deployments
- Check for environment variable typos
- Regenerate if needed (will log out all users)

## Migration from Manus to Self-Hosted

If migrating from Manus hosting to self-hosted:

1. Keep all Supabase variables (they're the same)
2. Set CLOUDFLARE_AI_GATEWAY_URL and CF_AIG_TOKEN (or ANTHROPIC_API_KEY)
3. Remove OAUTH_SERVER_URL (Supabase Auth replaces Manus OAuth)
4. Remove VITE_OAUTH_PORTAL_URL
5. Update VITE_APP_TITLE and VITE_APP_LOGO as needed
6. Remove BUILT_IN_FORGE_API_* variables (use external services instead)

See [SUPABASE_AUTH_MIGRATION.md](./SUPABASE_AUTH_MIGRATION.md) for detailed migration steps.
