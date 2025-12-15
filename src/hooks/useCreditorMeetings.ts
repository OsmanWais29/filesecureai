import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MeetingOfCreditors, CreditorVote } from "@/types/creditor";

// Fetch meetings for an estate
export function useCreditorMeetings(estateId?: string) {
  return useQuery({
    queryKey: ["creditor-meetings", estateId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let query = supabase
        .from("creditor_meetings")
        .select("*")
        .eq("user_id", user.id)
        .order("meeting_date", { ascending: false });

      if (estateId) {
        query = query.eq("estate_id", estateId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(m => ({
        ...m,
        meeting_type: m.meeting_type as MeetingOfCreditors['meeting_type'],
        status: m.status as MeetingOfCreditors['status'],
        total_claim_amount_voting: Number(m.total_claim_amount_voting) || 0,
        votes: (Array.isArray(m.votes) ? m.votes : []) as unknown as CreditorVote[],
      })) as MeetingOfCreditors[];
    },
  });
}

// Create a new meeting
export function useCreateCreditorMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (meeting: Partial<MeetingOfCreditors>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("creditor_meetings")
        .insert({
          estate_id: meeting.estate_id,
          meeting_date: meeting.meeting_date || new Date().toISOString().split('T')[0],
          meeting_time: meeting.meeting_time || '10:00',
          location: meeting.location,
          meeting_type: meeting.meeting_type || 'first',
          status: meeting.status || 'scheduled',
          quorum_met: meeting.quorum_met || false,
          total_eligible_voters: meeting.total_eligible_voters || 0,
          total_votes_cast: meeting.total_votes_cast || 0,
          total_claim_amount_voting: meeting.total_claim_amount_voting || 0,
          agenda: meeting.agenda,
          minutes: meeting.minutes,
          votes: JSON.stringify(meeting.votes || []),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditor-meetings"] });
      toast.success("Meeting scheduled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to schedule meeting: ${error.message}`);
    },
  });
}

// Update a meeting
export function useUpdateCreditorMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MeetingOfCreditors> & { id: string }) => {
      const updateData: Record<string, any> = {};
      if (updates.meeting_date !== undefined) updateData.meeting_date = updates.meeting_date;
      if (updates.meeting_time !== undefined) updateData.meeting_time = updates.meeting_time;
      if (updates.location !== undefined) updateData.location = updates.location;
      if (updates.meeting_type !== undefined) updateData.meeting_type = updates.meeting_type;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.quorum_met !== undefined) updateData.quorum_met = updates.quorum_met;
      if (updates.total_eligible_voters !== undefined) updateData.total_eligible_voters = updates.total_eligible_voters;
      if (updates.total_votes_cast !== undefined) updateData.total_votes_cast = updates.total_votes_cast;
      if (updates.total_claim_amount_voting !== undefined) updateData.total_claim_amount_voting = updates.total_claim_amount_voting;
      if (updates.agenda !== undefined) updateData.agenda = updates.agenda;
      if (updates.minutes !== undefined) updateData.minutes = updates.minutes;
      if (updates.votes !== undefined) updateData.votes = JSON.stringify(updates.votes);

      const { data, error } = await supabase
        .from("creditor_meetings")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creditor-meetings"] });
      toast.success("Meeting updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update meeting: ${error.message}`);
    },
  });
}
