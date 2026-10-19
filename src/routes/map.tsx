import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CAUSES, causeMeta, type City } from "@/lib/data";
import { tasksQuery } from "@/lib/queries";
import { UKMap } from "@/components/UKMap";
import { TaskCard } from "@/components/TaskCard";
import { JoinCTA } from "@/components/JoinCTA";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map of volunteering events — GiveBack" },
      { name: "description", content: "See micro-volunteering tasks happening across UK cities on one map." },
      { property: "og:title", content: "Map of volunteering events — GiveBack" },
      { property: "og:description", content: "Every task across the UK, on one map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { data: tasks = [] } = useQuery(tasksQuery);
  const [city, setCity] = useState<City>("London");
  const [cause, setCause] = useState<string | null>(null);
  const shown = tasks.filter((t) => t.city === city && (!cause || t.cause === cause));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">What's happening across the UK</h1>
      <p className="mt-2 text-muted-foreground">Tap a city to see where hands are needed.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
        <UKMap tasks={tasks} selected={city} onSelect={setCity} className="lg:sticky lg:top-24 lg:self-start" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{city}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={() => setCause(null)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${!cause ? "border-foreground" : "border-border"}`}>All causes</button>
            {CAUSES.map((c) => {
              const m = causeMeta(c);
              return (
                <button key={c} onClick={() => setCause(c)} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium" style={{ borderColor: cause === c ? m.color : "var(--border)" }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} /> {c}
                </button>
              );
            })}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {shown.map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
          {shown.length === 0 && <div className="mt-5 rounded-3xl bg-secondary p-8 text-center text-muted-foreground">No tasks here for this cause yet.</div>}
        </div>
      </div>
      <div className="mt-12"><JoinCTA compact /></div>
    </div>
  );
}
