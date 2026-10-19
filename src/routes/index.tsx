import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CITIES, CITY_STATS, RECENT_ACTIONS, TASKS, type City } from "@/lib/data";
import { TaskCard } from "@/components/TaskCard";

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
  const [city, setCity] = useState<City>("London");
  const stats = CITY_STATS.find((s) => s.city === city)!;
  const tasks = TASKS.filter((t) => t.city === city).slice(0, 3);
  const actions = RECENT_ACTIONS.filter((a) => a.city === city);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:pt-24">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">Micro-volunteering across the UK</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
          An hour of your time.<br />
          <em className="text-primary">A whole lot of good.</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Local charities need extra hands for small jobs. Pick a task that fits your day, earn points, and treat yourself at partner cafés and shops.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <label className="text-sm text-muted-foreground" htmlFor="city">I'm in</label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value as City)}
            className="rounded-full border border-border bg-card px-4 py-2.5 font-medium text-foreground"
          >
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Link to="/tasks" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90">
            Find a task <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="bg-secondary/60 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-3xl text-foreground">{city} is giving back</h2>
            <p className="mt-2 text-muted-foreground">This month, together.</p>
            <dl className="mt-8 grid grid-cols-3 gap-4">
              {[
                ["Hours given", stats.hours.toLocaleString()],
                ["Good deeds", stats.actions.toLocaleString()],
                ["Neighbours", stats.volunteers.toLocaleString()],
              ].map(([k, v]) => (
                <div key={k}>
                  <dd className="font-display text-3xl text-primary">{v}</dd>
                  <dt className="mt-1 text-xs text-muted-foreground">{k}</dt>
                </div>
              ))}
            </dl>
            <Link to="/community" className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-foreground underline underline-offset-4">
              See all cities <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="space-y-3">
            {actions.map((a, i) => (
              <li key={i} className="flex items-center gap-4 rounded-2xl bg-card p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent font-display text-accent-foreground">{a.name[0]}</span>
                <p className="flex-1 text-sm text-foreground"><strong>{a.name}</strong> {a.action}</p>
                <span className="text-xs text-muted-foreground">{a.ago}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-foreground">Hands needed in {city}</h2>
          <Link to="/tasks" className="text-sm font-medium text-primary">View all</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {tasks.length ? tasks.map((t) => <TaskCard key={t.id} task={t} />) : <p className="text-muted-foreground">New tasks coming soon.</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 rounded-3xl bg-foreground p-10 text-background md:grid-cols-3">
          {[
            ["1. Pick a task", "Filtered by the causes you love and the time you have."],
            ["2. Show up & help", "Most tasks take under two hours. No commitment beyond that."],
            ["3. Earn & enjoy", "Points unlock treats from local partners. Level up as you go."],
          ].map(([t, d]) => (
            <div key={t}>
              <h3 className="font-display text-xl">{t}</h3>
              <p className="mt-2 text-sm opacity-70">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
