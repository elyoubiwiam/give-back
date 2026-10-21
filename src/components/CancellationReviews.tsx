import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function CancellationReviews() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["charity-cancellations"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("charity_cancellations");
      if (error) throw error;
      return data;
    },
  });
  const pending = data.filter((c) => c.status === "pending");
  const reviewed = data.filter((c) => c.status !== "pending").slice(0, 5);

  const review = async (id: string, approve: boolean) => {
    setBusy(id);
    const { error } = await supabase.rpc("review_cancellation", { _id: id, _approve: approve });
    setBusy(null);
    if (error) return void toast.error(error.message);
    toast.success(approve ? "Reason approved" : "Reason rejected. The volunteer gets a strike.");
    qc.invalidateQueries({ queryKey: ["charity-cancellations"] });
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">Cancellations to review ({pending.length})</h2>
      <p className="mt-1 text-sm text-muted-foreground">Approve fair reasons. Rejecting one gives the volunteer a strike (3 strikes and they get a warning).</p>
      <div className="mt-4 space-y-3">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">Nothing to review.</p>}
        {pending.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border p-4">
            <p className="text-sm font-medium text-foreground">{c.volunteer_name || "A volunteer"} · {c.task_title}</p>
            <p className="mt-1 whitespace-pre-line break-words text-sm text-foreground">"{c.reason}"</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="rounded-full" disabled={busy === c.id} onClick={() => review(c.id, true)}>Approve</Button>
              <Button size="sm" variant="outline" className="rounded-full" disabled={busy === c.id} onClick={() => review(c.id, false)}>Reject</Button>
            </div>
          </div>
        ))}
        {reviewed.length > 0 && (
          <ul className="space-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            {reviewed.map((c) => <li key={c.id} className="break-words">{c.volunteer_name || "A volunteer"} · {c.task_title} · {c.status === "approved" ? "Approved" : "Rejected"}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
