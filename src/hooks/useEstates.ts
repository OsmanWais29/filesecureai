import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Estate } from "@/types/estate";

// Fetch all estates for the current user
export function useEstates() {
  return useQuery({
    queryKey: ["estates"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("estates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return (data || []).map(estate => ({
        ...estate,
        estate_type: estate.estate_type as Estate['estate_type'],
        status: estate.status as Estate['status'],
        trust_balance: Number(estate.trust_balance) || 0,
        total_claims: Number(estate.total_claims) || 0,
      })) as Estate[];
    },
  });
}

// Fetch a single estate by ID
export function useEstate(estateId?: string) {
  return useQuery({
    queryKey: ["estate", estateId],
    queryFn: async () => {
      if (!estateId) return null;
      
      const { data, error } = await supabase
        .from("estates")
        .select("*")
        .eq("id", estateId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        estate_type: data.estate_type as Estate['estate_type'],
        status: data.status as Estate['status'],
        trust_balance: Number(data.trust_balance) || 0,
        total_claims: Number(data.total_claims) || 0,
      } as Estate;
    },
    enabled: !!estateId,
  });
}

// Create a new estate
export function useCreateEstate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (estate: Partial<Estate>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("estates")
        .insert({
          debtor_name: estate.debtor_name || '',
          file_number: estate.file_number,
          estate_type: estate.estate_type || 'bankruptcy',
          status: estate.status || 'open',
          trustee_id: estate.trustee_id,
          trustee_name: estate.trustee_name,
          assigned_date: estate.assigned_date,
          trust_balance: estate.trust_balance || 0,
          total_creditors: estate.total_creditors || 0,
          total_claims: estate.total_claims || 0,
          next_deadline: estate.next_deadline,
          next_deadline_description: estate.next_deadline_description,
          client_id: estate.client_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
      toast.success("Estate created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create estate: ${error.message}`);
    },
  });
}

// Update an estate
export function useUpdateEstate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Estate> & { id: string }) => {
      const { data, error } = await supabase
        .from("estates")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
      queryClient.invalidateQueries({ queryKey: ["estate", variables.id] });
      toast.success("Estate updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update estate: ${error.message}`);
    },
  });
}

// Delete an estate
export function useDeleteEstate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("estates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estates"] });
      toast.success("Estate deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete estate: ${error.message}`);
    },
  });
}
