import { createFileRoute } from "@tanstack/react-router";
import { CITY_STATS, RECENT_ACTIONS } from "@/lib/data";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community impact by city — GiveBack" },
      { name: "description", content: "See how people across UK cities are giving back to their communities, with the latest good deeds." },
      { property: "og:title", content: "Community impact by city — GiveBack" },
      { property: "og:description", content: "How UK cities are giving back this month." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const sorted = [...CITY_STATS].sort((a, b) => b.hours - a.hours);
  const max = sorted[0]?.hours ?? 1;
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">How cities are giving back</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">No leaderboards of people — just neighbourhoods showing up for each other. Hours given this month.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <ol className="space-y-4">
          {sorted.map((s, i) => (
            <li key={s.city} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl text-foreground"><span className="mr-3 text-muted-foreground">{i + 1}</span>{s.city}</h2>
                <span className="font-display text-xl text-primary">{s.hours.toLocaleString()} h</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(s.hours / max) * 100}%` }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{s.actions.toLocaleString()} good deeds · {s.volunteers.toLocaleString()} neighbours</p>
            </li>
          ))}
        </ol>
        <div>
          <h2 className="font-display text-2xl text-foreground">Latest actions</h2>
          <ul className="mt-4 space-y-3">
            {RECENT_ACTIONS.map((a, i) => (
              <li key={i} className="rounded-2xl bg-secondary/70 p-4 text-sm">
                <p className="text-foreground"><strong>{a.name}</strong> {a.action}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.city} · {a.ago}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
