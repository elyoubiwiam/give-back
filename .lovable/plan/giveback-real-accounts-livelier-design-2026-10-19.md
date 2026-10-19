# GiveBack: real accounts + livelier design

## 1. Account system (Lovable Cloud)
- Turn on Lovable Cloud.
- Sign in with **email + password** and **Google**. Includes "forgot password" and reset-password pages.
- New `/auth` page with tabs for sign in and sign up. After signing up, people go through a short onboarding to set up their profile.
- The **profile** is saved to your account instead of the device: name, city, causes, skills, time per task, points.
- The header changes once you're signed in: it shows your avatar, your points and a sign-out button.
- **Profile** and **Rewards** need you to be signed in. **Tasks**, **Community**, **Map** and **Donate** stay public.
- "Lend a hand" signs you up for a task, saves it to your account and adds the points. Signed-out visitors are asked to sign in first.
- Donations stay as a "coming soon" placeholder.

## 2. Visual refresh
- Font: **Poppins** everywhere.
- Keep the warm terracotta and cream base, and add accent colours, each used as a colour code for a cause:
  - Mustard yellow
  - Sage green
  - Coral pink
  - Plum
  - Teal
- Each cause gets its own colour on cards, chips, map pins and charts.
- More movement:
  - Cards lift and tilt slightly when you point at them.
  - Cards fade in as you scroll.
  - Numbers count up.
  - Clicking "Lend a hand" plays a small points pop.
- **Task cards** become richer: a colour band for the cause, an icon, a bar showing spots left, and a "Joined" state.

## 3. Map of events
- New **Map** page. It shows every task as a pin coloured by cause, and you can filter it by city and cause.
- Clicking a pin opens a mini task card where you can join the task.
- A smaller version of the map also appears on the home page for the chosen city.
- The map uses free OpenStreetMap tiles, so it needs no account or key.

## 4. City ranking
- The Community page becomes a ranking of the cities:
  - The top 3 cities sit on a podium.
  - Bars below show the rest, and you can switch between hours, good deeds and neighbours.
  - Each city has a card showing its top causes.
  - A live feed shows the latest actions.
- The numbers come from task sign-ups stored in Cloud, plus starting sample numbers.

## Technical details
- Tables:
  - `profiles`: links to the user's account, holds causes and skills as lists, max minutes, city, points. It is created automatically when someone signs up.
  - `tasks`: sample rows inserted in the setup step, with latitude and longitude.
  - `task_signups`: one row per user per task.
- Access rules: only you can read and update your own profile. Tasks are public to read. You can only add or see your own sign-ups.
- A database function adds up public totals per city (counts only), without exposing anyone's personal details.
- Points are added safely when someone joins a task.
- Map: Leaflet + react-leaflet, loaded only in the browser so the server-rendered pages don't break.
- Animations: CSS and Tailwind keyframes plus a small hook that fades things in on scroll. No heavy animation library.
- Protected pages go behind the Cloud sign-in gate. `/profile` becomes onboarding plus editing your profile.
- Memory gets updated with the new font (Poppins) and the accent colour palette.
