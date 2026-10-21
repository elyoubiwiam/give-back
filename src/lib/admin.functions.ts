import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Ctx = { supabase: any; userId: string };

async function assertAdmin(context: Ctx) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!data) throw new Error("Only GiveBack admins can do this");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createCharityAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; email: string; password: string; city: string }) => {
    const name = String(d.name ?? "").trim().slice(0, 120);
    const email = String(d.email ?? "").trim().toLowerCase();
    const password = String(d.password ?? "");
    if (!name) throw new Error("Charity name is required");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    return { name, email, password, city: String(d.city ?? "London").slice(0, 60) };
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: created, error } = await admin.auth.admin.createUser({
      email: data.email, password: data.password, email_confirm: true, user_metadata: { name: data.name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the login");
    const uid = created.user.id;
    await admin.from("user_roles").insert({ user_id: uid, role: "charity" });
    await admin.from("profiles").update({ onboarded: true, name: data.name }).eq("id", uid);
    const { data: existing } = await admin.from("charities").select("id").is("owner_id", null).ilike("name", data.name).maybeSingle();
    if (existing) {
      await admin.from("charities").update({ owner_id: uid, login_email: data.email, contact_email: data.email }).eq("id", existing.id);
    } else {
      await admin.from("charities").insert({ owner_id: uid, login_email: data.email, contact_email: data.email, name: data.name, city: data.city });
    }
    return { ok: true };
  });

export const resetCharityPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { charityId: string; password: string }) => {
    if (String(d.password ?? "").length < 8) throw new Error("Password must be at least 8 characters");
    return { charityId: String(d.charityId), password: String(d.password) };
  })
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: c } = await admin.from("charities").select("owner_id").eq("id", data.charityId).maybeSingle();
    if (!c?.owner_id) throw new Error("This charity has no login yet");
    const { error } = await admin.auth.admin.updateUserById(c.owner_id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCharityActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { charityId: string; active: boolean }) => ({ charityId: String(d.charityId), active: !!d.active }))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context as Ctx);
    const { data: c } = await admin.from("charities").update({ active: data.active }).eq("id", data.charityId).select("owner_id").maybeSingle();
    if (c?.owner_id) await admin.auth.admin.updateUserById(c.owner_id, { ban_duration: data.active ? "none" : "876000h" });
    return { ok: true };
  });
