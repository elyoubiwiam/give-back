import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;
export type Role = "admin" | "charity";

type AuthCtx = {
  user: User | null;
  profile: Profile | null;
  joined: Set<string>;
  roles: Set<Role>;
  loading: boolean;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, profile: null, joined: new Set(), roles: new Set(), loading: true, refresh: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [roles, setRoles] = useState<Set<Role>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) {
      setProfile(null);
      setJoined(new Set());
      setRoles(new Set());
      setLoading(false);
      return;
    }
    const [{ data: p }, { data: s }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
      supabase.from("task_signups").select("task_id"),
      supabase.from("user_roles").select("role"),
    ]);
    setProfile(p ?? null);
    setJoined(new Set((s ?? []).map((x) => x.task_id)));
    setRoles(new Set((r ?? []).map((x) => x.role as Role)));
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION") {
        setTimeout(() => void load(session?.user ?? null), 0);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [load]);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    await load(data.user);
  }, [load]);

  return <Ctx.Provider value={{ user, profile, joined, roles, loading, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

/** Used by route guards: does the signed-in user hold this role? */
export async function currentUserHasRole(role: Role) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return false;
  const { data } = await supabase.from("user_roles").select("role").eq("role", role).maybeSingle();
  return !!data;
}
