# Store Orders

A production-oriented order management starter built from the supplied requirements.

## Stack
- Next.js + React + TypeScript
- Supabase Auth + PostgreSQL + Row Level Security
- Responsive CSS/Tailwind
- Vercel Cron for daily reminders
- In-app reminder notifications

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. In Supabase Authentication, configure email/password sign-up and password reset.
4. Copy `.env.example` to `.env.local` and fill in the Supabase URL/key.
5. Install dependencies:
   `npm install`
6. Run:
   `npm run dev`

## Production reminders

The daily cron endpoint is `/api/reminders` and is protected by `CRON_SECRET`. For production, use a server-side Supabase service-role client for the cron job because the job is not authenticated as an individual browser user. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

Vercel can execute `/api/reminders` daily using the included `vercel.json`.

The current implementation provides persistent in-app reminders. Real browser push requires VAPID keys, a service worker, and a subscription table; those environment variables are included as extension points.

## Security

Orders use Supabase Row Level Security and are scoped to `auth.uid()`. Never put the service-role key in client-side code.

## Main flow

Register/Login -> Dashboard -> Add Order -> Save -> View/Edit/Delete -> Search/Filters -> Calendar -> Reminder -> Mark Delivered.
