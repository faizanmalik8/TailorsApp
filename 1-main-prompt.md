# Main Build Prompt — Tailor Shop Management App

## What we're building

A **multi-tenant Progressive Web App (PWA)** for local tailor shops. One app, distributed to many independent tailor shops — each shop signs up and gets a fully private workspace to manage their customers, measurements, orders, billing, and customer communication.

The primary users are **non-technical, less-educated small business owners** (tailors). Every design and interaction decision must prioritize simplicity, minimal typing, large tappable elements, and clarity over density or cleverness. If a feature can be done in fewer taps, do it in fewer taps.

Two supporting files accompany this prompt — read both before starting:
- `2-features.md` — the complete feature list for v1, with explanation of what each does and why
- `3-workflow.md` — the exact step-by-step workflow for how each feature behaves, screen by screen

---

## Tech stack

- **Frontend**: Next.js (React), installable as a PWA (service worker + manifest for "Add to Home Screen")
- **Backend**: Supabase — Postgres database, Supabase Auth, Supabase Storage (for logos/payment proofs), Supabase Realtime (for instant status updates, e.g. subscription approval)
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons (outline style only — no filled/colorful icons, no emojis)
- **Multi-tenancy**: Enforced via Postgres Row Level Security (RLS) — every table scoped to `shop_id`, and no shop can ever query another shop's data, enforced at the database level, not just in app logic

---

## Design system

**Color palette**
- Primary / brand: Navy `#152A4A` — headers, primary buttons, active icons/nav states, selected chip backgrounds
- Light accent: Light blue `#EAF1FA` — card backgrounds, subtle section fills (a tint of the navy, not an unrelated color)
- Base background: White `#FFFFFF`
- Accent for pending/due amounts: a muted amber/gold (not red — this is a routine balance, not an alarm)

**Icons**
- Tabler Icons only, outline style, single-color (navy or muted gray depending on state), consistent size within any given screen. No colorful icon sets, no emoji, no filled icon styles.

**Typography & language**
- Full bilingual support: English and Urdu, toggle in Settings
- Urdu text must render right-to-left (RTL) correctly wherever active
- All default measurement field labels ship with both English and Urdu translations built in

**Components**
- Large tappable buttons/cards, generous spacing — avoid dense forms
- Measurement fields use the **numeric input + multi-select tag chips** pattern: each field has a value input alongside a row of toggle chips (navy-filled when selected, outlined when not) that the tailor can select any number of — see `3-workflow.md` for exact reference
- Style/category selection (garment type, single-choice pickers) uses **card-style single-select tiles**, not native radio buttons — large tappable cards with a checkmark on the selected one

---

## How we will build this

We are building **incrementally, one feature/page at a time**, in the exact order below. After each step is built, I will personally test it before we move to the next. Do not jump ahead or build multiple features simultaneously.

**Build order:**
1. Project setup — Next.js + Tailwind + Supabase config, PWA manifest/service worker, design tokens (colors, fonts) wired in, base layout shell
2. Auth & Subscription flow — signup (phone/email/Google), payment-proof upload screen, pending/approval state, Realtime unlock on approval
3. **Dashboard** — shop name/logo header, summary cards (active clients, amount pending, garment-type breakdown), bottom navigation — build this with placeholder/mock data first so the shell and navigation can be tested before real data flows exist
4. Customers & Measurements — add customer, garment template selection, measurement entry (numeric + multi-select chips), returning customer search + auto-fill
5. Orders — status flow (Received → Ready → Delivered), Mark Done logic, Active Clients list, Pending Amount list with payment history
6. Billing & Receipts — bill entry (total/itemized), on-demand receipt generation, shareable via WhatsApp
7. Settings — shop profile/logo, message templates (Order Placed, Ready for Pickup, Payment Reminder, Thank You), garment/measurement template editor, language toggle
8. Polish pass — empty states, loading states, error handling, final review against the design system above

**Rules while building:**
- Before starting each numbered step, if anything about that feature is ambiguous or not fully specified in `2-features.md` / `3-workflow.md`, **ask me before writing code** — do not assume or invent behavior.
- After finishing each step, stop and summarize what was built and what to test — do not proceed automatically to the next step.
- Keep components reusable — e.g., the multi-select chip field and the single-select tile picker should be built once as shared components and reused everywhere they're needed, not rebuilt per screen.
- Every screen must work correctly in both English and Urdu (RTL) before being considered done.

Start with **Step 1: Project setup**, and confirm with me before moving to Step 2.
