import type { LucideIcon } from "lucide-react";
import { Leaf, Utensils, PawPrint, HeartHandshake, GraduationCap, Home, Stethoscope, Palette } from "lucide-react";

export const CITIES = ["London", "Manchester", "Bristol", "Edinburgh", "Leeds", "Glasgow"] as const;
export type City = (typeof CITIES)[number];

export const CITY_CENTERS: Record<City, [number, number]> = {
  London: [51.507, -0.1],
  Manchester: [53.48, -2.235],
  Bristol: [51.455, -2.59],
  Edinburgh: [55.952, -3.19],
  Leeds: [53.8, -1.549],
  Glasgow: [55.864, -4.252],
};

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

/** Each cause maps to a semantic colour token defined in styles.css. */
export const CAUSE_META: Record<Cause, { color: string; icon: LucideIcon }> = {
  Environment: { color: "var(--sage)", icon: Leaf },
  "Food & Hunger": { color: "var(--mustard)", icon: Utensils },
  Animals: { color: "var(--coral)", icon: PawPrint },
  "Elderly Care": { color: "var(--plum)", icon: HeartHandshake },
  "Youth & Education": { color: "var(--teal)", icon: GraduationCap },
  Homelessness: { color: "var(--primary)", icon: Home },
  Health: { color: "var(--coral)", icon: Stethoscope },
  "Arts & Culture": { color: "var(--plum)", icon: Palette },
};
export const causeMeta = (c: string) => CAUSE_META[c as Cause] ?? CAUSE_META.Environment;

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

/** 1 point per minute volunteered — keeps tasks proportional to reward costs. */
export const pointsForMinutes = (minutes: number) => minutes;

/** Share of a reward a task earns, e.g. "Half a free flat white". */
export function rewardEquivalent(points: number) {
  const sorted = [...REWARDS].sort((a, b) => b.cost - a.cost);
  const full = sorted.find((r) => r.cost <= points);
  if (full) return `Enough for: ${full.offer.toLowerCase()} at ${full.partner}`;
  const r = [...REWARDS].sort((a, b) => a.cost - b.cost)[0]!;
  const pct = Math.round((points / r.cost) * 100);
  return `${pct}% of ${r.offer.toLowerCase()} at ${r.partner}`;
}

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
  city: string;
  cause: string;
  minutes: number;
  points: number;
  when_label: string;
  starts_at?: string | null;
  spots: number;
  lat: number;
  lng: number;
};

export const RECENT_ACTIONS: { name: string; action: string; city: City; ago: string; cause: Cause }[] = [
  { name: "Amira", action: "sorted 120 tins at Hackney Food Bank", city: "London", ago: "12 min ago", cause: "Food & Hunger" },
  { name: "Tom", action: "walked two rescue dogs", city: "London", ago: "40 min ago", cause: "Animals" },
  { name: "Priya", action: "shared tea with a resident at Age Together", city: "London", ago: "2 h ago", cause: "Elderly Care" },
  { name: "Callum", action: "served 60 hot meals", city: "Manchester", ago: "1 h ago", cause: "Homelessness" },
  { name: "Grace", action: "read with Year 3 pupils", city: "Manchester", ago: "3 h ago", cause: "Youth & Education" },
  { name: "Ben", action: "planted 300 bulbs", city: "Bristol", ago: "25 min ago", cause: "Environment" },
  { name: "Isla", action: "packed 40 hygiene kits", city: "Edinburgh", ago: "1 h ago", cause: "Homelessness" },
  { name: "Sam", action: "stewarded the Leeds Heart Run", city: "Leeds", ago: "5 h ago", cause: "Health" },
  { name: "Ewan", action: "cleaned cat enclosures", city: "Glasgow", ago: "2 h ago", cause: "Animals" },
];

export const REWARDS = [
  { id: "r1", partner: "Ozone Coffee", offer: "Free flat white", cost: 100, kind: "Coffee", color: "var(--mustard)" },
  { id: "r2", partner: "Gail's Bakery", offer: "20% off pastries", cost: 80, kind: "Food", color: "var(--coral)" },
  { id: "r3", partner: "Waterstones", offer: "£5 off any book", cost: 150, kind: "Shop", color: "var(--teal)" },
  { id: "r4", partner: "Picturehouse", offer: "2-for-1 cinema tickets", cost: 220, kind: "Events", color: "var(--plum)" },
  { id: "r5", partner: "Oxfam Shops", offer: "15% off pre-loved", cost: 60, kind: "Shop", color: "var(--sage)" },
  { id: "r6", partner: "Local gig night", offer: "Free entry", cost: 300, kind: "Events", color: "var(--primary)" },
];

export const LEVELS = [
  { name: "Seedling", min: 0 },
  { name: "Helper", min: 100 },
  { name: "Neighbour", min: 300 },
  { name: "Champion", min: 700 },
  { name: "Local Hero", min: 1500 },
] as const;

export function levelFor(points: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (points >= l.min) idx = i;
  });
  return { current: LEVELS[idx]!, next: LEVELS[idx + 1] };
}

export const formatMinutes = (m: number) => (m < 60 ? `${m} min` : `${m / 60} h`);
