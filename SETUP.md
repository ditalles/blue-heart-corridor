# Blue Heart Corridor — Setup Guide

Get the platform live in 15 minutes.

## Step 1: Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (region: pick EU for low latency to Balkans)
3. Wait for the project to finish provisioning
4. Go to **SQL Editor** and run these scripts in order:

```
supabase/schema.sql          ← Core tables (profiles, hostels, rooms, bookings, reviews)
supabase/messaging-schema.sql ← Messaging tables (conversations, messages, channel prefs)
scripts/seed.sql              ← Test data (8 hostels on the Blue Heart Trail)
```

5. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`

6. Go to **Authentication → Providers** and enable:
   - Email (enabled by default)
   - Google (optional — add OAuth credentials)

7. Go to **Authentication → URL Configuration**:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: add `https://your-domain.vercel.app/auth/callback`

## Step 2: Stripe (Optional for MVP)

Skip this if you want to launch with "Pay at Property" only.

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Copy your test keys:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Set up a webhook endpoint:
   - URL: `https://your-domain.vercel.app/api/stripe/webhooks`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`, `customer.subscription.*`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`
4. Enable Stripe Connect in your dashboard (for hostel payouts)

## Step 3: Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
3. Add environment variables (from Step 1 + 2):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
   - `STRIPE_SECRET_KEY` (if using Stripe)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using Stripe)
   - `STRIPE_WEBHOOK_SECRET` (if using Stripe)
4. Deploy!

## Step 4: Test

1. Visit your site
2. Register as a hostel owner at `/auth/register/hostel`
3. Create a hostel listing
4. In another browser/incognito, register as a traveler
5. Search for the hostel, book it
6. Check the owner dashboard for the booking

## Optional: Messaging APIs

### WhatsApp Business
1. Set up a Meta Business account
2. Create a WhatsApp Business API app
3. Get your Phone Number ID and Access Token
4. Set webhook URL to `https://your-domain.vercel.app/api/messages/webhook`

### Viber Business
1. Create a Viber Bot at [partners.viber.com](https://partners.viber.com)
2. Get your Auth Token
3. Call the set-webhook API or the platform will auto-configure

### Solana/USDC
1. Create a Solana wallet for the platform
2. Set `SOLANA_PLATFORM_WALLET` to the wallet address
3. Optionally use a dedicated RPC (Helius, QuickNode) for reliability
