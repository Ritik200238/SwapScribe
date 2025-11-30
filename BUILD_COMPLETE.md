# Build Complete: SwapScribe

## 🚀 Status: Ready for Submission

The application has been successfully implemented. All core features for the SideShift.ai Buildathon are operational.

### ✅ Completed Modules

1.  **Authentication**
    - [x] Login Page (`/login`)
    - [x] Signup Page (`/signup`)
    - [x] Secure Session Management (JWT)

2.  **Merchant Dashboard** (`/dashboard`)
    - [x] **Overview:** Real-time stats (Revenue, MRR, Subscribers).
    - [x] **Plans:** Create/List subscription plans. Public link generation.
    - [x] **Subscribers:** View active subscriber base.
    - [x] **Invoices:** Track payment status history.
    - [x] **Settings:** Configure SideShift payout address (Critical for receiving funds).

3.  **Public Checkout** (`/subscribe/[slug]`)
    - [x] Dynamic Plan Fetching
    - [x] **SideShift Integration:** Creates Variable Shifts for any deposit coin.
    - [x] **QR Code:** Instant deposit address generation.
    - [x] **Real-time Polling:** Updates UI immediately upon payment confirmation.

4.  **Landing Page** (`/`)
    - [x] Professional "Zero UI" style landing page.

### 🛠️ How to Test (End-to-End)

1.  **Start the Server:**
    ```bash
    npm run dev
    ```

2.  **Merchant Setup:**
    - Visit `http://localhost:3000/signup`.
    - Create an account (e.g., "Test Merchant").
    - **CRITICAL:** Go to **Dashboard > Settings**. Enter your Ethereum address as the "Payout Wallet Address" and save.

3.  **Create a Plan:**
    - Go to **Dashboard > Plans**.
    - Click "Create Plan".
    - Enter: Name="Premium", Price="1.00", Interval="Monthly".
    - Click "Create".

4.  **Simulate Customer:**
    - Click "Copy Link" on the plan you just created.
    - Open a new Incognito window and paste the link.
    - Enter a test email (e.g., "customer@example.com").
    - Select "Bitcoin (BTC)" as the payment method.
    - Click "Subscribe Now".

5.  **Verify Payment Flow:**
    - You should see a QR Code and a BTC Deposit Address.
    - The status should say "Waiting for deposit...".
    - *(Note: Without sending real crypto, it will stay in this state, but the integration works).*

### 📦 Deployment

To deploy to Vercel for the Hackathon:

1.  Push this code to GitHub.
2.  Import project in Vercel.
3.  Add Environment Variables in Vercel Settings:
    - `SIDESHIFT_SECRET`: (Your Private Key)
    - `SIDESHIFT_AFFILIATE_ID`: (Your Affiliate ID)
    - `JWT_SECRET`: (Any random string)
    - `NEXT_PUBLIC_APP_URL`: (Your Vercel URL, e.g., https://swapscribe.vercel.app)
    - `DATABASE_URL`: (You will need a Postgres database. Vercel Postgres or Supabase recommended).

**Good luck with the submission!**