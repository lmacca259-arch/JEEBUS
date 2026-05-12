# HYETAS

> Have you ever seen a man throw a shoe.

A household-load app for Lisa, Andrew, Hannah, and Alex. Built so Lisa never has to remind anyone about the bins again.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Auth + Storage)
- Vercel (auto-deploy from `main`)

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL + publishable key
npm run dev
```

Then open http://localhost:3000.

## Win condition for Test #1

Bins on the curb Sunday night. Not cheerful Alex. Not happy Lisa. Just: bins out.

## Notes

Web push notifications: enabled via VAPID + service worker (slice 8).
Cron schedule: every 30 minutes (Hobby plan friendly).
Scheduling: Supabase pg_cron pings `/api/cron/check-due` (Vercel cron not used).

Deploy pipeline: GitHub App reinstalled 2026-05-12 (fresh wire after stuck project link).
