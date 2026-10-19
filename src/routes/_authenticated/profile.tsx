import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CAUSES, CITIES, SKILLS, TIME_SLOTS, causeMeta } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

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

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function ProfilePage() {
  const { user, profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [city, setCity] = useState("London");
  const [causes, setCauses] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [maxMinutes, setMaxMinutes] = useState(120);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setCity(profile.city);
    setCauses(profile.causes);
    setSkills(profile.skills);
    setMaxMinutes(profile.max_minutes);
  }, [profile]);

  const submit = async () => {
    if (!user) return;
    if (!name.trim()) return void toast.error("Please add your name");
    if (!causes.length) return void toast.error("Pick at least one cause");
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), city, causes, skills, max_minutes: maxMinutes, onboarded: true })
      .eq("id", user.id);
    setSaving(false);
    if (error) return void toast.error(error.message);
    await refresh();
    toast.success("Profile saved");
    navigate({ to: "/tasks" });
  };

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-all active:scale-95 ${active ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/40"}`;

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">{profile?.onboarded ? "Your profile" : "Welcome! Let's set you up"}</h1>
      <p className="mt-2 text-muted-foreground">We'll use this to match you with tasks that fit your causes and your time.</p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-foreground">About you</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-2xl border border-border bg-card px-4 py-3" />
            <select value={city} onChange={(e) => setCity(e.target.value)} className="rounded-2xl border border-border bg-card px-4 py-3">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Causes that matter the most to you (you can choose all too)</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CAUSES.map((c) => {
              const m = causeMeta(c);
              const Icon = m.icon;
              const on = causes.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => setCauses(toggle(causes, c))}
                  className="flex flex-col items-start gap-3 rounded-2xl border-2 p-4 text-left text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ borderColor: on ? m.color : "var(--border)", background: on ? `color-mix(in oklab, ${m.color} 15%, var(--card))` : "var(--card)" }}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground" style={{ background: m.color }}><Icon className="h-4 w-4" /></span>
                  {c}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">How you can help</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {SKILLS.map((s) => <button key={s} className={chip(skills.includes(s))} onClick={() => setSkills(toggle(skills, s))}>{s}</button>)}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Time you're able to give</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => (
              <button key={t.id} className={`rounded-2xl border-2 px-3 py-4 text-sm font-medium transition active:scale-95 ${maxMinutes === t.max ? "border-teal bg-teal text-primary-foreground" : "border-border bg-card"}`} onClick={() => setMaxMinutes(t.max)}>{t.label}</button>
            ))}
          </div>
        </section>


        <button disabled={saving} onClick={submit} className="w-full rounded-full bg-primary py-3.5 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
          Save & show my tasks
        </button>
      </div>
    </div>
  );
}
