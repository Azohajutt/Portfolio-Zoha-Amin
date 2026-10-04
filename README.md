# Zoha Amin — Portfolio

Production portfolio for **Zoha Amin**, AI Engineer (Voice AI, Agentic Systems, RAG, Computer Vision).

**Live (Vercel):** https://portfolio-zoha-amin.vercel.app  
**Source of truth:** resume content seeded in `src/lib/content.ts` and Supabase.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Framer Motion (`motion`)
- Supabase (Postgres, Auth)
- Google Gemini (`gemini-3.8-flash`) for **Ask about Zoha**
- Vercel Analytics + Speed Insights

## Local setup

1. Copy env file and fill values:

```bash
cp .env.example .env.local
```

2. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Supabase setup

1. Create a project (free tier is fine).
2. In **Authentication → Providers**, disable public sign-ups.
3. **Authentication → Users → Add user** with `azoha6966@gmail.com` (Auto Confirm).
4. Open **SQL Editor**, paste `supabase/schema.sql`, Run.
5. Put URL + anon/publishable + service_role/secret keys in `.env.local`.
6. Seed content:

```bash
npm run db:seed
```

If the new `sb_publishable_` / `sb_secret_` keys fail auth, use **Legacy API keys** (JWT `anon` + `service_role`) from Project Settings → API.

## Vercel setup

1. Import `Portfolio-Zoha-Amin` (or connect the `portfolio-v2` branch for preview).
2. Framework: **Next.js**.
3. Add the same env vars from `.env.local`.
4. Set `NEXT_PUBLIC_SITE_URL=https://portfolio-zoha-amin.vercel.app`.
5. Deploy. Merge to production only after preview approval.

## Admin panel

- URL: `/admin/login`
- Email: `azoha6966@gmail.com`
- Features: inbox (contact + chat logs), profile/hero editor, project publish/visibility edits.

## Contact form email (Resend)

1. Create a free account at [resend.com](https://resend.com) with `azoha6966@gmail.com`
2. Create an API key
3. Put it in `.env.local` as `RESEND_API_KEY=re_...`
4. Restart `npm run dev`
5. Add the same key in Vercel → Environment Variables

Until you verify your own domain, keep:

```env
CONTACT_FROM_EMAIL=Zoha Portfolio <onboarding@resend.dev>
CONTACT_TO_EMAIL=azoha6966@gmail.com
```

With the Resend test sender, mail can only be delivered to the Resend account email.

## Milestone test checklist

- [ ] Home loads with hero stats and photo
- [ ] Each `/work/[slug]` page shows Problem / Solution / Impact + diagram Play/Step/Reset
- [ ] Chat answers only from portfolio data; unknown questions point to email
- [ ] Contact form stores messages (after schema + seed)
- [ ] Admin login works; dashboard shows logs
- [ ] Dark/light toggle works
- [ ] Resume downloads from `/resume/Zoha_Amin_AI_Engineer_Resume.pdf`

## Notes

- Production is Vercel only. The old GitHub Pages site is retired and should stay disabled.
- Never commit `.env.local`.
- Rotate any API key that was pasted into chat history.
