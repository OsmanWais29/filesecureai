// Loads clients from Supabase; falls back to demo data when the table is empty
// or unreachable, so the CRM always has something to show.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Client, CLIENTS } from "./data";

// React Query cache key — invalidate it after adding a client to refresh lists
export const CLIENTS_KEY = ["crm-clients"];

// Turn a raw `clients` table row into the CRM's Client shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toClient = (row: any): Client => {
  const health = row.engagement_score ?? 50; // default to a neutral score
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    company: row.metadata?.company ?? row.metadata?.intake_data?.companyName ?? "",
    status: ["active", "lead", "inactive"].includes(row.status) ? row.status : "lead",
    risk: health < 40 ? "high" : health < 70 ? "medium" : "low", // derived from health
    health,
    progress: row.metadata?.progress ?? 0,
    assignedTo: row.metadata?.assignedTo ?? "Unassigned",
    tags: row.metadata?.tags ?? [],
    lastActivity: row.last_interaction ?? row.created_at ?? new Date().toISOString(),
  };
};

export const useClients = () =>
  useQuery({
    queryKey: CLIENTS_KEY,
    queryFn: async () => {
      if (!supabase) return CLIENTS; // demo mode
      const { data, error } = await supabase.from("clients").select("*").order("name");
      if (error || !data?.length) return CLIENTS; // demo fallback
      return data.map(toClient);
    },
  });
