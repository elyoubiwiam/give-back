# Task sign-up confirmation email + add to calendar

When someone taps "Lend a hand" on a task, they get a confirmation email and can save the task to their calendar.

## What users will see
- **Straight away in the app:** after joining, the success message has an "Add to calendar" button. It offers Google Calendar, Outlook, or Apple/other calendars (a downloadable calendar file).
- **Joined tasks:** an "Add to calendar" link also appears on task cards they've already joined.
- **Email:** "You're in: <task title>". It shows the charity, city, time needed, when it happens, points earned, plus "Add to Google Calendar" and "Add to Outlook" buttons. It's styled in GiveBack's warm colours and Poppins-like font.

## What's needed from you
- **A domain you own** to send email from (e.g. notify.giveback.co.uk). Until it's set up and verified, the calendar buttons work but emails won't go out.
- **Real dates for tasks:** right now tasks only have labels like "Sat 10am". I'll add a proper date and time to each task so calendars get the right slot. Sample tasks get dates in the coming weeks.

## Technical details
- Migration: add nullable `starts_at timestamptz` to `tasks`, then backfill sample rows with upcoming dates. `when_label` stays for display.
- Calendar helper (`src/lib/calendar.ts`): builds a Google Calendar URL, an Outlook URL, and an `.ics` blob download. The end time is `starts_at + minutes`.
- Email: scaffold app email templates, then add the `task-joined` React Email template (white body, terracotta accents).
- Server function `notifyTaskJoined` (with requireSupabaseAuth): reads the task and the user's email from the session, then sends via `sendTemplateEmail` with idempotency key `task-joined-<user>-<task>`. Called from `useJoinTask` after `join_task` succeeds; failures are logged and don't block the join.
- Make sure `src/start.ts` attaches the auth bearer middleware.
