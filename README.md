# BrowBliss Threading — Woodland, CA Studio Portal

A fully featured administrative and client scheduling portal built on top of high-end **soft feminine luxury guidelines**. Features detailed interactive booking, double-state persistence, inline order updates, holiday calendar blockers, and zero-overhead porting.

---

## 🎨 Visual System & Branding
- **Aesthetic Vibe**: Soft Feminine Luxury Salon
- **Palette**: Blush pink (`#F2C4CE`), Dusty Rose (`#C4687A`), Warm Cream (`#FDF6F0`), Gold Accents (`#C9A96E`), Dark Charcoal texts (`#2D2D2D`).
- **Typography Setup**: `Cormorant Garamond` (elegant serif headings) paired with `Jost` (clean sans-serif body).

---

## 🚀 Easy Sandbox Setup (Instant Preview)

To immediately run the application locally without full external Supabase setup (using automated LocalStorage database mocks with seed data):

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Launch Dev Server**:
   ```bash
   npm run dev
   ```

3. **Log in to Admin Workspace**:
   - Access the login page by clicking the **Lock / Staff Access** icon inside the navigation bar or footer.
   - Sing in using default credentials:
     - **Email**: `admin@browbliss.com`
     - **Password**: `browblissadmin`

---

## ⚡ Supabase Setup (Production Database)

If you wish to host your database remote on **Supabase**:

### Step 1: Run inside Supabase SQL Editor
1. In your Supabase project, navigate to the **SQL Editor** tab from the sidebar.
2. Open `/supabase-setup.sql` in this directory, copy its entire contents, paste it, and run it. This will automatically:
   - Create tables: `appointments`, `services`, `business_hours`, `business_info`, `blocked_dates`
   - Setup Row Level Security (RLS) policies allowing secure guest insertion but locked admin access.
   - Seed all standard treatment prices ($6 eyebrow, $4 lip) and default weekly business hours.

### Step 2: Register Admin Credentials
1. Go to **Authentication** -> **Users** tab inside the Supabase platform.
2. Click **Add User** -> **Create User**.
3. Choose an admin email (e.g. `gdipesh913@gmail.com`) and secure credentials password and submit.

### Step 3: Configure Redirect URL Configuration
- In **Authentication** -> **URL Configuration**, add your active deployment URL (e.g., your Vercel or Cloud Run domain) to redirect guests securely after authorization challenges.

### Step 4: Fill `.env.local`
Create a `.env.local` inside the workspace root (copying from `.env.local.example`) and fill in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-publicKey"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

RESEND_API_KEY="your-email-apiKey"
BUSINESS_EMAIL="gdipesh913@gmail.com"
```

---

## ✈️ Vercel Deployment

This project contains native file layers configured directly for Next.js App Router compilation:

1. Push your code repository branch directly to **GitHub**, **GitLab**, or **Bitbucket**.
2. Visit Vercel (https://vercel.com) and click **Create a New Project** -> **Import Project**.
3. Add the exact environment keys listed inside your `.env.local.example` in their setting section.
4. Click **Deploy**. Vercel compiles and publishes the layout cleanly.
5. In **Supabase Authentication Settings**, update redirect URLs to point directly back to your brand new Vercel server hostname.
