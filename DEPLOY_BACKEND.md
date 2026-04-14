# 🚀 Backend Deployment Guide - Quick Setup

## Problem
Local PostgreSQL cannot run on this device (storage 100% full, only 240MB free).

## Solution: Deploy Backend to Railway/Render (Free Tier)

### Option 1: Railway (Recommended - Easiest)

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `cleaning-services-enterprise-2026`
5. **Add Database**: Click **+ New** → **PostgreSQL**
6. **Set Environment Variables**:
   ```
   DATABASE_URL=<from Railway PostgreSQL service>
   JWT_SECRET=super-secret-jwt-key-change-in-production-32chars
   JWT_REFRESH_SECRET=super-secret-refresh-key-change-in-prod-32
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   STRIPE_SECRET_KEY=sk_test_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   REDIS_URL=redis://default:password@redis.railway.internal:6379
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   SMTP_FROM=noreply@cleanpro.com
   FRONTEND_URL=https://cleaning-services-enterprise-2026.vercel.app
   LOG_LEVEL=info
   NODE_ENV=production
   ```
7. **Deploy** → Railway auto-detects Node.js
8. **After Deploy**, run seed:
   ```bash
   # Railway Console → Open Shell
   cd backend
   npx prisma db push
   npx prisma db seed
   ```

### Option 2: Render (Alternative)

1. **Go to**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Root Directory**: `backend`
4. **Build Command**: `npm install && npx prisma generate && npx prisma db push`
5. **Start Command**: `node dist/server.js`
6. **Add PostgreSQL Database** from Render dashboard
7. **Add env vars** (same as Railway above)
8. **Run seed** from Render Shell:
   ```bash
   npx prisma db seed
   ```

### Option 3: Local Machine with Docker (If you have storage)

```bash
# Free up space first
docker system prune -af
docker volume prune -f

# Start database
cd docker
docker compose up -d db

# Wait for PostgreSQL to be ready
sleep 15

# Run seed
cd ../backend
npm run db:seed
```

---

## Demo Credentials (After Seeding)

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@cleanpro.com` | `Admin123!` | Full system |
| **Manager** | `manager@cleanpro.com` | `Manager123!` | Admin panels, bookings |
| **Customer** | `customer@example.com` | `Customer123!` | Book services |
| **Staff** | `staff@cleanpro.com` | `Staff123!` | View assignments |

---

## Verify Setup

After seeding, test the backend API:

```bash
# Health check
curl https://your-backend-url.railway.app/health

# Login as admin
curl -X POST https://your-backend-url.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cleanpro.com","password":"Admin123!"}'
```

## Connect Frontend to Backend

Update Vercel environment variable:
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://your-backend-url.railway.app/api/v1
```

Then redeploy:
```bash
vercel --prod
```
