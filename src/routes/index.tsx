import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CITIES, RECENT_ACTIONS, causeMeta, type City } from "@/lib/data";
import { cityStatsQuery, tasksQuery } from "@/lib/queries";
import { TaskCard } from "@/components/TaskCard";
import { UKMap } from "@/components/UKMap";
import { JoinCTA } from "@/components/JoinCTA";
import { CountUp, Reveal } from "@/lib/motion";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GiveBack — Small tasks, big kindness" },
      { name: "description", content: "Lend a hand to local UK charities with quick micro-volunteering tasks, earn points and unlock rewards." },
      { property: "og:title", content: "GiveBack — Small tasks, big kindness" },
      { property: "og:description", content: "Quick volunteering tasks for local UK charities. Earn points, unlock local rewards." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, profile } = useAuth();
  const [city, setCity] = useState<City>("London");
  useEffect(() => {
    if (profile?.city) setCity(profile.city as City);
  }, [profile?.city]);
  const { data: tasks = [] } = useQuery(tasksQuery);
  const { data: stats = [] } = useQuery(cityStatsQuery);
  const s = stats.find((x) => x.city === city);
  const cityTasks = tasks.filter((t) => t.city === city);
  const actions = RECENT_ACTIONS.filter((a) => a.city === city);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 animate-[float_8s_ease-in-out_infinite] rounded-full bg-mustard/40 blur-2xl" />
        <div className="pointer-events-none absolute right-40 top-64 h-56 w-56 animate-[float_9s_ease-in-out_infinite_1s] rounded-full bg-teal/30 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-sage/20 px-3 py-1 text-sm font-medium text-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-sage" /> Micro-volunteering across the UK
          </p>
          <h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            An hour of your time. <span className="text-primary">A whole lot of good.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Local charities need extra hands for small jobs. Pick a task that fits your day, earn points, and treat yourself at partner cafés and shops.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {CITIES.map((c) => (
              <button key={c} onClick={() => setCity(c)} className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${city === c ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-secondary"}`}>{c}</button>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {!user && (
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition hover:scale-105">
                Create your free account <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link to="/tasks" className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-medium transition hover:scale-105 ${user ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"}`}>
              Find a task {user && <ArrowRight className="h-4 w-4" />}
            </Link>
          </div>
          {!user && <p className="mt-3 text-sm text-muted-foreground">Free account = tasks tailored to the causes you care about.</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { k: "Hours given", v: s?.hours ?? 0, c: "var(--mustard)" },
            { k: "Good deeds", v: s?.actions ?? 0, c: "var(--teal)" },
            { k: "Neighbours helping", v: s?.volunteers ?? 0, c: "var(--coral)" },
          ].map((x, i) => (
            <Reveal key={x.k} delay={i * 100}>
              <div className="rounded-3xl p-6 transition-transform hover:-translate-y-1" style={{ background: `color-mix(in oklab, ${x.c} 22%, var(--card))` }}>
                <p className="text-4xl font-bold text-foreground"><CountUp value={x.v} /></p>
                <p className="mt-1 text-sm text-muted-foreground">{x.k} in {city} this month</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 lg:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-foreground">Tap a city</h2>
            <Link to="/map" className="text-sm font-medium text-primary">Full map →</Link>
          </div>
          <div className="mt-4">
            <UKMap tasks={tasks} selected={city} onSelect={setCity} className="mx-auto max-w-sm" />
          </div>
        </Reveal>
        <Reveal delay={150}>
          <h2 className="text-2xl font-bold text-foreground">Latest good deeds</h2>
          <ul className="mt-4 space-y-3">
            {actions.map((a, i) => {
              const m = causeMeta(a.cause);
              return (
                <li key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4 transition hover:translate-x-1">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold text-primary-foreground" style={{ background: m.color }}>{a.name[0]}</span>
                  <p className="flex-1 text-sm text-foreground"><strong>{a.name}</strong> {a.action}</p>
                  <span className="text-xs text-muted-foreground">{a.ago}</span>
                </li>
              );
            })}
          </ul>
          <Link to="/community" className="mt-4 inline-flex text-sm font-medium text-primary">See the city ranking →</Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground">Hands needed in {city}</h2>
          <Link to="/tasks" className="text-sm font-medium text-primary">View all</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {cityTasks.slice(0, 3).map((t, i) => (
            <Reveal key={t.id} delay={i * 100}><TaskCard task={t} /></Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-10">
        <JoinCTA />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Pick a task", "Filtered by the causes you love and the time you have.", "var(--teal)"],
            ["Show up & help", "Most tasks take under two hours. No commitment beyond that.", "var(--plum)"],
            ["Earn & enjoy", "Points unlock treats from local partners. Level up as you go.", "var(--primary)"],
          ].map(([t, d, c], i) => (
            <Reveal key={t} delay={i * 100}>
              <div className="h-full rounded-3xl p-7 text-primary-foreground transition-transform hover:-rotate-1 hover:scale-[1.02]" style={{ background: c }}>
                <span className="text-sm font-semibold opacity-80">0{i + 1}</span>
                <h3 className="mt-2 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm opacity-85">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
