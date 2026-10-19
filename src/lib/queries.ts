import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Task } from "./data";

export const tasksQuery = queryOptions({
  queryKey: ["tasks"],
  queryFn: async (): Promise<Task[]> => {
    const { data, error } = await supabase.from("tasks").select("*").order("city");
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
