import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — GiveBack" },
      { name: "description", content: "Sign in or create your GiveBack account to start lending a hand." },
      { property: "og:title", content: "Sign in — GiveBack" },
      { property: "og:description", content: "Join GiveBack and help local UK charities." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) navigate({ to: profile.onboarded ? "/tasks" : "/profile" });
  }, [user, profile, navigate]);

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
        toast.success("Check your inbox", { description: "Confirm your email to finish signing up." });
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

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-2 md:items-center">
      <div className="hidden md:block">
        <div className="relative aspect-square">
          <div className="absolute left-4 top-6 h-40 w-40 animate-[float_6s_ease-in-out_infinite] rounded-[2.5rem] bg-mustard" />
          <div className="absolute right-6 top-20 h-32 w-32 animate-[float_7s_ease-in-out_infinite_1s] rounded-full bg-teal" />
          <div className="absolute bottom-10 left-20 h-44 w-44 animate-[float_8s_ease-in-out_infinite_0.5s] rounded-[3rem] bg-coral" />
          <div className="absolute bottom-24 right-16 h-24 w-24 animate-[float_5s_ease-in-out_infinite] rounded-3xl bg-plum" />
          <p className="absolute inset-0 grid place-items-center text-center text-3xl font-bold text-foreground">Small tasks.<br />Big kindness.</p>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-soft)]">
        {mode !== "forgot" && (
          <div className="mb-6 grid grid-cols-2 rounded-full bg-secondary p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`rounded-full py-2 text-sm font-medium transition ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
        )}
        {mode === "forgot" && <h1 className="mb-6 text-2xl font-bold text-foreground">Reset your password</h1>}
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <input className={input} placeholder="First name" value={name} onChange={(e) => setName(e.target.value)} required />}
          <input className={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {mode !== "forgot" && <input className={input} type="password" placeholder="Password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />}
          <button disabled={busy} className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60">
            {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
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
