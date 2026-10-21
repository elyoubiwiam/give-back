# Charity side for GiveBack

## What charities get
A separate charity area (own sign-in landing at `/charity`) with its own menu: Dashboard, Tasks, Profile. Volunteers never see it; charities never see the volunteer profile/rewards.

### 1. Accounts you hand out
- You (Wiam) get an admin role and a small "Charities" admin page: type the charity name, email and a password, press Create. The login works straight away (no confirmation email), and you pass the details to the charity.
- From that page you can also reset a charity's password or switch an account off.
- Charities sign in on the normal sign-in page and are sent to their dashboard.

### 2. Charity profile
- Name, logo (image upload), short description, website, contact email/phone, city, main causes (same 8 cause colours).
- Legal details: registered charity number, regulator (Charity Commission England & Wales / OSCR Scotland / CCNI Northern Ireland), registered address, safeguarding lead name, DBS-checks yes/no, public liability insurance (yes/no + expiry date), optional document upload (e.g. insurance certificate).
- Logo and name appear on their task cards for volunteers.

### 3. Adding tasks
Form: title, cause, description, city + area, date and start time, how many volunteers needed, and duration picked from the same choices volunteers filter by on the site: Under 30 min, Up to 1 hour, Up to 2 hours, Half a day (max 4 h). Exact minutes chosen inside that slot (e.g. 15/30, 45/60, 90/120, 180/240).
- Points are worked out automatically (1 per minute), so it stays fair with rewards.
- Tasks go live immediately in Tasks, Map and Home; charities can edit or cancel their own tasks.
- "Spots left" on volunteer cards counts down as people book.

### 4. Dashboard
- Tabs: Upcoming / Ongoing (happening today) / Past, each listing tasks with booked vs needed spots.
- KPIs (chosen to help charities attract and keep volunteers):
  - Volunteers reached (unique people)
  - Returning volunteers % (came to 2+ of your tasks) — the headline "come back" figure
  - Hours given in total
  - Fill rate (spots booked ÷ spots offered)
  - Cancellation rate
  - Average time to fill a task after posting
  - Busiest cause and best day/time slot to post
  - Donations received through GiveBack (£ total + number of donors)
- Charts: volunteers per week (new vs returning), hours per month, fill rate per task, bookings by day of week.
- Tips panel driven by the numbers, e.g. "Saturday morning tasks fill 2x faster" or "12 volunteers came once — post a similar task to bring them back".

### 5. Donations KPI
Donations still take no real money. The donate page will start saving each pledge against the chosen charity, so the KPI shows "pledged" amounts now and becomes real totals the day payments are switched on. The GiveBack add-on is kept separate and never counted for the charity.

## Assumptions to confirm
- One login per charity (no multiple staff accounts for now).
- Existing demo tasks stay, owned by placeholder charities.
- "Ongoing" = tasks happening today.

## Technical details
- `user_roles` table + `app_role` enum ('admin','charity') with `has_role()` security-definer; admin role granted to your account.
- `charities` table (owner user_id, profile + legal fields, logo_url, active); `tasks.charity_id` nullable column added (old `org` text kept for demo tasks); `tasks.description`.
- RLS: charities insert/update/delete only tasks where they own the charity; public read stays. Signups readable by the owning charity only through a security-definer stats function (no volunteer emails exposed; first names only).
- `donations` table (charity_id, amount_pence, giveback_pence, user_id nullable, created_at); insert from donate page.
- Storage buckets: `charity-logos` (public), `charity-docs` (private, owner-only policies).
- Admin server function (requireSupabaseAuth + has_role admin check, then admin client) to create charity users with confirmed email and the charity role.
- New routes under `_authenticated/charity/` (dashboard, tasks, profile) gated by charity role, `_authenticated/admin/charities`. Charts with recharts. Duration options derived from shared TIME_SLOTS.
- Tests: duration ≤ 240 min rule, returning-volunteer and fill-rate calculations.
