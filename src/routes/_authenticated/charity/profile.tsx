import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileCheck, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CAUSES, CITIES, causeMeta } from "@/lib/data";
import { myCharityQuery } from "@/lib/charity";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/charity/profile")({
  head: () => ({
    meta: [
      { title: "Charity profile | GiveBack" },
      { name: "description", content: "Update your charity's name, logo, contact and legal details on GiveBack." },
      { property: "og:title", content: "Charity profile | GiveBack" },
      { property: "og:description", content: "Manage your charity's details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CharityProfile,
});

type Charity = Tables<"charities">;
const REGULATORS = ["Charity Commission (England & Wales)", "OSCR (Scotland)", "CCNI (Northern Ireland)", "Not registered / exempt"];

/** Shrinks the logo to 256px and keeps it as an image string. */
function resizeLogo(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const s = 256, c = document.createElement("canvas"); c.width = s; c.height = s;
      const ctx = c.getContext("2d")!; const r = Math.max(s / img.width, s / img.height);
      ctx.drawImage(img, (s - img.width * r) / 2, (s - img.height * r) / 2, img.width * r, img.height * r);
      res(c.toDataURL("image/webp", 0.85));
    };
    img.onerror = rej; img.src = URL.createObjectURL(file);
  });
}

function CharityProfile() {
  const qc = useQueryClient();
  const { data } = useQuery(myCharityQuery);
  const [c, setC] = useState<Charity | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setC(data); }, [data]);
  if (!c) return <p className="text-muted-foreground">Loading…</p>;
  const set = (p: Partial<Charity>) => setC({ ...c, ...p });

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const { id, owner_id, active, login_email, created_at, ...rest } = c;
    const { error } = await supabase.from("charities").update(rest).eq("id", id);
    setSaving(false);
    if (error) return void toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["my-charity"] }); qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  const uploadDoc = async (file: File) => {
    const { data: u } = await supabase.auth.getUser();
    const path = `${u.user!.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("charity-docs").upload(path, file);
    if (error) return void toast.error(error.message);
    set({ doc_path: path }); toast.success("Document uploaded. Press Save");
  };

  const input = "mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-foreground outline-none focus:border-primary";
  const L = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block text-sm text-muted-foreground">{label}{children}</label>;

  return (
    <form onSubmit={save} className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Charity profile</h1>
      <section className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-2">
        <div className="flex items-center gap-4 md:col-span-2">
          {c.logo_url ? <img src={c.logo_url} alt="Logo" className="h-20 w-20 rounded-2xl object-cover" /> : <span className="grid h-20 w-20 place-items-center rounded-2xl bg-secondary text-2xl font-bold text-foreground">{c.name[0]}</span>}
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary">
            <Upload className="h-4 w-4" /> Upload logo
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) set({ logo_url: await resizeLogo(f) }); }} />
          </label>
        </div>
        <L label="Charity name"><input className={input} required value={c.name} onChange={(e) => set({ name: e.target.value })} /></L>
        <L label="City"><select className={input} value={c.city} onChange={(e) => set({ city: e.target.value })}>{CITIES.map((x) => <option key={x}>{x}</option>)}</select></L>
        <div className="md:col-span-2"><L label="About your charity"><textarea rows={3} className={input} value={c.description} onChange={(e) => set({ description: e.target.value })} /></L></div>
        <L label="Website"><input className={input} value={c.website} onChange={(e) => set({ website: e.target.value })} /></L>
        <L label="Contact email"><input type="email" className={input} value={c.contact_email} onChange={(e) => set({ contact_email: e.target.value })} /></L>
        <L label="Contact phone"><input className={input} value={c.contact_phone} onChange={(e) => set({ contact_phone: e.target.value })} /></L>
        <div className="md:col-span-2">
          <p className="text-sm text-muted-foreground">Causes you work on</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CAUSES.map((x) => { const on = c.causes.includes(x); const col = causeMeta(x).color; return (
              <button type="button" key={x} onClick={() => set({ causes: on ? c.causes.filter((y) => y !== x) : [...c.causes, x] })}
                className="rounded-full border px-3.5 py-1.5 text-sm" style={on ? { background: col, borderColor: col, color: "var(--primary-foreground)" } : { borderColor: "var(--border)" }}>{x}</button>
            ); })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-2">
        <h2 className="text-xl font-semibold text-foreground md:col-span-2">Legal details</h2>
        <L label="Registered charity number"><input className={input} value={c.charity_number} onChange={(e) => set({ charity_number: e.target.value })} /></L>
        <L label="Regulator"><select className={input} value={c.regulator} onChange={(e) => set({ regulator: e.target.value })}><option value="">Choose…</option>{REGULATORS.map((r) => <option key={r}>{r}</option>)}</select></L>
        <div className="md:col-span-2"><L label="Registered address"><input className={input} value={c.registered_address} onChange={(e) => set({ registered_address: e.target.value })} /></L></div>
        <L label="Safeguarding lead (name)"><input className={input} value={c.safeguarding_lead} onChange={(e) => set({ safeguarding_lead: e.target.value })} /></L>
        <L label="Insurance expiry date"><input type="date" className={input} value={c.insurance_expiry ?? ""} onChange={(e) => set({ insurance_expiry: e.target.value || null })} /></L>
        <label className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" checked={c.dbs_checks} onChange={(e) => set({ dbs_checks: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" /> We run DBS checks where needed</label>
        <label className="flex items-center gap-3 text-sm text-foreground"><input type="checkbox" checked={c.insurance} onChange={(e) => set({ insurance: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" /> We have public liability insurance</label>
        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-primary">
            <Upload className="h-4 w-4" /> Upload a document (e.g. insurance certificate)
            <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadDoc(f); }} />
          </label>
          {c.doc_path && <span className="flex items-center gap-1 text-sm text-foreground"><FileCheck className="h-4 w-4 text-primary" />{c.doc_path.split("/").pop()?.replace(/^\d+-/, "")}</span>}
        </div>
        <p className="text-xs text-muted-foreground md:col-span-2">Documents are private. Only your charity can see them.</p>
      </section>
      <Button disabled={saving} className="rounded-full px-8">{saving ? "Saving…" : "Save profile"}</Button>
    </form>
  );
}
