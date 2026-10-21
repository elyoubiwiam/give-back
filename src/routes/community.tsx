import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { RECENT_ACTIONS, causeMeta } from "@/lib/data";
import { cityStatsQuery, tasksQuery } from "@/lib/queries";
import { CountUp, Reveal } from "@/lib/motion";
import { JoinCTA } from "@/components/JoinCTA";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "City ranking | GiveBack" },
      { name: "description", content: "See which UK cities are giving back the most, with the latest good deeds from each community." },
      { property: "og:title", content: "City ranking | GiveBack" },
      { property: "og:description", content: "How UK cities are giving back this month." },
    ],
  }),
  component: CommunityPage,
});

const METRICS = [
  { id: "hours", label: "Hours given" },
  { id: "actions", label: "Good deeds" },
  { id: "volunteers", label: "Neighbours" },
] as const;
type Metric = (typeof METRICS)[number]["id"];
const PODIUM_COLORS = ["var(--mustard)", "var(--teal)", "var(--coral)"];

function CommunityPage() {
  const { data: stats = [] } = useQuery(cityStatsQuery);
  const { data: tasks = [] } = useQuery(tasksQuery);
  const [metric, setMetric] = useState<Metric>("hours");
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const PAGE = 5;
  const pages = Math.max(1, Math.ceil(RECENT_ACTIONS.length / PAGE));
  const visible = RECENT_ACTIONS.slice(page * PAGE, page * PAGE + PAGE);
  const go = (d: "next" | "prev") => {
    setDir(d);
    setPage((p) => Math.min(pages - 1, Math.max(0, p + (d === "next" ? 1 : -1))));
  };
  const sorted = useMemo(() => [...stats].sort((a, b) => b[metric] - a[metric]), [stats, metric]);
  const max = sorted[0]?.[metric] ?? 1;
  const podium = [sorted[1], sorted[0], sorted[2]];

  const topCauses = (city: string) => {
    const counts: Record<string, number> = {};
    tasks.filter((t) => t.city === city).forEach((t) => (counts[t.cause] = (counts[t.cause] ?? 0) + 1));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c]) => c);
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">How cities are giving back</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">No leaderboards of people. Just communities showing up for each other this month.</p>

      <div className="mt-6 inline-flex rounded-full bg-secondary p-1">
        {METRICS.map((m) => (
          <button key={m.id} onClick={() => setMetric(m.id)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${metric === m.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{m.label}</button>
        ))}
      </div>

      {sorted.length >= 3 && (
        <div className="mt-10 grid grid-cols-3 items-end gap-3 md:gap-6">
          {podium.map((c, i) => {
            if (!c) return null;
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const h = rank === 1 ? "h-52" : rank === 2 ? "h-40" : "h-32";
            return (
              <Reveal key={c.city} delay={rank * 120}>
                <div className="text-center">
                  {rank === 1 && <Crown className="mx-auto mb-2 h-7 w-7 animate-bounce text-mustard" />}
                  <p className="text-lg font-bold text-foreground md:text-2xl">{c.city}</p>
                  <p className="text-sm text-muted-foreground"><CountUp value={c[metric]} /></p>
                  <div className={`mt-3 ${h} grid place-items-center rounded-t-3xl text-4xl font-bold text-primary-foreground transition-all`} style={{ background: PODIUM_COLORS[rank - 1] }}>
                    {rank}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {sorted.map((s, i) => (
            <Reveal key={s.city} delay={i * 60}>
              <div className="rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-lg font-semibold text-foreground"><span className="mr-3 text-muted-foreground">#{i + 1}</span>{s.city}</h2>
                  <span className="text-lg font-bold text-primary">{s[metric].toLocaleString()}</span>
                </div>
                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${(s[metric] / max) * 100}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topCauses(s.city).map((c) => {
                    const m = causeMeta(c);
                    return <span key={c} className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `color-mix(in oklab, ${m.color} 18%, transparent)`, color: m.color }}>{c}</span>;
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-foreground">Latest actions</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">{page + 1} / {pages}</span>
              <button onClick={() => go("prev")} disabled={page === 0} aria-label="Previous actions" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition hover:-translate-y-0.5 hover:bg-secondary disabled:pointer-events-none disabled:opacity-35">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => go("next")} disabled={page === pages - 1} aria-label="Next actions" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition hover:-translate-y-0.5 hover:bg-secondary disabled:pointer-events-none disabled:opacity-35">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <ul key={page} className={`mt-4 space-y-3 ${dir === "next" ? "animate-[slideIn_.35s_ease]" : "animate-[slideInBack_.35s_ease]"}`}>
            {visible.map((a) => {
              const m = causeMeta(a.cause);
              return (
                <li key={`${a.name}-${a.action}`} className="flex gap-3 rounded-2xl bg-card p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: m.color }} />
                  <div>
                    <p className="text-foreground"><strong>{a.name}</strong> {a.action}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.city} · {a.ago}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="mt-12"><JoinCTA compact title="Help your city climb the ranking. Join free" /></div>
    </div>
  );
}
