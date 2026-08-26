import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Authoritative client-portal session.
 *
 * The estate a signed-in client may work on is NEVER chosen by the browser. It is
 * read from `client_portal_access`, the row created server-side when the secure
 * invitation was redeemed. Every repository call in `db.ts` is scoped by the
 * estate id returned here, and RLS re-checks the same relationship on the server.
 */

export interface PortalSession {
  userId: string;
  estateId: string;
  clientId?: string;
  name: string;
  email: string;
  fileNumber?: string;
  proceedingLabel?: string;
  firmName?: string;
  trusteeName?: string;
  officeName?: string;
  debtorName?: string;
}

export const usePortalSession = () => {
  const query = useQuery({
    queryKey: ["portal-session"],
    staleTime: 60_000,
    queryFn: async (): Promise<PortalSession | null> => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return null;

      const { data: access, error } = await supabase
        .from("client_portal_access")
        .select("estate_id, client_id, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("granted_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!access) return null;

      const { data: estate } = await supabase
        .from("estates")
        .select(
          "id, debtor_name, file_number, proceeding_type, estate_type, trustee_name, trustee_office, first_name, last_name",
        )
        .eq("id", access.estate_id)
        .maybeSingle();

      const { data: invite } = await supabase
        .from("client_portal_invitations")
        .select("firm_name, office_name, trustee_name, proceeding_label, invited_name")
        .eq("estate_id", access.estate_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const displayName =
        (user.user_metadata?.full_name as string | undefined) ||
        invite?.invited_name ||
        estate?.debtor_name ||
        user.email ||
        "Client";

      return {
        userId: user.id,
        estateId: access.estate_id,
        clientId: access.client_id ?? undefined,
        name: displayName,
        email: user.email ?? "",
        fileNumber: estate?.file_number ?? undefined,
        debtorName: estate?.debtor_name ?? undefined,
        proceedingLabel: invite?.proceeding_label ?? estate?.proceeding_type ?? estate?.estate_type ?? undefined,
        firmName: invite?.firm_name ?? undefined,
        trusteeName: invite?.trustee_name ?? estate?.trustee_name ?? undefined,
        officeName: invite?.office_name ?? estate?.trustee_office ?? undefined,
      };
    },
  });

  return {
    session: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
  };
};
