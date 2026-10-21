import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CAUSES, CITIES, CITY_CENTERS, causeMeta, formatMinutes, formatTaskWhen, type City } from "@/lib/data";
import { TASK_DURATIONS, isValidTaskMinutes, taskPhase } from "@/lib/charity-stats";
import { myCharityQuery, myCharityTasksQuery } from "@/lib/charity";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/charity/tasks")({
  head: () => ({
    meta: [
      { title: "Your tasks — GiveBack for charities" },
      { name: "description", content: "Post volunteering tasks, set how many helpers you need and how long it takes." },
      { property: "og:title", content: "Your tasks — GiveBack for charities" },
      { property: "og:description", content: "Post and manage volunteering tasks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CharityTasks,
});

/** Convert a UK wall-clock date + time to a UTC ISO string. */
function londonToIso(date: string, time: string) {
  const guess = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).format(guess);
  const offsetH = Number(parts) - guess.getUTCHours();
  return new Date(guess.getTime() - (((offsetH + 24) % 24) > 12 ? offsetH : offsetH) * 36e5).toISOString();
}
function isoToLondon(iso: string | null) {
  if (!iso) return { date: "", time: "10:00" };
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return { date, time };
}

type Form = { id?: string; title: string; description: string; cause: string; city: string; date: string; time: string; spots: number; minutes: number };
const empty = (city: string): Form => ({ title: "", description: "", cause: CAUSES[0], city, date: "", time: "10:00", spots: 5, minutes: 60 });

function CharityTasks() {
  const qc = useQueryClient();
  const { data: charity } = useQuery(myCharityQuery);
  const { data: tasks = [] } = useQuery({ ...myCharityTasksQuery(charity?.id ?? ""), enabled: !!charity });
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  if (!charity) return <p className="text-muted-foreground">Loading…</p>;
  const f = form ?? empty(charity.city);
  const set = (p: Partial<Form>) => setForm({ ...f, ...p });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidTaskMinutes(f.minutes)) return toast.error("Tasks can last up to half a day (4 hours).");
    if (!f.date) return toast.error("Pick a date");
    const starts_at = londonToIso(f.date, f.time);
    if (!f.id && new Date(starts_at) < new Date()) return toast.error("Pick a date in the future");
    setSaving(true);
    const [lat, lng] = CITY_CENTERS[f.city as City] ?? CITY_CENTERS.London;
    const row = {
      title: f.title.trim().slice(0, 120), description: f.description.trim().slice(0, 1000), cause: f.cause, city: f.city,
      minutes: f.minutes, points: f.minutes, spots: f.spots, starts_at, charity_id: charity.id, org: charity.name,
      when_label: formatTaskWhen({ starts_at, when_label: "" }),
      lat: lat + (Math.random() - 0.5) * 0.04, lng: lng + (Math.random() - 0.5) * 0.06,
    };
    const { error } = f.id ? await supabase.from("tasks").update(row).eq("id", f.id) : await supabase.from("tasks").insert(row);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(f.id ? "Task updated" : "Task posted — volunteers can book it now");
    setForm(null);
    qc.invalidateQueries({ queryKey: ["charity-tasks"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Cancel this task? Anyone booked will lose it from their list.")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Task removed");
    qc.invalidateQueries({ queryKey: ["charity-tasks"] });
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const input = "w-full rounded-2xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary";
  const slot = TASK_DURATIONS.find((s) => s.options.includes(f.minutes)) ?? TASK_DURATIONS[1]!;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form onSubmit={save} className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold text-foreground">{f.id ? "Edit task" : "Add a task"}</h1>
        <input className={input} placeholder="Task title, e.g. Sort food donations" required value={f.title} onChange={(e) => set({ title: e.target.value })} />
        <textarea className={input} rows={3} placeholder="What will volunteers do? What should they bring?" value={f.description} onChange={(e) => set({ description: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm text-muted-foreground">Cause
            <select className={input} value={f.cause} onChange={(e) => set({ cause: e.target.value })}>{CAUSES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="text-sm text-muted-foreground">City
            <select className={input} value={f.city} onChange={(e) => set({ city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="text-sm text-muted-foreground">Date
            <input type="date" className={input} required value={f.date} onChange={(e) => set({ date: e.target.value })} />
          </label>
          <label className="text-sm text-muted-foreground">Start time (UK)
            <input type="time" className={input} required value={f.time} onChange={(e) => set({ time: e.target.value })} />
          </label>
          <label className="col-span-2 text-sm text-muted-foreground">How many volunteers do you need?
            <input type="number" min={1} max={500} className={input} value={f.spots} onChange={(e) => set({ spots: Math.max(1, Math.min(500, Number(e.target.value) || 1)) })} />
          </label>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">How long will it take? (max half a day)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {TASK_DURATIONS.map((s) => (
              <button type="button" key={s.id} onClick={() => set({ minutes: s.options[s.options.length - 1]! })}
                className={`rounded-full border px-3.5 py-1.5 text-sm ${slot.id === s.id ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{s.label}</button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {slot.options.map((m) => (
              <button type="button" key={m} onClick={() => set({ minutes: m })}
                className={`rounded-full border px-3 py-1 text-xs ${f.minutes === m ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground"}`}>{formatMinutes(m)}</button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Volunteers earn {f.minutes} points (1 per minute).</p>
        </div>
        <div className="flex gap-2">
          <Button disabled={saving} className="rounded-full">{saving ? "Saving…" : f.id ? "Save changes" : "Post task"}</Button>
          {f.id && <Button type="button" variant="outline" className="rounded-full" onClick={() => setForm(null)}>Cancel edit</Button>}
        </div>
      </form>

      <div>
        <h2 className="mb-3 text-xl font-semibold text-foreground">Your tasks ({tasks.length})</h2>
        <div className="space-y-2">
          {tasks.length === 0 && <p className="text-muted-foreground">No tasks yet.</p>}
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-8 w-1.5 rounded-full" style={{ background: causeMeta(t.cause).color }} />
                <div>
                  <p className="font-medium text-foreground">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{formatTaskWhen(t)} · {formatMinutes(t.minutes)} · {t.spots} needed · {taskPhase(t) === "past" ? "Past" : taskPhase(t) === "ongoing" ? "Today" : "Upcoming"}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button title="Edit" onClick={() => { const l = isoToLondon(t.starts_at); setForm({ id: t.id, title: t.title, description: t.description, cause: t.cause, city: t.city, spots: t.spots, minutes: t.minutes, ...l }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
                <button title="Remove" onClick={() => remove(t.id)} className="grid h-8 w-8 place-items-center rounded-full text-destructive hover:bg-secondary"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
