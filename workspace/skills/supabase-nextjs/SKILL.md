# Supabase + Next.js Setup Skill

Use this skill when user wants to add Supabase to a Next.js project.

## Steps

### 1. Install Package
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Add Configuration Files

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://befpyjnxcaohdedvhpuu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...
```

Create `utils/supabase/server.ts`, `client.ts`, `middleware.ts` - see Credo frontend for examples.

### 3. Run Migration

Use Management API with access token:
```bash
curl -X POST "https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "CREATE TABLE..."}'
```

Or use Supabase CLI with access token:
```bash
export SUPABASE_ACCESS_TOKEN=...
supabase db push --db-url "postgresql://user:pass@host/db"
```

### 4. Store Credentials Securely

- Public keys (NEXT_PUBLIC_*) → safe to commit
- Secret keys → store in .env.supabase (private), never commit
- Access tokens → ask user or store in secure vault

## Notes

- Publishable key (`sb_publishable_...`) is safe for client-side
- Service role key must NEVER be exposed to client
- Use Management API when sandbox can't reach PostgreSQL port 5432
