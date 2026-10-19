import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate — GiveBack" },
      { name: "description", content: "No time this week? Support local UK charities with a donation through GiveBack." },
      { property: "og:title", content: "Donate — GiveBack" },
      { property: "og:description", content: "Support local UK charities with a donation." },
    ],
  }),
  component: DonatePage,
});

const CHARITIES = ["Hackney Food Bank", "Mustard Tree", "Age Together", "Bristol Green", "Streetwise Edinburgh", "Where it's needed most"];
const AMOUNTS = [5, 10, 25, 50];

function DonatePage() {
  const [amount, setAmount] = useState(10);
  const [charity, setCharity] = useState(CHARITIES[5]);
  const [monthly, setMonthly] = useState(false);
  const [tip, setTip] = useState(false);
  const [tipAmount, setTipAmount] = useState(2);

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-bold text-4xl text-foreground md:text-5xl">No time? Give a little.</h1>
      <p className="mt-2 text-muted-foreground">100% goes to the charity you pick.</p>

      <div className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium text-foreground">Support</label>
          <select value={charity} onChange={(e) => setCharity(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3">
            {CHARITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <span className="text-sm font-medium text-foreground">Amount</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={`rounded-xl border py-3 text-lg ${amount === a ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>£{a}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 text-sm text-foreground">
          <input type="checkbox" checked={monthly} onChange={(e) => setMonthly(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
          Make it monthly
        </label>
        <div className={`rounded-2xl border-2 p-4 transition ${tip ? "border-primary bg-primary/10" : "border-dashed border-border"}`}>
          <label className="flex cursor-pointer items-start gap-3 text-sm">
            <input type="checkbox" checked={tip} onChange={(e) => setTip(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--primary)]" />
            <span>
              <span className="font-medium text-foreground">Add a little for GiveBack to keep the service rolling</span>
              <span className="block text-muted-foreground">Optional — GiveBack is free to use.</span>
            </span>
          </label>
          {tip && (
            <div className="mt-3 flex gap-2 pl-7">
              {[1, 2, 5].map((t) => (
                <button key={t} onClick={() => setTipAmount(t)} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tipAmount === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>£{t}</button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => toast("Donations open soon", { description: "Secure card payments are being set up." })}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-medium text-primary-foreground hover:opacity-90"
        >
          <Lock className="h-4 w-4" /> Donate £{amount}{tip ? ` + £${tipAmount} to GiveBack` : ""}{monthly ? "/month" : ""}
        </button>
        <p className="text-center text-xs text-muted-foreground">Secure checkout powered by Stripe — coming soon.</p>
      </div>
    </div>
  );
}
