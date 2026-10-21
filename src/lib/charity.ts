import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myCharityQuery = queryOptions({
  queryKey: ["my-charity"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("charities").select("*").eq("owner_id", u.user?.id ?? "").maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const myCharityTasksQuery = (charityId: string) =>
  queryOptions({
    queryKey: ["charity-tasks", charityId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("charity_id", charityId).order("starts_at");
      if (error) throw error;
      return data;
    },
  });

export const charityActivityQuery = queryOptions({
  queryKey: ["charity-activity"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("charity_activity");
    if (error) throw error;
    return data;
  },
});

export const charityDonationsQuery = queryOptions({
  queryKey: ["charity-donations"],
  queryFn: async () => {
    const { data, error } = await supabase.from("donations").select("amount_pence, user_id, created_at");
    if (error) throw error;
    return data;
  },
});
