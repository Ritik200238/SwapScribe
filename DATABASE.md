# 📦 Database Configuration (PostgreSQL)

SwapScribe uses **PostgreSQL** for production.

## Required Environment Variables

Add these to your `.env` and Vercel Environment Variables:

```env
# Connection Pooler URL (Transaction Mode - Port 6543)
# Use this for the app (Prisma Client)
DATABASE_URL="postgres://[user]:[password]@[host]:6543/[db_name]?pgbouncer=true"

# Direct Connection URL (Session Mode - Port 5432)
# Use this for migrations (Prisma Migrate)
DIRECT_URL="postgres://[user]:[password]@[host]:5432/[db_name]"
```

## Why two URLs?
Serverless environments (like Vercel) can exhaust database connections quickly. 
- `DATABASE_URL` should point to a connection pooler (Supabase/Neon provide this).
- `DIRECT_URL` is needed for schema migrations which cannot run over a transaction pooler.

## Running Migrations

When deploying or updating schema:

```bash
# Local dev (if using Postgres locally)
npx prisma migrate dev --name <migration_name>

# Production deployment
npx prisma migrate deploy
```
