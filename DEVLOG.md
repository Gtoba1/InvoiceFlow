# InvoiceFlow — Development Log

Complete record of every decision, fix, and architectural choice made during development.

---

## Project Overview

**InvoiceFlow** is a SaaS invoice generator built for freelancers and service providers.
Target user: a freelancer offering data analysis, Power BI, SQL, Excel, tutoring, and PowerPoint design services.

**Live URL:** `https://invoiceflow-0gsh.onrender.com`
**GitHub:** `https://github.com/Gtoba1/InvoiceFlow`
**Admin email:** `upskillwithtoluwalase@gmail.com`

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR + API routes in one project |
| Language | TypeScript | Type safety across all components |
| Styling | Tailwind CSS | Utility-first, fast iteration |
| Components | Shadcn UI (Radix UI) | Accessible, unstyled primitives |
| Auth | Supabase Auth | Email verification, session management |
| Database | Supabase (PostgreSQL) | Free tier, RLS policies, real-time |
| ORM | None — Supabase JS client directly | Simpler than Prisma for this use case |
| PDF Export | jsPDF + html2canvas | Capture invoice preview as image → PDF |
| Toasts | Sonner | Clean notification UX |
| Hosting | Render | Simple Node.js hosting, GitHub auto-deploy |

---

## Features Built

### Core Invoice Editor
- Auto-generated invoice numbers (`INV-2026-001`) — editable
- Four currencies: NGN ₦, USD $, GBP £, EUR €
- Real-time calculations: subtotal → discount → tax → grand total
- Discount: fixed amount or percentage
- Tax/VAT rate toggle
- Per-service Terms & Conditions (auto-populate when service selected)

### Three Invoice Templates
- **Minimal** — clean white layout, gray accents
- **Modern** — coloured gradient header, card-based line items
- **Corporate** — enterprise letterhead with accent bars

### Export
- **PDF** — A4 format, multi-page support
- **PNG** — 2× resolution, crisp for WhatsApp/email
- **JPEG** — 0.95 quality, white background
- All exports use `html2canvas` to capture the live preview at 794px (A4 equivalent)

### Authentication
- Email + password sign-up with verification
- Email verification via client-side PKCE callback (see fix #7 below)
- Forgot password → email reset link → `/reset-password` page
- Middleware protects all routes; public routes: `/`, `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/auth/callback`

### User Profile
- Full name, business name, email, phone, address, website
- Bank details (bank name, account number, account name) — auto-populates Payment Instructions
- Logo upload (base64)
- Digital signature upload (base64)
- Brand accent colour — hex or RGB input, 10 preset swatches
- **Accent colour applies to the entire app UI at runtime** via CSS variable override (`--primary`)
- Profile persists permanently to Supabase; reloads on every sign-in via `onAuthStateChange`

### Service Catalogue
- 7 default services pre-seeded on first login
- Users can add unlimited custom services
- Each service: name, description, default rate, terms & conditions
- Selecting a service in a line item auto-populates its terms into the invoice

### Client Management
- Save and reuse client info
- Country dropdown (56 countries) with auto-fill phone dial code
- "Clear" button to wipe current client fields

### Invoice History (`/invoices`)
- All saved invoices listed
- Filter by client name / company / invoice number
- Filter by date range (from / to)
- Total value of filtered results
- **Load** — restores any past invoice into the editor in one click

### Admin Portal (`/admin`, `/admin/users`)
- Platform stats: total users, new users this month, total invoices, platform revenue
- Full user list: name, email, business, invoice count, join date
- Admin toggle (grant/revoke admin per user)
- Protected by `is_admin = true` in profiles table
- JWT token passed in Authorization header (bypasses cookie-based auth issues on Render)

### Landing Page (`/`)
- Public marketing page visible to everyone
- Authenticated users are redirected to `/app` automatically
- Sections: hero, service tags, feature grid, how-it-works, CTA

---

## Database Schema

Tables in `public` schema (run `supabase/schema.sql` in Supabase SQL Editor):

```
profiles        — one row per user, linked to auth.users
clients         — saved clients per user
services        — service catalogue per user
invoices        — saved invoices per user
invoice_items   — line items per invoice (cascade delete)
```

### Key design decisions
- `profiles.id` references `auth.users.id` — no separate user ID
- `profiles.is_admin` — boolean, default false; set via SQL only (never from the UI)
- `client_snapshot` (jsonb) on invoices — stores client data at invoice time so it's preserved even if the client is later deleted
- RLS policies on all tables — users can only read/write their own rows
- `handle_new_user` trigger — auto-creates a profile row when a user registers
- `handle_updated_at` trigger — auto-sets `updated_at` on every row update

### Granting admin access (SQL)
```sql
UPDATE public.profiles SET is_admin = true WHERE email = 'your@email.com';
```

---

## Environment Variables

### `.env.local` (local dev — never committed)
```env
NEXT_PUBLIC_SUPABASE_URL=https://vzthaonwfnrjqjnivmrb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

### Render environment variables (set in Render dashboard)
Same three variables as above.
`DATABASE_URL` and `DIRECT_URL` are NOT needed — we use the Supabase JS client directly.

### Supabase Auth configuration
- **Site URL:** `https://invoiceflow-0gsh.onrender.com`
- **Redirect URLs:** `https://*.onrender.com/**`

---

## Architecture Notes

### Data flow
- **Profile / Clients / Services** — fetched from Supabase on mount, saved back on change. All done via browser Supabase client (not API routes) for reliability.
- **Current invoice draft** — kept in React state (fast real-time preview) + persisted to `localStorage` for restore on page reload. Saved to Supabase only when user clicks "Save to History".
- **Invoice history** — fetched from Supabase when `/invoices` is visited.
- **Admin data** — fetched via API routes (`/api/admin/*`) using the service-role key (bypasses RLS to read all users). The JWT token is passed from the browser in the `Authorization` header.

### Why browser client instead of API routes for user data
Server-side Supabase client (`@supabase/ssr`) uses cookies for session management. On Render (a persistent Node.js server, not serverless), cookie-based auth in API routes was unreliable. Switched all user data hooks (`useProfile`, `useClients`, `useServices`, `useInvoice.finalizeInvoice`) to use the browser client directly, which has the session reliably in localStorage.

### Why admin routes still use API routes
Admin reads require the service-role key to bypass RLS and read other users' data. The service-role key must stay server-side (never in browser). So admin data fetching stays in API routes, but authentication is done via JWT token in the Authorization header (not cookies).

---

## Bugs Fixed — Root Causes

### Fix 1: Subtotal/total not calculating
**Root cause:** Totals were recalculated in a `useEffect` that ran after render, causing one render of stale data. On some renders it appeared static.
**Fix:** Moved all total recalculation inline inside each `setInvoice` call using a `withTotals()` helper function. Totals are now always computed synchronously.

### Fix 2: Profile setup popup recurring on every refresh
**Root cause:** The `needsSetup` check used `data.full_name` which evaluated as falsy for empty string `''` (the trigger creates a profile with `full_name = ''` on register).
**Fix:** Added an explicit `data.full_name.trim().length > 0` check. Also added a `localStorage` flag (`invoiceflow_setup_done`) as a secondary safeguard.
**Later:** Popup removed entirely at user request.

### Fix 3: Account name field not allowing spaces
**Root cause:** The Payment Instructions section was fully controlled — every keystroke re-parsed the stored string via a regex that called `.trim()`. This stripped trailing spaces before the next character could be typed.
**Fix:** Replaced with local `useState` for each payment field. Fields only sync to the invoice state on change, not the other way around. The `useEffect` re-syncs only when `invoice.id` changes (i.e. when a different invoice is loaded).

### Fix 4: Profile not persisting across sign-ins
**Root cause 1:** `ProfileDialog.handleSave` called `setProfile(form)` without `await`. If the Supabase upsert failed, the error was silently swallowed and the user saw a false "Profile saved!" toast.
**Fix:** Made `handleSave` properly `async`, awaits `setProfile`, shows error toast on failure, shows spinner while saving.

**Root cause 2:** The profile `useEffect` only ran once on mount. If the session wasn't fully established at mount time (e.g. after email verification redirect), `getUser()` returned null and the profile wasn't fetched.
**Fix:** Added `supabase.auth.onAuthStateChange` listener — profile re-fetches on every `SIGNED_IN` or `TOKEN_REFRESHED` event. Cleans up the listener on unmount.

### Fix 5: Email verification redirecting to localhost
**Root cause:** `SignUpForm` sets `emailRedirectTo: window.location.origin + '/auth/callback'`. When signing up from localhost, this puts a localhost URL in the email link.
**Fix for users:** Always register from the Render URL. The `window.location.origin` will be the Render URL.
**Fix for local testing:** Add `http://localhost:*/**` to Supabase Redirect URLs.

### Fix 6: Email verification failing for all users (PKCE)
**Root cause:** Our auth callback was a server-side Route Handler (`route.ts`). The PKCE flow stores a `code_verifier` in the browser's localStorage during sign-up. The server-side handler had no access to this verifier, causing `exchangeCodeForSession` to fail consistently.
**Fix:** Replaced `route.ts` with a client-side page (`page.tsx`). The browser Supabase client handles the code exchange in the browser, where the code verifier is stored. Shows loading/success/error states.

### Fix 7: Admin routes failing on Render
**Root cause:** Admin API routes used `createServerClient` (cookie-based auth) to verify the caller is admin. This was unreliable on Render.
**Fix:** Admin pages now pass the JWT access token in the `Authorization: Bearer <token>` header. API routes extract it with `request.headers.get('Authorization')` and verify using the admin Supabase client.

### Fix 8: Line item qty defaulting to 0
**Root cause:** Old `localStorage` draft had `quantity: 0` from before a fix that set new items to `quantity: 1`. When loaded, the draft showed zero quantity.
**Fix:** When loading an invoice from localStorage, any item with `quantity <= 0` is corrected to `quantity: 1` and its `amount` is recalculated. Also changed the qty input `onBlur` to restore to 1 if left as 0.

---

## Supabase Key Format Note

The new Supabase key format (`sb_publishable_...` / `sb_secret_...`) is used instead of the old JWT format (`eyJ...`). These are equivalent:

| Old name | New name |
|---|---|
| anon / public key | Publishable key |
| service_role key | Secret key |

Both formats work with `@supabase/supabase-js` v2.x.

---

## Deployment

### Render settings
- **Environment:** Node
- **Build command:** `npm install && npm run build`
- **Start command:** `npm run start`
- **Instance type:** Free

### After every code push
1. Push to GitHub: `git add . && git commit -m "..." && git push`
2. Render auto-deploys from `main` branch (or trigger Manual Deploy)

---

## Future Roadmap

The architecture is designed for these extensions without major refactoring:

| Feature | What's needed |
|---|---|
| Multi-currency revenue stats in admin | Group invoices by currency in stats API |
| Invoice status tracking (Draft → Sent → Paid) | Add status update UI + filter in history |
| Client portal (share invoice link) | Public `/invoice/[id]` page with RLS read policy |
| Online payments | Integrate Paystack or Flutterwave per invoice |
| Invoice templates (more) | Add new template component, register in preview selector |
| Email invoices directly | Resend / Nodemailer API route |
| Recurring invoices | Cron job on Supabase Edge Functions |
| Team/multi-user accounts | Add `organization` table, update RLS to use org_id |

---

## File Structure (key files)

```
src/
├── app/
│   ├── page.tsx                    ← Landing page (public)
│   ├── app/page.tsx                ← Invoice editor (protected)
│   ├── invoices/page.tsx           ← Invoice history (protected)
│   ├── admin/page.tsx              ← Admin dashboard (admin only)
│   ├── admin/users/page.tsx        ← User management (admin only)
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── auth/callback/page.tsx      ← Email verification (client-side PKCE handler)
│   └── api/
│       ├── profile/route.ts
│       ├── clients/ + [id]/
│       ├── services/ + [id]/
│       ├── invoices/ + [id]/
│       └── admin/users/ + stats/
├── components/
│   ├── layout/Header.tsx
│   ├── invoice/InvoiceEditor.tsx
│   ├── preview/InvoicePreview.tsx
│   ├── preview/templates/          ← Minimal, Modern, Corporate
│   ├── dialogs/ProfileDialog.tsx
│   ├── dialogs/ClientDialog.tsx
│   ├── dialogs/ServicesDialog.tsx
│   └── auth/SignInForm, SignUpForm, ForgotPasswordForm, ResetPasswordForm
├── contexts/AppContext.tsx         ← Global state provider
├── hooks/
│   ├── useProfile.ts               ← Supabase browser client, onAuthStateChange
│   ├── useClients.ts               ← Supabase browser client
│   ├── useServices.ts              ← Supabase browser client, seeds defaults
│   ├── useInvoice.ts               ← React state + localStorage draft + finalizeInvoice
│   └── useAccentColor.ts           ← Runtime CSS variable override for brand colour
├── lib/
│   ├── supabase/client.ts          ← Browser client
│   ├── supabase/server.ts          ← Server client (used only by admin routes now)
│   ├── supabase/admin.ts           ← Service-role client for admin API routes
│   ├── calculations.ts
│   ├── export.ts                   ← jsPDF + html2canvas
│   ├── formatters.ts
│   ├── countries.ts                ← 56 countries with dial codes
│   └── sample-data.ts              ← 7 default services
├── middleware.ts                   ← Route protection, admin guard
└── types/index.ts                  ← All TypeScript interfaces
supabase/
└── schema.sql                      ← Run once in Supabase SQL Editor
```
