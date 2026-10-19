import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CAUSES, CITIES, TIME_SLOTS, causeMeta } from "@/lib/data";
import { tasksQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { TaskCard } from "@/components/TaskCard";
import { Reveal } from "@/lib/motion";
import { JoinCTA } from "@/components/JoinCTA";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Find a task — GiveBack" },
      { name: "description", content: "Browse micro-volunteering tasks by cause and time available in your UK city." },
      { property: "og:title", content: "Find a task — GiveBack" },
      { property: "og:description", content: "Filter volunteering tasks by the causes you care about and the time you have." },
    ],
  }),
  component: TasksPage,
});

function Chip({ active, onClick, children, color }: { active: boolean; onClick: () => void; children: ReactNode; color?: string }) {
  const c = color ?? "var(--foreground)";
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-3.5 py-1.5 text-sm transition-all active:scale-95"
      style={active ? { background: c, borderColor: c, color: "var(--primary-foreground)" } : { borderColor: "var(--border)", background: "var(--card)" }}
    >
      {children}
    </button>
  );
}

function TasksPage() {
  const { profile } = useAuth();
  const { data: tasks = [], isLoading } = useQuery(tasksQuery);
  const [city, setCity] = useState("London");
  const [causes, setCauses] = useState<string[]>([]);
  const [maxMinutes, setMaxMinutes] = useState(240);
  const hasPrefs = !!profile?.onboarded;

  useEffect(() => {
    if (profile?.onboarded) {
      setCity(profile.city);
      setCauses(profile.causes);
      setMaxMinutes(profile.max_minutes);
    }
  }, [profile]);

  const causeOptions = hasPrefs && profile!.causes.length ? profile!.causes : [...CAUSES];
  const results = useMemo(
    () => tasks.filter((t) => t.city === city && t.minutes <= maxMinutes && (causes.length === 0 || causes.includes(t.cause))),
    [tasks, city, causes, maxMinutes],
  );
  const toggle = (c: string) => setCauses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">Find a task</h1>
      {hasPrefs ? (
        <p className="mt-2 text-muted-foreground">Tailored to your causes and the time you said you can give.</p>
      ) : profile ? (
        <p className="mt-2 text-muted-foreground">
          <Link to="/profile" className="text-primary underline underline-offset-4">Finish your profile</Link> to see tasks matched to you.
        </p>
      ) : (
        <div className="mt-6"><JoinCTA compact title="See only the tasks that fit you — create a free account" /></div>
      )}

      <div className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm font-semibold text-foreground">City</span>
          {CITIES.map((c) => <Chip key={c} active={city === c} onClick={() => setCity(c)}>{c}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm font-semibold text-foreground">Time</span>
          {TIME_SLOTS.map((s) => <Chip key={s.id} color="var(--teal)" active={maxMinutes === s.max} onClick={() => setMaxMinutes(s.max)}>{s.label}</Chip>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm font-semibold text-foreground">Cause</span>
          <Chip active={causes.length === 0} onClick={() => setCauses([])}>All</Chip>
          {causeOptions.map((c) => <Chip key={c} color={causeMeta(c).color} active={causes.includes(c)} onClick={() => toggle(c)}>{c}</Chip>)}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">{isLoading ? "Loading…" : `${results.length} task${results.length === 1 ? "" : "s"} found`}</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((t, i) => <Reveal key={t.id} delay={i * 60}><TaskCard task={t} /></Reveal>)}
      </div>
      {!isLoading && results.length === 0 && (
        <div className="mt-4 rounded-3xl bg-secondary p-10 text-center text-muted-foreground">No tasks match yet — try more time or another cause.</div>
      )}
    </div>
  );
}
