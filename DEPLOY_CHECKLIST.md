# 🚀 Production Deployment Checklist

Follow this checklist before submitting to the Hackathon or deploying live.

## 1. Environment Variables
- [ ] **SIDESHIFT_SECRET**: Must be your *real* SideShift Account Secret (not the example).
- [ ] **SIDESHIFT_AFFILIATE_ID**: Must be your *real* Affiliate ID.
- [ ] **JWT_SECRET**: Must be a long, random string (min 32 chars). **Critical: App will crash in production without this.**
- [ ] **NEXT_PUBLIC_APP_URL**: Set to your production domain (e.g., `https://swapscribe.vercel.app`).
- [ ] **DATABASE_URL**: Connection pooler URL (Supabase/Neon).
- [ ] **DIRECT_URL**: Direct database connection URL.
- [ ] **CRON_SECRET**: (Optional) For securing the renewal cron job.

## 2. Database Migration
- [ ] Run `npx prisma migrate deploy` against your production database.
- [ ] (Optional) Run `npm run db:seed` if you want the demo user in production (Recommend: create a fresh account instead).

## 3. SideShift Account
- [ ] Log in to [SideShift.ai](https://sideshift.ai/account).
- [ ] Ensure your account is active.
- [ ] (Optional) Configure your "Payout Settings" in SideShift dashboard if you want affiliate commissions paid out automatically.

## 4. Merchant Configuration (Critical)
- [ ] Log in to your deployed App.
- [ ] Go to **Dashboard > Settings**.
- [ ] **ENTER YOUR PAYOUT WALLET ADDRESS**.
    - If you leave this empty, you cannot receive payments.
    - Select a stablecoin pair (e.g. USDC on Ethereum).

## 5. Verification Test
- [ ] Create a "Test Plan" (Price: $1.00).
- [ ] Open the subscribe link in Incognito mode.
- [ ] Select "Bitcoin".
- [ ] Verify that a QR code appears and the Status says "Listening for deposit...".
- [ ] **Do not send real funds** unless you want to test the full settlement flow (min deposit usually ~$20-50 depending on chain).

## 6. Submission
- [ ] Include this Repo Link.
- [ ] Include the Demo Video.
- [ ] Include the Live URL.
- [ ] Mention "Track: AI + Automation" or "Zero UI" depending on your angle (SwapScribe fits "Zero UI" / "Cross-Chain Power").

## 7. Troubleshooting
- **Login failing?** Check `JWT_SECRET` is set. Check logs for "Missing JWT_SECRET".
- **429 Errors?** You might be rate-limiting yourself. Check `RateLimit` table in DB.
- **Database errors?** Ensure you are using the Connection Pool URL for `DATABASE_URL`.

Good luck! 🏆