# Cloudflare Deployment Secrets

## Required GitHub Repository Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

### 1. `CLOUDFLARE_API_TOKEN`

**How to create:**
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Ensure these permissions are included:
   - Account → Cloudflare Pages → Edit
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit
5. Click **Continue to summary** → **Create Token**
6. Copy the token (you won't see it again!)

### 2. `CLOUDFLARE_ACCOUNT_ID`

**How to find:**
1. Go to https://dash.cloudflare.com/?to=/:account/workers
2. Look at the right sidebar → **Account ID**
3. Or go to any page → URL contains `/account/:account-id/`

---

## Optional (for dynamic API with database)

### 3. `TURSO_DATABASE_URL` (optional)
- Format: `libsql://your-db.turso.io`
- Only needed if you want live API routes (not static-only mode)

### 4. `TURSO_AUTH_TOKEN` (optional)
- Create via: `turso db tokens create your-db-name`
- Only needed if Turso DB is configured

---

## Secret Names (exact)

| Secret Name | Required | Description |
|-------------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | ✅ Yes | API token with Workers + Pages edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ Yes | Your Cloudflare account ID (32-char hex) |
| `TURSO_DATABASE_URL` | ❌ No | Turso database URL (for dynamic API) |
| `TURSO_AUTH_TOKEN` | ❌ No | Turso auth token (for dynamic API) |
