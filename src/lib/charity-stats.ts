import { TIME_SLOTS } from "./data";

/** Half a day is the longest task a charity can post. */
export const MAX_TASK_MINUTES = TIME_SLOTS[TIME_SLOTS.length - 1]!.max;

/** Duration choices grouped by the same time slots volunteers filter by. */
export const TASK_DURATIONS = TIME_SLOTS.map((slot, i) => {
  const min = i === 0 ? 5 : TIME_SLOTS[i - 1]!.max + 15;
  const options: number[] = [];
  for (let m = i === 0 ? 15 : min; m <= slot.max; m += i < 2 ? 15 : 30) options.push(m);
  return { ...slot, options };
});

export const isValidTaskMinutes = (m: number) => Number.isInteger(m) && m >= 5 && m <= MAX_TASK_MINUTES;

export type Activity = { kind: string; task_id: string; volunteer_id: string; created_at: string };
export type StatTask = { id: string; spots: number; minutes: number; starts_at: string | null; created_at: string; cause: string };

export type TaskPhase = "upcoming" | "ongoing" | "past";

const londonDay = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(d);

/** Ongoing = happening today (UK time); otherwise upcoming or past. */
export function taskPhase(t: { starts_at: string | null }, now = new Date()): TaskPhase {
  if (!t.starts_at) return "upcoming";
  const s = new Date(t.starts_at);
  if (londonDay(s) === londonDay(now)) return "ongoing";
  return s > now ? "upcoming" : "past";
}

export function computeKpis(tasks: StatTask[], activity: Activity[]) {
  const bookings = activity.filter((a) => a.kind === "booked");
  const cancels = activity.filter((a) => a.kind === "cancelled");
  const minutesByTask = new Map(tasks.map((t) => [t.id, t.minutes]));
  const perVolunteer = new Map<string, number>();
  bookings.forEach((b) => perVolunteer.set(b.volunteer_id, (perVolunteer.get(b.volunteer_id) ?? 0) + 1));
  const volunteers = perVolunteer.size;
  const returning = [...perVolunteer.values()].filter((n) => n >= 2).length;
  const spotsOffered = tasks.reduce((s, t) => s + t.spots, 0);
  const hours = bookings.reduce((s, b) => s + (minutesByTask.get(b.task_id) ?? 0), 0) / 60;
  const attempts = bookings.length + cancels.length;
  return {
    volunteers,
    returning,
    returningPct: volunteers ? Math.round((returning / volunteers) * 100) : 0,
    oneTimers: volunteers - returning,
    hours: Math.round(hours * 10) / 10,
    fillPct: spotsOffered ? Math.round((bookings.length / spotsOffered) * 100) : 0,
    cancelPct: attempts ? Math.round((cancels.length / attempts) * 100) : 0,
    bookings: bookings.length,
  };
}

/** Average hours between a task being posted and it filling all its spots (only filled tasks). */
export function avgHoursToFill(tasks: StatTask[], activity: Activity[]) {
  const times: number[] = [];
  for (const t of tasks) {
    const b = activity.filter((a) => a.kind === "booked" && a.task_id === t.id).map((a) => +new Date(a.created_at)).sort((x, y) => x - y);
    if (b.length >= t.spots && t.spots > 0) times.push((b[t.spots - 1]! - +new Date(t.created_at)) / 36e5);
  }
  return times.length ? Math.round((times.reduce((s, x) => s + x, 0) / times.length) * 10) / 10 : null;
}
