import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CAUSES, CITIES, CITY_CENTERS, causeMeta, type City } from "@/lib/data";
import { tasksQuery } from "@/lib/queries";
import { LazyMap } from "@/components/LazyMap";
import { useJoinTask } from "@/components/TaskCard";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map of volunteering events — GiveBack" },
      { name: "description", content: "See micro-volunteering tasks happening near you on a map of UK cities." },
      { property: "og:title", content: "Map of volunteering events — GiveBack" },
      { property: "og:description", content: "Every task near you, on one map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { data: tasks = [] } = useQuery(tasksQuery);
  const [city, setCity] = useState<City>("London");
  const [cause, setCause] = useState<string | null>(null);
  const join = useJoinTask();
  const shown = tasks.filter((t) => t.city === city && (!cause || t.cause === cause));

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">What's happening near you</h1>
      <p className="mt-2 text-muted-foreground">Tap a pin to see the task and lend a hand.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {CITIES.map((c) => (
          <button key={c} onClick={() => setCity(c)} className={`rounded-full px-4 py-2 text-sm font-medium transition active:scale-95 ${city === c ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-accent"}`}>{c}</button>
        ))}
      </div>
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
      <div className="mt-6">
        <LazyMap tasks={shown} center={CITY_CENTERS[city]} zoom={12} height={560} onJoin={(t) => void join(t)} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{shown.length} tasks in {city}</p>
    </div>
  );
}
