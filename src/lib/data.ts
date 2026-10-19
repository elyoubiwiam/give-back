export const CITIES = ["London", "Manchester", "Bristol", "Edinburgh", "Leeds", "Glasgow"] as const;
export type City = (typeof CITIES)[number];

export const CAUSES = [
  "Environment",
  "Food & Hunger",
  "Animals",
  "Elderly Care",
  "Youth & Education",
  "Homelessness",
  "Health",
  "Arts & Culture",
] as const;
export type Cause = (typeof CAUSES)[number];

export const SKILLS = [
  "Heavy lifting",
  "Driving",
  "Cooking",
  "Tutoring",
  "Gardening",
  "Admin & digital",
  "Event setup",
  "Companionship",
] as const;

export const TIME_SLOTS = [
  { id: "30", label: "Under 30 min", max: 30 },
  { id: "60", label: "Up to 1 hour", max: 60 },
  { id: "120", label: "Up to 2 hours", max: 120 },
  { id: "240", label: "Half a day", max: 240 },
] as const;

export type Task = {
  id: string;
  title: string;
  org: string;
  city: City;
  cause: Cause;
  minutes: number;
  points: number;
  when: string;
  spots: number;
};

export const TASKS: Task[] = [
  { id: "1", title: "Sort donated tins at the food bank", org: "Hackney Food Bank", city: "London", cause: "Food & Hunger", minutes: 60, points: 40, when: "Sat, 10:00", spots: 4 },
  { id: "2", title: "Walk two senior dogs", org: "Battersea Friends", city: "London", cause: "Animals", minutes: 30, points: 20, when: "Today, 17:30", spots: 2 },
  { id: "3", title: "Litter pick along the canal", org: "Canal Keepers", city: "London", cause: "Environment", minutes: 120, points: 70, when: "Sun, 09:00", spots: 12 },
  { id: "4", title: "Tea & chat with a resident", org: "Age Together", city: "London", cause: "Elderly Care", minutes: 60, points: 45, when: "Wed, 15:00", spots: 3 },
  { id: "5", title: "Carry chairs for a community fair", org: "Ancoats Hub", city: "Manchester", cause: "Arts & Culture", minutes: 120, points: 60, when: "Sat, 08:30", spots: 6 },
  { id: "6", title: "Serve hot meals", org: "Mustard Tree", city: "Manchester", cause: "Homelessness", minutes: 240, points: 120, when: "Fri, 18:00", spots: 5 },
  { id: "7", title: "Read with Year 3 pupils", org: "Reading Buddies", city: "Manchester", cause: "Youth & Education", minutes: 60, points: 45, when: "Thu, 14:00", spots: 2 },
  { id: "8", title: "Plant bulbs in the community garden", org: "Bristol Green", city: "Bristol", cause: "Environment", minutes: 120, points: 65, when: "Sun, 11:00", spots: 8 },
  { id: "9", title: "Drive meal deliveries", org: "Bristol Meals on Wheels", city: "Bristol", cause: "Elderly Care", minutes: 120, points: 80, when: "Tue, 11:30", spots: 1 },
  { id: "10", title: "Pack hygiene kits", org: "Streetwise Edinburgh", city: "Edinburgh", cause: "Homelessness", minutes: 30, points: 25, when: "Today, 19:00", spots: 10 },
  { id: "11", title: "Steward a charity 5k", org: "Leeds Heart Run", city: "Leeds", cause: "Health", minutes: 240, points: 110, when: "Sun, 07:30", spots: 15 },
  { id: "12", title: "Clean cat enclosures", org: "Glasgow Cat Rescue", city: "Glasgow", cause: "Animals", minutes: 60, points: 40, when: "Sat, 13:00", spots: 3 },
];

export const RECENT_ACTIONS: { name: string; action: string; city: City; ago: string }[] = [
  { name: "Amira", action: "sorted 120 tins at Hackney Food Bank", city: "London", ago: "12 min ago" },
  { name: "Tom", action: "walked two rescue dogs", city: "London", ago: "40 min ago" },
  { name: "Priya", action: "shared tea with a resident at Age Together", city: "London", ago: "2 h ago" },
  { name: "Callum", action: "served 60 hot meals", city: "Manchester", ago: "1 h ago" },
  { name: "Grace", action: "read with Year 3 pupils", city: "Manchester", ago: "3 h ago" },
  { name: "Ben", action: "planted 300 bulbs", city: "Bristol", ago: "25 min ago" },
  { name: "Isla", action: "packed 40 hygiene kits", city: "Edinburgh", ago: "1 h ago" },
  { name: "Sam", action: "stewarded the Leeds Heart Run", city: "Leeds", ago: "5 h ago" },
  { name: "Ewan", action: "cleaned cat enclosures", city: "Glasgow", ago: "2 h ago" },
];

export const CITY_STATS: { city: City; hours: number; actions: number; volunteers: number }[] = [
  { city: "Manchester", hours: 4820, actions: 1630, volunteers: 712 },
  { city: "London", hours: 4510, actions: 1890, volunteers: 1204 },
  { city: "Bristol", hours: 3120, actions: 980, volunteers: 401 },
  { city: "Edinburgh", hours: 2760, actions: 845, volunteers: 366 },
  { city: "Leeds", hours: 2210, actions: 702, volunteers: 298 },
  { city: "Glasgow", hours: 1980, actions: 655, volunteers: 274 },
];

export const REWARDS = [
  { id: "r1", partner: "Ozone Coffee", offer: "Free flat white", cost: 100, kind: "Coffee" },
  { id: "r2", partner: "Gail's Bakery", offer: "20% off pastries", cost: 80, kind: "Food" },
  { id: "r3", partner: "Waterstones", offer: "£5 off any book", cost: 150, kind: "Shop" },
  { id: "r4", partner: "Picturehouse", offer: "2-for-1 cinema tickets", cost: 220, kind: "Events" },
  { id: "r5", partner: "Oxfam Shops", offer: "15% off pre-loved", cost: 60, kind: "Shop" },
  { id: "r6", partner: "Local gig night", offer: "Free entry", cost: 300, kind: "Events" },
];

export const LEVELS = [
  { name: "Seedling", min: 0 },
  { name: "Helper", min: 100 },
  { name: "Neighbour", min: 300 },
  { name: "Champion", min: 700 },
  { name: "Local Hero", min: 1500 },
];

export function levelFor(points: number) {
  let current: (typeof LEVELS)[number] = LEVELS[0]!;
  let next: (typeof LEVELS)[number] | undefined;
  for (let i = 0; i < LEVELS.length; i++) {
    if (points >= LEVELS[i]!.min) {
      current = LEVELS[i]!;
      next = LEVELS[i + 1];
    }
  }
  return { current, next };
}
