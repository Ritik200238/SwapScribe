# SwapScribe ⚡️

**The Crypto Subscription Platform**  
*Built for the SideShift.ai Buildathon (Wave 3)*

SwapScribe allows merchants and creators to accept recurring crypto payments in **any asset** (BTC, ETH, SOL, DOGE...) while receiving stable payouts (USDC/USDT) directly to their wallet.

![Status](https://img.shields.io/badge/Status-Production_Ready-green)
![Stack](https://img.shields.io/badge/Stack-Next.js_15_Prisma_SideShift_V2-blue)

---

## 🚀 Features

*   **Zero UI Payment Links**: Send a link, get paid. No complex dApp required.
*   **Any-to-Any Swaps**: Customers pay in BTC; you get USDC on Base. Powered by SideShift.ai.
*   **Recurring Billing**: Automated invoice tracking and expiry management.
*   **Non-Custodial**: Funds settle directly to your wallet. We never touch your money.
*   **Merchant Dashboard**: Track MRR, subscribers, and payment history.

---

## 🛠️ Quick Start (Local Dev)

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    cd swapscribe
    npm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` and fill in your credentials:
    ```bash
    cp .env.example .env
    ```
    *   `SIDESHIFT_SECRET`: Your [SideShift Account](https://sideshift.ai/account) Private Key.
    *   `SIDESHIFT_AFFILIATE_ID`: Your SideShift Affiliate ID (to earn commissions).
    *   `JWT_SECRET`: Generate a random string (e.g., `openssl rand -base64 32`).

3.  **Database Setup**
    ```bash
    npm run db:push  # Creates local SQLite db
    npm run db:seed  # Seeds demo user
    ```

4.  **Run**
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000`

---

## 📦 Production Deployment

### 1. Database (PostgreSQL)
For production, **do not use SQLite**. Use a managed PostgreSQL database (e.g., Supabase, Neon, Vercel Postgres).

1.  Update `.env`: `DATABASE_URL="postgresql://user:pass@host:5432/db"`
2.  Run `npx prisma migrate deploy` to apply schema.

### 2. Environment Variables
Ensure `NODE_ENV=production` is set. This enables secure cookies and optimized builds.

### 3. Build & Start
```bash
npm run build
npm start
```

---

## 🧪 Testing

**Demo Credentials:**
*   Email: `demo@swapscribe.io`
*   Password: `demo123`

**Health Check:**
*   `GET /api/health` -> Returns `{ status: "ok", database: "connected" }`

---

## 🛡️ Security Notes

*   **Auth**: HttpOnly, SameSite=Lax cookies.
*   **Payments**: All exchange rates and addresses are verified via SideShift API V2.
*   **Permissions**: The app checks user IP permissions via `GET /v2/permissions` before creating shifts.

---

## 📄 License

MIT