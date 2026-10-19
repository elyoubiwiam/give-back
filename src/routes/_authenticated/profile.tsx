import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CAUSES, CITIES, SKILLS, TIME_SLOTS, type Cause, type City } from "@/lib/data";
import { useProfile, type Profile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — GiveBack" },
      { name: "description", content: "Tell us the causes you care about, how you can help and how much time you have." },
      { property: "og:title", content: "Your profile — GiveBack" },
      { property: "og:description", content: "Set your causes, skills and time to get matched to tasks." },
    ],
  }),
  component: ProfilePage,
});

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function ProfilePage() {
  const { profile, save } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const navigate = useNavigate();
  useEffect(() => setDraft(profile), [profile]);

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"}`;

  const submit = () => {
    if (!draft.name.trim()) { toast.error("Please add your name"); return; }
    if (!draft.causes.length) { toast.error("Pick at least one cause"); return; }
    save(draft);
    toast.success("Profile saved on this device");
    navigate({ to: "/tasks" });
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="font-display text-4xl text-foreground md:text-5xl">Your profile</h1>
      <p className="mt-2 text-muted-foreground">Accounts launch soon — for now your choices are kept on this device to tailor your tasks.</p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-xl text-foreground">About you</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input placeholder="First name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="rounded-xl border border-border bg-card px-4 py-3" />
            <select value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value as City })} className="rounded-xl border border-border bg-card px-4 py-3">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input disabled placeholder="Email (coming soon)" className="rounded-xl border border-border bg-muted px-4 py-3 sm:col-span-2" />
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">Causes that matter to you</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {CAUSES.map((c) => (
              <button key={c} className={chip(draft.causes.includes(c))} onClick={() => setDraft({ ...draft, causes: toggle<Cause>(draft.causes, c) })}>{c}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">How you can help</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SKILLS.map((s) => (
              <button key={s} className={chip(draft.skills.includes(s))} onClick={() => setDraft({ ...draft, skills: toggle<string>(draft.skills, s) })}>{s}</button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl text-foreground">Time you can give per task</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => (
              <button key={t.id} className={`rounded-xl border px-3 py-4 text-sm ${draft.maxMinutes === t.max ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"}`} onClick={() => setDraft({ ...draft, maxMinutes: t.max })}>{t.label}</button>
            ))}
          </div>
        </section>

        <button onClick={submit} className="w-full rounded-full bg-primary py-3.5 font-medium text-primary-foreground hover:opacity-90">
          Save & show my tasks
        </button>
      </div>
    </div>
  );
}
