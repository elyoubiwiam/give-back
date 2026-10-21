import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Gift, Heart, LayoutDashboard, CalendarPlus, HandCoins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode | undefined; note?: string | undefined; as?: "charity" | undefined } => ({
    mode: s["mode"] === "signin" || s["mode"] === "forgot" ? s["mode"] : undefined,
    note: typeof s["note"] === "string" ? s["note"] : undefined,
    as: s["as"] === "charity" ? "charity" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create your free account — GiveBack" },
      { name: "description", content: "Create a free GiveBack account to get volunteering tasks tailored to the causes you care about." },
      { property: "og:title", content: "Create your free account — GiveBack" },
      { property: "og:description", content: "Tasks tailored to your causes and your time. Free, always." },
    ],
  }),
  component: AuthPage,
});


const BENEFITS = [
  { icon: Heart, text: "Tasks tailored to the causes you care about", color: "var(--coral)" },
  { icon: Clock, text: "Only tasks that fit the time you have", color: "var(--teal)" },
  { icon: Gift, text: "Earn points for local rewards", color: "var(--mustard)" },
];

const CHARITY_BENEFITS = [
  { icon: CalendarPlus, text: "Post tasks — what's involved, when, and how many volunteers you need", color: "var(--teal)" },
  { icon: LayoutDashboard, text: "A dashboard of your bookings and the volunteers who came", color: "var(--coral)" },
  { icon: Clock, text: "Simple numbers and graphs to help volunteers come back", color: "var(--sky)" },
  { icon: HandCoins, text: "See donations you receive through GiveBack", color: "var(--mustard)" },
];

function AuthPage() {
  const search = Route.useSearch();
  const isCharity = search.as === "charity";
  const [mode, setMode] = useState<Mode>(search.mode ?? (isCharity ? "signin" : "signup"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, profile, roles, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || loading) return;
    if (roles.has("charity")) return void navigate({ to: "/charity" });
    if (!profile) return;
    navigate({ to: profile.onboarded ? "/tasks" : "/profile" });
  }, [user, profile, roles, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/profile", data: { name } },
        });
        if (error) throw error;
        toast.success("Check your inbox", { description: "Confirm your email to finish creating your account." });
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        toast.success("Reset link sent", { description: "Check your email." });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (res.error) toast.error(res.error.message);
  };

  const input = "w-full rounded-2xl border border-border bg-card px-4 py-3 outline-none transition focus:border-primary";

  const isCharityView = isCharity;
  const badge = isCharityView ? "Charity partner" : "Free, always";
  const heading = isCharityView ? (
    <>Welcome back — sign in to <span className="text-primary">your charity dashboard.</span></>
  ) : (
    <>Create an account to get tasks <span className="text-primary">tailored to you.</span></>
  );
  const benefits = isCharityView ? CHARITY_BENEFITS : BENEFITS;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center">
      <div>
        <span className="inline-flex rounded-full bg-teal/20 px-3 py-1 text-sm font-medium text-foreground">{badge}</span>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-foreground md:text-5xl">{heading}</h1>
        <ul className="mt-8 space-y-4">
          {benefits.map((b) => (
            <li key={b.text} className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary-foreground" style={{ background: b.color }}>
                <b.icon className="h-5 w-5" />
              </span>
              <span className="font-medium text-foreground">{b.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
        {search.as === "charity" && mode === "signin" && (
          <p className="mb-4 rounded-2xl bg-teal/15 px-4 py-3 text-sm text-foreground">
            <span className="font-semibold">Charity partner sign-in.</span> Use the email and password GiveBack gave you to open your dashboard.
          </p>
        )}
        {search.note && mode === "signup" && (
          <p className="mb-4 rounded-2xl bg-mustard/20 px-4 py-3 text-sm text-foreground">{search.note}</p>
        )}
        {mode !== "forgot" && (
          <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary p-1">
            {(["signup", "signin"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-full py-2 text-sm font-medium transition ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        )}
        {mode === "forgot" && <h2 className="mb-6 text-2xl font-bold text-foreground">Reset your password</h2>}
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <input className={input} placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} required />}
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {mode !== "forgot" && <input className={input} type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />}
          <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create my free account" : "Send reset link"}
          </button>
        </form>
        {mode === "signin" && (
          <button onClick={() => setMode("forgot")} className="mt-3 text-sm text-muted-foreground underline underline-offset-4">Forgot password?</button>
        )}
        {mode === "forgot" && (
          <button onClick={() => setMode("signin")} className="mt-3 text-sm text-muted-foreground underline underline-offset-4">Back to sign in</button>
        )}
        {mode !== "forgot" && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
            <button onClick={google} className="w-full rounded-full border border-border bg-background py-3 font-medium text-foreground transition hover:bg-secondary">
              Continue with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
}

