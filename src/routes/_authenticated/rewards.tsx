import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { LEVELS, REWARDS, levelFor } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { CountUp, Reveal } from "@/lib/motion";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — GiveBack" },
      { name: "description", content: "Turn your volunteering points into discounts at partner cafés, shops and events." },
      { property: "og:title", content: "Rewards — GiveBack" },
      { property: "og:description", content: "Points for good deeds, treats from local partners." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const { profile } = useAuth();
  const pts = profile?.points ?? 0;
  const { current, next } = levelFor(pts);
  const pct = next ? ((pts - current.min) / (next.min - current.min)) * 100 : 100;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">Rewards</h1>
      <div className="relative mt-8 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mustard/60" />
        <div className="absolute -bottom-16 right-32 h-40 w-40 rounded-full bg-coral/60" />
        <div className="relative">
          <p className="text-sm opacity-80">Your points</p>
          <p className="text-6xl font-bold"><CountUp value={pts} /></p>
          <p className="mt-2 text-sm">Level: <strong>{current.name}</strong>{next && ` · ${next.min - pts} pts to ${next.name}`}</p>
          <div className="mt-4 h-2.5 max-w-lg overflow-hidden rounded-full bg-primary-foreground/25">
            <div className="h-full rounded-full bg-primary-foreground transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {LEVELS.map((l) => (
              <span key={l.name} className={`rounded-full px-3 py-1 ${pts >= l.min ? "bg-primary-foreground text-primary" : "bg-primary-foreground/15"}`}>{l.name} · {l.min}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((r, i) => (
          <Reveal key={r.id} delay={i * 70}>
            <div className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-all hover:-translate-y-1.5 hover:shadow-[var(--shadow-soft)]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground transition-transform group-hover:rotate-12" style={{ background: r.color }}>
                <Gift className="h-5 w-5" />
              </span>
              <span className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">{r.kind} · {r.partner}</span>
              <h3 className="mt-1 text-xl font-semibold text-foreground">{r.offer}</h3>
              <div className="mt-auto flex items-center justify-between pt-6">
                <span className="font-semibold text-primary">{r.cost} pts</span>
                <button
                  disabled={pts < r.cost}
                  onClick={() => toast("Vouchers launch soon", { description: "We're finalising partner codes." })}
                  className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition active:scale-95 disabled:opacity-30"
                >
                  Redeem
                </button>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
