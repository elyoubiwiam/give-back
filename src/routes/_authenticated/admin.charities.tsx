import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { currentUserHasRole } from "@/lib/auth";
import { CITIES } from "@/lib/data";
import { createCharityAccount, resetCharityPassword, setCharityActive } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/charities")({
  beforeLoad: async () => {
    if (!(await currentUserHasRole("admin"))) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Manage charities | GiveBack admin" },
      { name: "description", content: "Create and manage charity logins for GiveBack." },
      { property: "og:title", content: "Manage charities | GiveBack admin" },
      { property: "og:description", content: "Create and manage charity logins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCharities,
});

function AdminCharities() {
  const qc = useQueryClient();
  const create = useServerFn(createCharityAccount);
  const reset = useServerFn(resetCharityPassword);
  const toggle = useServerFn(setCharityActive);
  const { data: list = [] } = useQuery({
    queryKey: ["admin-charities"],
    queryFn: async () => (await supabase.from("charities").select("id, name, city, login_email, active, owner_id").order("name")).data ?? [],
  });
  const [f, setF] = useState({ name: "", email: "", password: "", city: "London" });
  const [busy, setBusy] = useState(false);
  const input = "w-full rounded-2xl border border-border bg-background px-4 py-2.5 outline-none focus:border-primary";
  const reload = () => qc.invalidateQueries({ queryKey: ["admin-charities"] });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-5 py-10">
      <h1 className="text-3xl font-bold text-foreground">Charity logins</h1>
      <form className="grid gap-3 rounded-3xl border border-border bg-card p-6 md:grid-cols-2" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try { await create({ data: f }); toast.success("Login created", { description: `Send ${f.email} and the password to the charity.` }); setF({ name: "", email: "", password: "", city: "London" }); reload(); }
        catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
      }}>
        <input className={input} placeholder="Charity name" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select className={input} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
        <input className={input} type="email" placeholder="Login email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={input} placeholder="Password (8+ characters)" minLength={8} required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <Button disabled={busy} className="rounded-full md:col-span-2">{busy ? "Creating…" : "Create charity login"}</Button>
        <p className="text-xs text-muted-foreground md:col-span-2">If the name matches an existing charity on GiveBack, the login takes over its tasks.</p>
      </form>
      <div className="space-y-2">
        {list.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
            <div>
              <p className="font-medium text-foreground">{c.name} {!c.active && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs">switched off</span>}</p>
              <p className="text-xs text-muted-foreground">{c.city} · {c.login_email ?? "no login yet"}</p>
            </div>
            {c.owner_id && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={async () => {
                  const pw = prompt("New password (8+ characters)"); if (!pw) return;
                  try { await reset({ data: { charityId: c.id, password: pw } }); toast.success("Password changed"); } catch (err) { toast.error((err as Error).message); }
                }}>Reset password</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={async () => {
                  try { await toggle({ data: { charityId: c.id, active: !c.active } }); reload(); toast.success(c.active ? "Account switched off" : "Account switched on"); } catch (err) { toast.error((err as Error).message); }
                }}>{c.active ? "Switch off" : "Switch on"}</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
