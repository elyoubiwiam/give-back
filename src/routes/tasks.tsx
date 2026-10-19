import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CAUSES, CITIES, TASKS, TIME_SLOTS, type Cause, type City } from "@/lib/data";
import { useProfile } from "@/lib/profile";
import { TaskCard } from "@/components/TaskCard";

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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`}
    >
      {children}
    </button>
  );
}

function TasksPage() {
  const { profile, hasProfile } = useProfile();
  const [city, setCity] = useState<City>("London");
  const [causes, setCauses] = useState<Cause[]>([]);
  const [maxMinutes, setMaxMinutes] = useState<number>(240);

  useEffect(() => {
    if (hasProfile) {
      setCity(profile.city);
      setCauses(profile.causes);
      setMaxMinutes(profile.maxMinutes);
    }
  }, [hasProfile, profile]);

  const causeOptions = hasProfile && profile.causes.length ? profile.causes : CAUSES;
  const results = useMemo(
    () => TASKS.filter((t) => t.city === city && t.minutes <= maxMinutes && (causes.length === 0 || causes.includes(t.cause))),
    [city, causes, maxMinutes],
  );
  const toggle = (c: Cause) => setCauses((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">Find a task</h1>
      {hasProfile ? (
        <p className="mt-2 text-muted-foreground">Tailored to your causes and the time you said you can give.</p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          <Link to="/profile" className="text-primary underline underline-offset-4">Set up your profile</Link> to see tasks matched to you.
        </p>
      )}

      <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="w-16 text-sm font-medium text-foreground">City</span>
          <select value={city} onChange={(e) => setCity(e.target.value as City)} className="rounded-full border border-border bg-background px-4 py-1.5 text-sm">
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm font-medium text-foreground">Time</span>
          {TIME_SLOTS.map((s) => (
            <Chip key={s.id} active={maxMinutes === s.max} onClick={() => setMaxMinutes(s.max)}>{s.label}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-sm font-medium text-foreground">Cause</span>
          <Chip active={causes.length === 0} onClick={() => setCauses([])}>All</Chip>
          {causeOptions.map((c) => (
            <Chip key={c} active={causes.includes(c)} onClick={() => toggle(c)}>{c}</Chip>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground">{results.length} task{results.length === 1 ? "" : "s"} found</p>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {results.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
      {results.length === 0 && (
        <div className="mt-4 rounded-2xl bg-secondary p-10 text-center text-muted-foreground">No tasks match yet — try more time or another cause.</div>
      )}
    </div>
  );
}
