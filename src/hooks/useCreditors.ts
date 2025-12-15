import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Creditor, Claim, CreditorStats, AIFlag } from "@/types/creditor";

export interface CreditorWithClaim extends Creditor {
  claim?: Claim;
}

// Fetch all creditors with their claims for the current user
export function useCreditors(estateId?: string) {
  return useQuery({
    queryKey: ["creditors", estateId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("creditors")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (estateId) {
        query = query.eq("estate_id", estateId);
      }

      const { data: creditors, error } = await query;
      if (error) throw error;

      // Fetch claims for these creditors
      const creditorIds = creditors?.map(c => c.id) || [];
      let claims: any[] = [];
      
      if (creditorIds.length > 0) {
        const { data: claimsData, error: claimsError } = await supabase
          .from("claims")
          .select("*")
          .in("creditor_id", creditorIds);
        
        if (claimsError) throw claimsError;
        claims = claimsData || [];
      }

      // Merge creditors with their claims
      const creditorsWithClaims: CreditorWithClaim[] = (creditors || []).map(creditor => ({
        ...creditor,
        creditor_type: creditor.creditor_type as Creditor['creditor_type'],
        claim: claims.find(c => c.creditor_id === creditor.id) ? {
          ...claims.find(c => c.creditor_id === creditor.id),
          priority: claims.find(c => c.creditor_id === creditor.id)?.priority as Claim['priority'],
          status: claims.find(c => c.creditor_id === creditor.id)?.status as Claim['status'],
          ai_flags: (claims.find(c => c.creditor_id === creditor.id)?.ai_flags || []) as AIFlag[],
          supporting_documents: claims.find(c => c.creditor_id === creditor.id)?.supporting_documents || [],
        } : undefined,
      }));

      return creditorsWithClaims;
    },
  });
}

// Fetch creditor stats
export function useCreditorStats(estateId?: string) {
  return useQuery({
    queryKey: ["creditor-stats", estateId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let creditorQuery = supabase
        .from("creditors")
        .select("id")
        .eq("user_id", user.id);

      if (estateId) {
        creditorQuery = creditorQuery.eq("estate_id", estateId);
      }

      const { data: creditors, error: creditorError } = await creditorQuery;
      if (creditorError) throw creditorError;

      const creditorIds = creditors?.map(c => c.id) || [];
      
      let claims: any[] = [];
      if (creditorIds.length > 0) {
        const { data: claimsData, error: claimsError } = await supabase
          .from("claims")
          .select("*")
          .in("creditor_id", creditorIds);
        
        if (claimsError) throw claimsError;
        claims = claimsData || [];
      }

      const stats: CreditorStats = {
        total_creditors: creditors?.length || 0,
        claims_filed: claims.length,
        claims_accepted: claims.filter(c => c.status === 'accepted').length,
        claims_rejected: claims.filter(c => c.status === 'rejected').length,
        claims_pending: claims.filter(c => c.status === 'pending').length,
        total_secured: claims.reduce((sum, c) => sum + (Number(c.secured_amount) || 0), 0),
        total_preferred: claims.reduce((sum, c) => sum + (Number(c.preferred_amount) || 0), 0),
        total_unsecured: claims.reduce((sum, c) => sum + (Number(c.unsecured_amount) || 0), 0),
        total_claim_amount: claims.reduce((sum, c) => sum + (Number(c.claim_amount) || 0), 0),
        critical_flags: claims.reduce((sum, c) => {
          const flags = (c.ai_flags || []) as AIFlag[];
          return sum + flags.filter(f => f.severity === 'critical' && !f.resolved).length;
        }, 0),
        missing_docs_count: claims.reduce((sum, c) => {
          const flags = (c.ai_flags || []) as AIFlag[];
          return sum + flags.filter(f => f.type === 'missing_docs' && !f.resolved).length;
        }, 0),
        late_filings: claims.filter(c => c.is_late_filing).length,
      };

      return stats;
    },
  });
}

// Create a new creditor
export function useCreateCreditor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creditor: Partial<Creditor>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("creditors")
        .insert({
          name: creditor.name || '',
          address: creditor.address,
          city: creditor.city,
          province: creditor.province,
          postal_code: creditor.postal_code,
          country: creditor.country,
          email: creditor.email,
          phone: creditor.phone,
          fax: creditor.fax,
          creditor_type: creditor.creditor_type,
          account_number: creditor.account_number,
          contact_person: creditor.contact_person,
          notes: creditor.notes,
          estate_id: creditor.estate_id,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditors"] });
      queryClient.invalidateQueries({ queryKey: ["creditor-stats"] });
      toast.success("Creditor created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create creditor: ${error.message}`);
    },
  });
}

// Update a creditor
export function useUpdateCreditor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Creditor> & { id: string }) => {
      const { data, error } = await supabase
        .from("creditors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditors"] });
      toast.success("Creditor updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update creditor: ${error.message}`);
    },
  });
}

// Delete a creditor
export function useDeleteCreditor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("creditors")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditors"] });
      queryClient.invalidateQueries({ queryKey: ["creditor-stats"] });
      toast.success("Creditor deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete creditor: ${error.message}`);
    },
  });
}

// Create a claim
export function useCreateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claim: Partial<Claim>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("claims")
        .insert({
          creditor_id: claim.creditor_id,
          estate_id: claim.estate_id,
          claim_amount: claim.claim_amount || 0,
          secured_amount: claim.secured_amount || 0,
          preferred_amount: claim.preferred_amount || 0,
          unsecured_amount: claim.unsecured_amount || 0,
          priority: claim.priority || 'unsecured',
          status: claim.status || 'pending',
          filing_date: claim.filing_date,
          is_late_filing: claim.is_late_filing || false,
          collateral_description: claim.collateral_description,
          collateral_value: claim.collateral_value,
          supporting_documents: JSON.stringify(claim.supporting_documents || []),
          osb_compliant: claim.osb_compliant || false,
          validation_notes: claim.validation_notes,
          ai_flags: JSON.stringify(claim.ai_flags || []),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditors"] });
      queryClient.invalidateQueries({ queryKey: ["creditor-stats"] });
      toast.success("Claim created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create claim: ${error.message}`);
    },
  });
}

// Update a claim
export function useUpdateClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Claim> & { id: string }) => {
      const updateData: Record<string, any> = {};
      if (updates.claim_amount !== undefined) updateData.claim_amount = updates.claim_amount;
      if (updates.secured_amount !== undefined) updateData.secured_amount = updates.secured_amount;
      if (updates.preferred_amount !== undefined) updateData.preferred_amount = updates.preferred_amount;
      if (updates.unsecured_amount !== undefined) updateData.unsecured_amount = updates.unsecured_amount;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.is_late_filing !== undefined) updateData.is_late_filing = updates.is_late_filing;
      if (updates.collateral_description !== undefined) updateData.collateral_description = updates.collateral_description;
      if (updates.collateral_value !== undefined) updateData.collateral_value = updates.collateral_value;
      if (updates.osb_compliant !== undefined) updateData.osb_compliant = updates.osb_compliant;
      if (updates.validation_notes !== undefined) updateData.validation_notes = updates.validation_notes;
      if (updates.supporting_documents !== undefined) updateData.supporting_documents = JSON.stringify(updates.supporting_documents);
      if (updates.ai_flags !== undefined) updateData.ai_flags = JSON.stringify(updates.ai_flags);

      const { data, error } = await supabase
        .from("claims")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditors"] });
      queryClient.invalidateQueries({ queryKey: ["creditor-stats"] });
      toast.success("Claim updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update claim: ${error.message}`);
    },
  });
}
