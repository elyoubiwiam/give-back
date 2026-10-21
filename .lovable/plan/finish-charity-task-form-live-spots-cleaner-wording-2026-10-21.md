# Finish: charity task form, live spots, cleaner wording

Already done: new task detail fields (what it involves, what to bring, where to meet, good for, contact on the day), bigger auto-growing text boxes, +/- volunteer counter, "booked / needed" on the charity list, "More details" on volunteer cards, spots left refreshing every 30 seconds, most long dashes removed.

## Remaining
1. Remove the last long dashes: home page title ("GiveBack | Small tasks, big kindness") and one code comment.
2. Check the email template and toasts for leftover long dashes or wordy phrases; tighten wording (short, clear, plain).
3. Save a lasting rule: no long dashes, no AI-sounding phrases, short and professional copy.
4. Check on screen at phone, tablet and desktop widths: charity task form (fields fit, buttons aligned, scrolling clear), task cards with details, booking dialog.
5. Confirm a charity edit to the number of volunteers shows up on the volunteer side.

## Technical details
- Replace remaining "—" in src/routes/index.tsx and src/lib/error-capture.ts.
- Add Core rule to mem://index.md.
- Playwright at 390, 885, 1280 wide; check build log.
