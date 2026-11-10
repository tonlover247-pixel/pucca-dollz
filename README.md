# 🎎 PUCCA DOLLZ — Whitelist & Admin Platform

Free mint whitelist website and backend for **PUCCA DOLLZ** (3,000 supply on Robinhood / OpenSea).

## 🚀 Features

- **Free Mint Landing Page:** Cute-but-deadly comic dark theme with character interactions, countdown timer, and glitch titles.
- **Whitelist Task Verification:** 
  1. X (Twitter) Username input (no paid API key needed)
  2. Follow @PuccaDollz
  3. Like & Repost pinned tweet
  4. Tag friends with reply post link validation
  5. EVM Wallet submission (0x... 42 chars)
- **Supabase Backend:** High-performance database with case-insensitive unique constraints on wallet and X handle to prevent duplicates.
- **Admin Dashboard (`/admin.html`):**
  - Secured with an `x-admin-key` header
  - Live statistics and submission counters
  - Real-time search and filter
  - One-click **Copy CSV**, **Download CSV**, and **Copy All Wallets** (line-by-line format for easy airdrops/allowlisting)

---

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create or edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
ADMIN_KEY=your_secure_admin_password
PORT=3000
NODE_ENV=development
```

### 3. Initialize Supabase Database
Go to your Supabase project's **SQL Editor** and execute the queries in [`supabase-setup.sql`](./supabase-setup.sql).

### 4. Run the Server
```bash
npm start
# or for development:
npm run dev
```

- Public site: `http://localhost:3000`
- Admin dashboard: `http://localhost:3000/admin.html`

---

## 📁 Project Structure

```
site/
├── public/
│   ├── index.html       # Public whitelist landing page
│   ├── styles.css       # Comic-noir styling & animations
│   ├── app.js           # Client-side validation & task flow
│   └── admin.html       # Protected admin dashboard
├── server.js            # Express API with Supabase integration
├── supabase-setup.sql   # SQL schema and security policies
├── package.json
└── .env                 # Secret environment variables (gitignored)
```
