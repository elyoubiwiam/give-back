import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Clock, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { causeMeta, formatMinutes, type Task } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export function useJoinTask() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return async (task: Task) => {
    if (!user) {
      toast("Sign in to lend a hand", { description: "It takes 20 seconds." });
      navigate({ to: "/auth" });
      return false;
    }
    const { error } = await supabase.rpc("join_task", { _task_id: task.id });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "You've already joined this one" : error.message);
      return false;
    }
    toast.success(`+${task.points} points!`, { description: `You're in for "${task.title}".` });
    await refresh();
    qc.invalidateQueries({ queryKey: ["city-stats"] });
    return true;
  };
}

export function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const { joined } = useAuth();
  const join = useJoinTask();
  const [pop, setPop] = useState(false);
  const meta = causeMeta(task.cause);
  const Icon = meta.icon;
  const isJoined = joined.has(task.id);
  const spotsPct = Math.max(10, 100 - task.spots * 7);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:rotate-[-0.4deg] hover:shadow-[var(--shadow-soft)] ${compact ? "" : ""}`}
    >
      <div className="h-2 w-full" style={{ background: meta.color }} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: `color-mix(in oklab, ${meta.color} 18%, transparent)`, color: meta.color }}
          >
            <Icon className="h-3.5 w-3.5" /> {task.cause}
          </span>
          <span className="relative flex items-center gap-1 text-sm font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> {task.points} pts
            {pop && <span className="absolute -top-5 right-0 animate-[pointsPop_0.9s_ease-out_forwards] text-sm font-bold text-primary">+{task.points}</span>}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-semibold leading-snug text-foreground">{task.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{task.org}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatMinutes(task.minutes)}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{task.city}</span>
          <span>{task.when_label}</span>
        </div>
        {!compact && (
          <div className="mt-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full transition-all" style={{ width: `${spotsPct}%`, background: meta.color }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{task.spots} spots left</p>
          </div>
        )}
        <div className="mt-auto pt-5">
          <button
            disabled={isJoined}
            onClick={async () => {
              if (await join(task)) {
                setPop(true);
                setTimeout(() => setPop(false), 1000);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-95 active:scale-95 disabled:bg-secondary disabled:text-secondary-foreground"
          >
            {isJoined ? (<><Check className="h-4 w-4" /> Joined</>) : "Lend a hand"}
          </button>
        </div>
      </div>
    </article>
  );
}
