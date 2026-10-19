import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays, CalendarPlus, Check, Clock, MapPin, Sparkles } from "lucide-react";
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";
import { toast } from "sonner";
import { causeMeta, formatMinutes, formatTaskWhen, rewardEquivalent, type Task } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { notifyTaskJoined } from "@/lib/notify.functions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function useJoinTask() {
  const { user, refresh, joined } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  return async (task: Task) => {
    if (!user) {
      navigate({ to: "/auth", search: { mode: undefined, note: "Create a free account to join this task and earn points." } });
      return false;
    }
    const { error } = await supabase.rpc("join_task", { _task_id: task.id });
    if (error) {
      toast.error(error.message.includes("duplicate") ? "You've already joined this one" : error.message);
      return false;
    }
    notifyTaskJoined({ data: { taskId: task.id } }).catch((e) => console.error(e));
    if (joined.size === 0) toast.success("You've unlocked 1 free reward 🎁", { description: "Your first action earns a welcome gift — choose a reward worth 150 points or less in Rewards." });
    await refresh();
    qc.invalidateQueries({ queryKey: ["city-stats"] });
    return true;
  };
}

export function TaskCard({ task, compact = false }: { task: Task; compact?: boolean }) {
  const { joined } = useAuth();
  const join = useJoinTask();
  const [pop, setPop] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { refresh } = useAuth();
  const qc = useQueryClient();
  const meta = causeMeta(task.cause);
  const Icon = meta.icon;
  const isJoined = joined.has(task.id);
  const spotsPct = Math.max(10, 100 - task.spots * 7);

  return (
    <>
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
          <span className="flex items-center gap-1 font-medium text-foreground"><CalendarDays className="h-3.5 w-3.5" />{formatTaskWhen(task)}</span>
        </div>
        <div className="mt-3 rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
          <span className="font-semibold text-primary">Earn {task.points} pts</span> · {rewardEquivalent(task.points)}
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
          <Button
            disabled={isJoined || joining}
            onClick={async () => {
              setJoining(true);
              try {
                if (await join(task)) {
                  setConfirmationOpen(true);
                  setPop(true);
                  setTimeout(() => setPop(false), 1000);
                }
              } finally {
                setJoining(false);
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:opacity-95 active:scale-95 disabled:bg-secondary disabled:text-secondary-foreground"
          >
            {isJoined ? (<><Check className="h-4 w-4" /> Joined</>) : joining ? "Booking…" : "Lend a hand"}
          </Button>
          {isJoined && <><CalendarLinks task={task} /><Button variant="ghost" className="mt-2 w-full text-muted-foreground" onClick={() => setCancelOpen(true)}>Cancel task</Button></>}
        </div>
      </div>
    </article>
    <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg bg-card duration-300 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100 motion-reduce:animate-none">
        <DialogHeader>
          <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary"><Check className="h-5 w-5" /> Booking confirmed</span>
          <DialogTitle className="pr-6 text-2xl leading-snug">{task.title}</DialogTitle>
          <DialogDescription>{task.org} · {task.cause}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 border-y border-border py-4 text-sm text-foreground">
          <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{formatTaskWhen(task)} · UK time</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{task.org}, {task.city}</p>
          <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{formatMinutes(task.minutes)}</p>
          <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" />+{task.points} points</p>
        </div>
        <CalendarLinks task={task} />
        <Button onClick={() => setConfirmationOpen(false)} className="mt-2">Done</Button>
      </DialogContent>
    </Dialog>
    <Dialog open={cancelOpen} onOpenChange={(open) => { if (!cancelling) setCancelOpen(open); }}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-lg bg-card duration-300 motion-reduce:animate-none">
        <DialogHeader>
          <DialogTitle className="pr-6 text-xl leading-snug">Cancel this task?</DialogTitle>
          <DialogDescription>{task.title} · {formatTaskWhen(task)}. Cancelling removes the {task.points} points from this booking. If you added it to your calendar, remove it there too.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" disabled={cancelling} onClick={() => setCancelOpen(false)}>Keep booking</Button>
          <Button disabled={cancelling} onClick={async () => {
            setCancelling(true);
            try {
              const { error } = await supabase.rpc("cancel_task", { _task_id: task.id });
              if (error) { toast.error(error.message); return; }
              await refresh();
              await qc.invalidateQueries({ queryKey: ["city-stats"] });
              setCancelOpen(false);
              toast.success("Task cancelled");
            } finally { setCancelling(false); }
          }}>{cancelling ? "Cancelling…" : "Cancel booking"}</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

function CalendarLinks({ task }: { task: Task }) {
  const cls = "rounded-full border border-border px-3 py-1 hover:border-primary hover:text-primary";
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
      <CalendarPlus className="h-3.5 w-3.5" /> Add to:
      <a className={cls} href={googleCalendarUrl(task)} target="_blank" rel="noreferrer">Google</a>
      <a className={cls} href={outlookCalendarUrl(task)} target="_blank" rel="noreferrer">Outlook</a>
      <Button variant="outline" size="sm" className={cls} onClick={() => downloadIcs(task)}>Apple / other</Button>
    </div>
  );
}
