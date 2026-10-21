import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock, HandCoins, Lightbulb, Repeat, Timer, Users, UserX, Gauge } from "lucide-react";
import { avgHoursToFill, computeKpis, taskPhase, type TaskPhase } from "@/lib/charity-stats";
import { charityActivityQuery, charityDonationsQuery, myCharityQuery, myCharityTasksQuery } from "@/lib/charity";
import { causeMeta, formatMinutes, formatTaskWhen } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/charity/")({
  head: () => ({
    meta: [
      { title: "Charity dashboard — GiveBack" },
      { name: "description", content: "See your volunteers, returning helpers, hours given and donations on GiveBack." },
      { property: "og:title", content: "Charity dashboard — GiveBack" },
      { property: "og:description", content: "Your volunteering and donation results at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekKey = (d: Date) => {
  const x = new Date(d); x.setUTCHours(0, 0, 0, 0); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x.toISOString().slice(5, 10);
};

function Dashboard() {
  const { data: charity, isLoading } = useQuery(myCharityQuery);
  const { data: tasks = [] } = useQuery({ ...myCharityTasksQuery(charity?.id ?? ""), enabled: !!charity });
  const { data: activity = [] } = useQuery(charityActivityQuery);
  const { data: donations = [] } = useQuery(charityDonationsQuery);
  const [tab, setTab] = useState<TaskPhase>("upcoming");

  const statTasks = tasks.map((t) => ({ ...t, created_at: t.created_at }));
  const k = computeKpis(statTasks, activity);
  const fillHours = avgHoursToFill(statTasks, activity);
  const bookings = activity.filter((a) => a.kind === "booked");
  const bookedBy = useMemo(() => {
    const m = new Map<string, number>();
    bookings.forEach((b) => m.set(b.task_id, (m.get(b.task_id) ?? 0) + 1));
    return m;
  }, [bookings]);
  const donated = donations.reduce((s, d) => s + d.amount_pence, 0) / 100;
  const donors = new Set(donations.map((d, i) => d.user_id ?? `anon-${i}`)).size;

  const weekly = useMemo(() => {
    const seen = new Set<string>(); const rows = new Map<string, { week: string; New: number; Returning: number }>();
    [...bookings].sort((a, b) => a.created_at.localeCompare(b.created_at)).forEach((b) => {
      const w = weekKey(new Date(b.created_at));
      const r = rows.get(w) ?? { week: w, New: 0, Returning: 0 };
      if (seen.has(b.volunteer_id)) r.Returning++; else { r.New++; seen.add(b.volunteer_id); }
      rows.set(w, r);
    });
    return [...rows.values()].slice(-10);
  }, [bookings]);

  const byDay = useMemo(() => {
    const c = DAYS.map((d) => ({ day: d, Bookings: 0 }));
    const minutes = new Map(tasks.map((t) => [t.id, t.starts_at]));
    bookings.forEach((b) => { const s = minutes.get(b.task_id); if (s) c[(new Date(s).getUTCDay() + 6) % 7]!.Bookings++; });
    return c;
  }, [bookings, tasks]);

  const fillPerTask = tasks.slice(0, 12).map((t) => ({ name: t.title.slice(0, 14), Fill: Math.round(((bookedBy.get(t.id) ?? 0) / t.spots) * 100) }));

  const tips: string[] = [];
  const bestDay = [...byDay].sort((a, b) => b.Bookings - a.Bookings)[0];
  if (bestDay && bestDay.Bookings > 0) tips.push(`${bestDay.day} tasks get the most bookings — post your next one then.`);
  if (k.oneTimers > 0) tips.push(`${k.oneTimers} volunteer${k.oneTimers > 1 ? "s" : ""} came once — post a similar task soon to bring them back.`);
  if (k.fillPct < 50 && tasks.length) tips.push("Under half your spots are filled — shorter tasks (under 1 hour) tend to fill faster.");
  if (k.cancelPct > 20) tips.push("Cancellations are high — a clear description of what to expect helps people commit.");
  if (!tips.length) tips.push("Post your first task to start seeing volunteers here.");

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!charity) return <p className="text-muted-foreground">Your charity account isn't linked yet — contact GiveBack.</p>;

  const listed = tasks.filter((t) => taskPhase(t) === tab);
  const kpis = [
    { label: "Volunteers reached", value: k.volunteers, icon: Users, color: "var(--teal)" },
    { label: "Returning volunteers", value: `${k.returningPct}%`, icon: Repeat, color: "var(--primary)", hint: `${k.returning} came back` },
    { label: "Hours given", value: k.hours, icon: Clock, color: "var(--sage)" },
    { label: "Fill rate", value: `${k.fillPct}%`, icon: Gauge, color: "var(--sky)" },
    { label: "Cancellation rate", value: `${k.cancelPct}%`, icon: UserX, color: "var(--coral)" },
    { label: "Avg time to fill", value: fillHours === null ? "—" : `${fillHours} h`, icon: Timer, color: "var(--plum)" },
    { label: "Donations via GiveBack", value: `£${donated.toLocaleString("en-GB")}`, icon: HandCoins, color: "var(--mustard)", hint: `${donors} donor${donors === 1 ? "" : "s"} · pledged` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {charity.logo_url ? <img src={charity.logo_url} alt="" className="h-14 w-14 rounded-2xl object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">{charity.name[0]}</span>}
          <div>
            <h1 className="text-3xl font-bold text-foreground">{charity.name}</h1>
            <p className="text-muted-foreground">Your impact on GiveBack</p>
          </div>
        </div>
        <Link to="/charity/tasks" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">+ Add a task</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((x) => (
          <div key={x.label} className="rounded-3xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground" style={{ background: x.color }}><x.icon className="h-4 w-4" /></span>
            <p className="mt-3 text-2xl font-bold text-foreground">{x.value}</p>
            <p className="text-sm text-muted-foreground">{x.label}</p>
            {x.hint && <p className="text-xs text-muted-foreground">{x.hint}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-mustard/15 p-5">
        <h2 className="flex items-center gap-2 font-semibold text-foreground"><Lightbulb className="h-4 w-4 text-primary" /> Tips to bring volunteers back</h2>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-foreground">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Volunteers per week (new vs returning)">
          <BarChart data={weekly}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="week" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip /><Legend />
            <Bar dataKey="New" stackId="a" fill="var(--teal)" radius={[0, 0, 0, 0]} /><Bar dataKey="Returning" stackId="a" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart>
        </Chart>
        <Chart title="Bookings by day of the week">
          <BarChart data={byDay}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="day" fontSize={12} /><YAxis allowDecimals={false} fontSize={12} /><Tooltip />
            <Bar dataKey="Bookings" fill="var(--mustard)" radius={[6, 6, 0, 0]} /></BarChart>
        </Chart>
        <Chart title="Fill rate per task (%)" wide>
          <BarChart data={fillPerTask}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={11} /><YAxis domain={[0, 100]} fontSize={12} /><Tooltip />
            <Bar dataKey="Fill" fill="var(--sage)" radius={[6, 6, 0, 0]} /></BarChart>
        </Chart>
      </div>

      <section>
        <div className="mb-4 inline-flex rounded-full bg-secondary p-1">
          {(["upcoming", "ongoing", "past"] as const).map((p) => (
            <button key={p} onClick={() => setTab(p)} className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${tab === p ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {p === "ongoing" ? "Today" : p} ({tasks.filter((t) => taskPhase(t) === p).length})
            </button>
          ))}
        </div>
        {listed.length === 0 ? <p className="text-muted-foreground">No tasks here.</p> : (
          <div className="space-y-2">
            {listed.map((t) => {
              const b = bookedBy.get(t.id) ?? 0; const c = causeMeta(t.cause).color;
              return (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-1.5 rounded-full" style={{ background: c }} />
                    <div><p className="font-medium text-foreground">{t.title}</p><p className="text-xs text-muted-foreground">{formatTaskWhen(t)} · {formatMinutes(t.minutes)} · {t.city}</p></div>
                  </div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-foreground">{b} / {t.spots} volunteers</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Chart({ title, children, wide }: { title: string; children: React.ReactElement; wide?: boolean }) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-4 ${wide ? "lg:col-span-2" : ""}`}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="h-56"><ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer></div>
    </div>
  );
}
