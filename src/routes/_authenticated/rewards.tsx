import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { LEVELS, REWARDS, levelFor } from "@/lib/data";
import { useProfile } from "@/lib/profile";

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
  const { profile } = useProfile();
  const pts = profile.points;
  const { current, next } = levelFor(pts);
  const pct = next ? ((pts - current.min) / (next.min - current.min)) * 100 : 100;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">Rewards</h1>
      <div className="mt-8 rounded-3xl bg-primary p-8 text-primary-foreground">
        <p className="text-sm opacity-80">Your points (preview)</p>
        <p className="font-display text-6xl">{pts}</p>
        <p className="mt-2 text-sm">Level: <strong>{current.name}</strong>{next && ` · ${next.min - pts} pts to ${next.name}`}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-foreground/25">
          <div className="h-full rounded-full bg-primary-foreground" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {LEVELS.map((l) => (
            <span key={l.name} className={`rounded-full px-3 py-1 ${pts >= l.min ? "bg-primary-foreground text-primary" : "bg-primary-foreground/15"}`}>{l.name} · {l.min}</span>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((r) => (
          <div key={r.id} className="flex flex-col rounded-2xl border border-border bg-card p-5">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">{r.kind}</span>
            <h3 className="mt-2 font-display text-xl text-foreground">{r.offer}</h3>
            <p className="text-sm text-muted-foreground">{r.partner}</p>
            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold text-primary">{r.cost} pts</span>
              <button
                disabled={pts < r.cost}
                onClick={() => toast("Redeeming opens soon", { description: "Partner vouchers go live with accounts." })}
                className="rounded-full bg-foreground px-4 py-2 text-sm text-background disabled:opacity-30"
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
