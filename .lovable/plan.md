# Fuller charity task form, live spots, and cleaner wording

## 1. Charity task form: more detail
Add fields so charities can explain the task fully:
- **What it involves** (bigger text box, auto-grows, up to 1,500 characters, with a counter)
- **What to bring / wear** (optional)
- **Meeting point / address** (optional)
- **Who it suits** (optional, e.g. "Good for beginners", "Over 18 only")
- **Contact on the day** (optional name or phone)
- **How many volunteers needed** (kept, clearer number box with + / - buttons, 1 to 500)
- Existing: title, cause, city, date, start time, duration (max half a day).

Volunteers see these details on the task card ("More details" opens them) and in the booking confirmation.

## 2. Spots needed and spots left, always in sync
- Volunteers see "X of Y spots left" on each task, updated after every booking or cancellation (and refreshed every 30 seconds while the page is open).
- Charities see "booked / needed" for each task in their list and dashboard, updating the same way.
- When full, the volunteer button shows "Fully booked". If a charity lowers the number below current bookings, the form warns them.

## 3. Layout check on every form and page
- Text boxes full width on small screens, tall enough for their content, long text wraps instead of being cut off.
- Buttons stay aligned and never overlap, at phone, tablet and desktop widths.
- Long lists and dialogs scroll clearly, with a soft fade at the edge when there's more below.
- Checked on screen at 390, 885 and 1280 px wide.

## 4. Writing clean-up across the app
- Remove every long dash from the app's visible text and emails, rewriting sentences with full stops, commas or colons.
- Tighten wording: short, clear, professional, no filler phrases.
- Save this as a lasting rule so future text follows it.

## Technical details
- Migration: add nullable text columns to `tasks`: `what_to_bring`, `meeting_point`, `suitable_for`, `day_contact`; raise description limit to 1500 in the form.
- Spots: reuse `bookedCountsQuery` with `refetchInterval: 30000` and invalidate on join/cancel (already partly done); show remaining on TaskCard and charity task list.
- Textareas use an auto-resize helper; inputs `w-full min-w-0`; grids collapse to 1 column below `sm`.
- Replace "—" in user-facing strings in src (about 20 files); leave code comments/README alone. Add memory rule: no em dashes, no AI-isms, short and plain copy.
