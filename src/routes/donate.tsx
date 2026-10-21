import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { charitiesListQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
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

const AMOUNTS = [5, 10, 25, 50];

function DonatePage() {
  const [amount, setAmount] = useState(10);
  const { data: charities = [] } = useQuery(charitiesListQuery);
  const { user } = useAuth();
  const [charity, setCharity] = useState("");
  useEffect(() => { if (!charity && charities.length) setCharity((charities.find((c) => c.name === "Hackney Food Bank") ?? charities[0]!).id); }, [charities, charity]);
  const [busy, setBusy] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [tip, setTip] = useState(false);
  const [tipAmount, setTipAmount] = useState(2);
  const [customAmount, setCustomAmount] = useState("");
  const [customTip, setCustomTip] = useState("");
  const clean = (v: string) => v.replace(/[^0-9.]/g, "").slice(0, 7);

  return (
    <div className="mx-auto max-w-xl px-5 py-12">
      <h1 className="font-bold text-4xl text-foreground md:text-5xl">No time? Give a little.</h1>
      <p className="mt-2 text-muted-foreground">100% goes to the charity you pick.</p>

      <div className="mt-8 space-y-6 rounded-3xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium text-foreground">Support</label>
          <select value={charity} onChange={(e) => setCharity(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3">
            {charities.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.city}</option>)}
          </select>
        </div>
        <div>
          <span className="text-sm font-medium text-foreground">Amount</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button key={a} onClick={() => { setAmount(a); setCustomAmount(""); }} className={`rounded-xl border py-3 text-lg ${amount === a && !customAmount ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>£{a}</button>
            ))}
          </div>
          <div className={`mt-2 flex items-center rounded-xl border px-4 ${customAmount ? "border-primary" : "border-border"}`}>
            <span className="text-muted-foreground">£</span>
            <input inputMode="decimal" placeholder="Other amount" value={customAmount}
              onChange={(e) => { const v = clean(e.target.value); setCustomAmount(v); if (Number(v) > 0) setAmount(Number(v)); }}
              className="w-full bg-transparent px-2 py-3 outline-none" />
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
            <div className="mt-3 flex flex-wrap gap-2 pl-7">
              {[1, 2, 5].map((t) => (
                <button key={t} onClick={() => { setTipAmount(t); setCustomTip(""); }} className={`rounded-full border px-4 py-1.5 text-sm font-medium ${tipAmount === t && !customTip ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`}>£{t}</button>
              ))}
              <div className={`flex w-28 items-center rounded-full border bg-card px-3 ${customTip ? "border-primary" : "border-border"}`}>
                <span className="text-sm text-muted-foreground">£</span>
                <input inputMode="decimal" placeholder="Other" value={customTip}
                  onChange={(e) => { const v = clean(e.target.value); setCustomTip(v); if (Number(v) > 0) setTipAmount(Number(v)); }}
                  className="w-full bg-transparent px-1 py-1.5 text-sm outline-none" />
              </div>
            </div>
          )}
        </div>
        <button
          disabled={busy || !charity}
          onClick={async () => {
            setBusy(true);
            const { error } = await supabase.from("donations").insert({ charity_id: charity, user_id: user?.id ?? null, amount_pence: Math.round(amount * 100), giveback_pence: tip ? Math.round(tipAmount * 100) : 0, monthly });
            setBusy(false);
            if (error) return toast.error(error.message);
            toast("Thank you — your pledge is saved", { description: "Secure card payments are being set up; we'll let the charity know." });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 font-medium text-primary-foreground hover:opacity-90"
        >
          <Lock className="h-4 w-4" /> Donate £{amount}{tip ? ` + £${tipAmount} to GiveBack` : ""}{monthly ? "/month" : ""}
        </button>
        <p className="text-center text-xs text-muted-foreground">Secure checkout powered by Stripe — coming soon.</p>
      </div>
    </div>
  );
}
