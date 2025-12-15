import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Distribution, CreditorDistribution } from "@/types/creditor";

// Fetch distributions for an estate
export function useDistributions(estateId?: string) {
  return useQuery({
    queryKey: ["distributions", estateId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("distributions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (estateId) {
        query = query.eq("estate_id", estateId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(d => ({
        ...d,
        status: d.status as Distribution['status'],
        total_receipts: Number(d.total_receipts) || 0,
        total_disbursements: Number(d.total_disbursements) || 0,
        trustee_fees: Number(d.trustee_fees) || 0,
        levy_amount: Number(d.levy_amount) || 0,
        sales_tax: Number(d.sales_tax) || 0,
        secured_distribution: Number(d.secured_distribution) || 0,
        preferred_distribution: Number(d.preferred_distribution) || 0,
        unsecured_distribution: Number(d.unsecured_distribution) || 0,
        dividend_rate: Number(d.dividend_rate) || 0,
        distributions: (Array.isArray(d.distributions) ? d.distributions : []) as unknown as CreditorDistribution[],
      })) as Distribution[];
    },
  });
}

// Create a new distribution
export function useCreateDistribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (distribution: Partial<Distribution>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("distributions")
        .insert({
          estate_id: distribution.estate_id,
          distribution_date: distribution.distribution_date,
          total_receipts: distribution.total_receipts || 0,
          total_disbursements: distribution.total_disbursements || 0,
          trustee_fees: distribution.trustee_fees || 0,
          levy_amount: distribution.levy_amount || 0,
          sales_tax: distribution.sales_tax || 0,
          secured_distribution: distribution.secured_distribution || 0,
          preferred_distribution: distribution.preferred_distribution || 0,
          unsecured_distribution: distribution.unsecured_distribution || 0,
          dividend_rate: distribution.dividend_rate || 0,
          status: distribution.status || 'draft',
          distributions: JSON.stringify(distribution.distributions || []),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast.success("Distribution created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create distribution: ${error.message}`);
    },
  });
}

// Update a distribution
export function useUpdateDistribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Distribution> & { id: string }) => {
      const updateData: Record<string, any> = {};
      if (updates.distribution_date !== undefined) updateData.distribution_date = updates.distribution_date;
      if (updates.total_receipts !== undefined) updateData.total_receipts = updates.total_receipts;
      if (updates.total_disbursements !== undefined) updateData.total_disbursements = updates.total_disbursements;
      if (updates.trustee_fees !== undefined) updateData.trustee_fees = updates.trustee_fees;
      if (updates.levy_amount !== undefined) updateData.levy_amount = updates.levy_amount;
      if (updates.sales_tax !== undefined) updateData.sales_tax = updates.sales_tax;
      if (updates.secured_distribution !== undefined) updateData.secured_distribution = updates.secured_distribution;
      if (updates.preferred_distribution !== undefined) updateData.preferred_distribution = updates.preferred_distribution;
      if (updates.unsecured_distribution !== undefined) updateData.unsecured_distribution = updates.unsecured_distribution;
      if (updates.dividend_rate !== undefined) updateData.dividend_rate = updates.dividend_rate;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.distributions !== undefined) updateData.distributions = JSON.stringify(updates.distributions);

      const { data, error } = await supabase
        .from("distributions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      toast.success("Distribution updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update distribution: ${error.message}`);
    },
  });
}
