import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "./data";

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async (): Promise<Task[]> => {
    const { data, error } = await supabase.from("tasks").select("*, charities(logo_url)").order("city");
    if (error) throw error;
    return data;
  },
});

/** How many people have booked each task (for "spots left"). */
export const bookedCountsQuery = queryOptions({
  queryKey: ["booked-counts"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("task_booked_counts");
    if (error) throw error;
    return new Map(data.map((r) => [r.task_id, r.booked]));
  },
  refetchInterval: 30000,
});

export const charitiesListQuery = queryOptions({
  queryKey: ["charities-list"],
  queryFn: async () => {
    const { data, error } = await supabase.from("charities").select("id, name, city, active").eq("active", true).order("name");
    if (error) throw error;
    return data;
  },
});

export const cityStatsQuery = queryOptions({
  queryKey: ["city-stats"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("city_stats");
    if (error) throw error;
    return [...data].sort((a, b) => b.hours - a.hours);
  },
});

export const strikesQuery = queryOptions({
  queryKey: ["my-strikes"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("my_strikes");
    if (error) throw error;
    return data ?? 0;
  },
});
