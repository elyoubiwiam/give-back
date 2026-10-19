import type { Task } from "@/lib/data";

function range(task: Task) {
  const start = task.starts_at ? new Date(task.starts_at) : new Date(Date.now() + 86400000);
  const end = new Date(start.getTime() + task.minutes * 60000);
  return { start, end };
}
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const details = (t: Task) => `Volunteering with ${t.org} via GiveBack. Earn ${t.points} pts.`;

export function googleCalendarUrl(t: Task) {
  const { start, end } = range(t);
  const p = new URLSearchParams({ action: "TEMPLATE", text: `GiveBack: ${t.title}`, dates: `${stamp(start)}/${stamp(end)}`, details: details(t), location: `${t.org}, ${t.city}` });
  return `https://calendar.google.com/calendar/render?${p}`;
}

export function outlookCalendarUrl(t: Task) {
  const { start, end } = range(t);
  const p = new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: `GiveBack: ${t.title}`, startdt: start.toISOString(), enddt: end.toISOString(), body: details(t), location: `${t.org}, ${t.city}` });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p}`;
}

export function downloadIcs(t: Task) {
  const { start, end } = range(t);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//GiveBack//EN", "BEGIN:VEVENT", `UID:${t.id}@giveback`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, `SUMMARY:GiveBack: ${t.title}`, `DESCRIPTION:${details(t)}`, `LOCATION:${t.org}\\, ${t.city}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "giveback-task.ics";
  a.click();
}
