import { Clock, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/lib/data";

export function TaskCard({ task }: { task: Task }) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">{task.cause}</span>
        <span className="flex items-center gap-1 text-sm font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> {task.points} pts
        </span>
      </div>
      <h3 className="mt-4 font-display text-lg leading-snug text-foreground">{task.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{task.org}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{task.minutes < 60 ? `${task.minutes} min` : `${task.minutes / 60} h`}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{task.city}</span>
        <span>{task.when}</span>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{task.spots} spots left</span>
        <button
          onClick={() => toast("Sign-up opens soon", { description: "Accounts are coming shortly — we'll save your spot then." })}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Lend a hand
        </button>
      </div>
    </article>
  );
}
