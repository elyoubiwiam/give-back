# Clearer accounts, a "support GiveBack" option, and an illustrated UK map

## 1. Make the account offer clear
- Main message everywhere: **"Create a free account to get tasks tailored to the causes you care about."**
- Clear buttons pointing to sign-up:
  - **Home:** a "Create your free account" button next to "Find a task", plus a banner after the task cards ("Get tasks matched to your causes and your time — free").
  - **Tasks:** if you're signed out, a coloured box above the results saying "See only the tasks that fit you", with a sign-up button.
  - **Map and Cities:** a small strip at the bottom of each page asking people to join.
  - **Header:** the button for signed-out visitors changes to "Join free" (sign-in stays reachable from the account page).
  - **Joining a task while signed out** opens the account page on "Create account" with a short note.
- The account page opens on **Create account** by default. It lists 3 short benefits:
  - tasks tailored to your causes
  - tasks that fit your time
  - points and local rewards
- It also says "Free, always".

## 2. "Donate to GiveBack to keep the service rolling"
- **At sign-up:** an optional tick box, unticked by default: "Donate to GiveBack to keep the service rolling (optional, you choose the amount later)". Your choice is saved to your account.
- **In your profile:** the same option can be switched on or off any time.
- **On the Donate page:** an optional tick box, "Add a little for GiveBack to keep the service rolling", with a choice of £1, £2 or £5. The button total includes it, for example "Donate £10 + £2 to GiveBack".
- Payments are still "coming soon". The choice is saved, but no money is taken yet.

## 3. Illustrated 2D UK map
- Replace the street map with a flat, drawn map of the UK in the app's warm colours.
- Each city is shown as a dot. The dot size reflects how many tasks the city has, and the dot gently pulses.
- Tapping a city highlights it and shows that city's tasks as cards beside the map, which you can filter by cause.
- The home page gets a smaller version where tapping a city switches the city shown on the page.
- The street-map library is removed.

## Technical details
- Profiles get a new yes/no field for supporting GiveBack (off by default). Sign-up passes the choice along when the account is created, so it is saved from the start.
- The UK map is a hand-made drawing of the UK outline in the app's colour tokens. Cities are placed from their latitude and longitude onto the drawing.
- One map component is reused by the Map page and the home page.
- The Leaflet and react-leaflet packages are removed, along with the code that loaded the street map.
- The amount added for GiveBack is kept on the Donate page only, until payments are switched on.
- Memory gets updated with the free plan, the optional "support GiveBack" donation, and the illustrated map preference.
