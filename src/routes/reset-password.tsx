import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — GiveBack" },
      { name: "description", content: "Choose a new password for your GiveBack account." },
      { property: "og:title", content: "Set a new password — GiveBack" },
      { property: "og:description", content: "Choose a new password for your GiveBack account." },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return void toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/tasks" });
  };
  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <h1 className="text-3xl font-bold text-foreground">Set a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="w-full rounded-2xl border border-border bg-card px-4 py-3" />
        <button className="w-full rounded-full bg-primary py-3 font-medium text-primary-foreground">Update password</button>
      </form>
    </div>
  );
}
