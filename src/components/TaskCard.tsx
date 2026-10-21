import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookedCountsQuery, strikesQuery } from "@/lib/queries";
import { CalendarDays, CalendarPlus, Check, Clock, MapPin, Sparkles } from "lucide-react";
import { downloadIcs, googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";
import { toast } from "sonner";
import { causeMeta, formatMinutes, formatTaskWhen, rewardEquivalent, type Task } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { notifyTaskJoined } from "@/lib/notify.functions";
import { Button } from "@/components/ui/button";
import { MAX_STRIKES, RELIANCE_NOTE, isValidCancelReason, strikesLeft } from "@/lib/cancel-policy";
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
    if (joined.size === 0) toast.success("You've unlocked 1 free reward 🎁", { description: "Your first action earns a welcome gift. Choose a reward worth 150 points or less in Rewards." });
    await refresh();
    qc.invalidateQueries({ queryKey: ["city-stats"] });
    qc.invalidateQueries({ queryKey: ["booked-counts"] });
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
  const [reason, setReason] = useState("");
  const { user } = useAuth();
  const { data: strikes = 0 } = useQuery({ ...strikesQuery, enabled: !!user && cancelOpen });
  const { refresh } = useAuth();
  const qc = useQueryClient();
  const meta = causeMeta(task.cause);
  const Icon = meta.icon;
  const isJoined = joined.has(task.id);
  const { data: counts } = useQuery(bookedCountsQuery);
  const booked = counts?.get(task.id) ?? 0;
  const spotsLeft = Math.max(0, task.spots - booked);
  const full = spotsLeft === 0 && !isJoined;
  const spotsPct = task.spots ? Math.max(6, Math.round((booked / task.spots) * 100)) : 100;

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
        <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          {task.charities?.logo_url && <img src={task.charities.logo_url} alt="" className="h-5 w-5 rounded-full object-cover" />}
          {task.org}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatMinutes(task.minutes)}</span>
          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{task.city}</span>
          <span className="flex items-center gap-1 font-medium text-foreground"><CalendarDays className="h-3.5 w-3.5" />{formatTaskWhen(task)}</span>
        </div>
        <div className="mt-3 rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
          <span className="font-semibold text-primary">Earn {task.points} pts</span> · {rewardEquivalent(task.points)}
        </div>
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all" style={{ width: `${spotsPct}%`, background: meta.color }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{spotsLeft} of {task.spots} spots left</p>
        </div>
        {!compact && <TaskDetails task={task} />}
        <div className="mt-auto pt-5">
          <Button
            disabled={isJoined || joining || full}
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
            {isJoined ? (<><Check className="h-4 w-4" /> Joined</>) : full ? "Fully booked" : joining ? "Booking…" : "Lend a hand"}
          </Button>
          {!isJoined && !full && <p className="mt-2 text-center text-xs text-muted-foreground">People are counting on you. If plans change, cancel and tell us why.</p>}
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
          <DetailList task={task} />
          <p className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" />+{task.points} points</p>
        </div>
        <p className="rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">{RELIANCE_NOTE}</p>
        <CalendarLinks task={task} />
        <Button onClick={() => setConfirmationOpen(false)} className="mt-2">Done</Button>
      </DialogContent>
    </Dialog>
    <Dialog open={cancelOpen} onOpenChange={(open) => { if (!cancelling) setCancelOpen(open); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg bg-card duration-300 motion-reduce:animate-none">
        <DialogHeader>
          <DialogTitle className="pr-6 text-xl leading-snug">Cancel this task?</DialogTitle>
          <DialogDescription>{task.title} · {formatTaskWhen(task)}. It's okay if something came up. Just tell {task.org} why, so they can plan.</DialogDescription>
        </DialogHeader>
        <label className="block text-sm font-medium text-foreground">Reason
          <textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. I'm unwell and can't make it"
            className="mt-1 block w-full min-w-0 resize-y rounded-2xl border border-border bg-background px-4 py-2.5 text-base outline-none focus:border-primary" />
        </label>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>The charity reviews your reason. A rejected reason is a strike.</li>
          <li>You have {strikesLeft(strikes)} of {MAX_STRIKES} strikes left.</li>
          <li>The {task.points} points from this booking are removed. Remove it from your calendar too.</li>
        </ul>
        {strikes >= MAX_STRIKES && <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">You've reached {MAX_STRIKES} strikes. Please only book tasks you're sure you can make.</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" disabled={cancelling} onClick={() => setCancelOpen(false)}>Keep booking</Button>
          <Button disabled={cancelling || !isValidCancelReason(reason)} onClick={async () => {
            setCancelling(true);
            try {
              const { error } = await supabase.rpc("cancel_task", { _task_id: task.id, _reason: reason.trim() });
              if (error) { toast.error(error.message); return; }
              await refresh();
              await qc.invalidateQueries({ queryKey: ["city-stats"] });
              await qc.invalidateQueries({ queryKey: ["booked-counts"] });
              setCancelOpen(false);
              setReason("");
              toast.success("Task cancelled", { description: "Thanks for letting us know. The charity will review your reason." });
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

function detailRows(task: Task) {
  return [
    ["What it involves", task.description],
    ["What to bring", task.what_to_bring],
    ["Where to meet", task.meeting_point],
    ["Good for", task.suitable_for],
    ["Contact on the day", task.day_contact],
  ].filter(([, v]) => v && v.trim()) as [string, string][];
}

function DetailList({ task }: { task: Task }) {
  const rows = detailRows(task);
  if (!rows.length) return null;
  return (
    <dl className="space-y-2">
      {rows.map(([k, v]) => (
        <div key={k}><dt className="text-xs font-semibold text-muted-foreground">{k}</dt><dd className="whitespace-pre-line break-words">{v}</dd></div>
      ))}
    </dl>
  );
}

function TaskDetails({ task }: { task: Task }) {
  if (!detailRows(task).length) return null;
  return (
    <details className="mt-3 rounded-2xl border border-border px-3 py-2 text-sm text-foreground">
      <summary className="cursor-pointer text-xs font-semibold text-primary">More details</summary>
      <div className="mt-2"><DetailList task={task} /></div>
    </details>
  );
}
