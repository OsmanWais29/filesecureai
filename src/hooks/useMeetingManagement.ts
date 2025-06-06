
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { withFreshToken } from "@/utils/jwt/tokenManager";
import { ensureMeetingType } from '@/utils/typeGuards';

// Use export type for isolatedModules compatibility
export type { MeetingData } from '@/types/client';

export function useMeetingManagement() {
  const [meetings, setMeetings] = useState<import('@/types/client').MeetingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  });
  const { toast } = useToast();

  const fetchMeetings = async () => {
    setIsLoading(true);
    
    try {
      await withFreshToken(async () => {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .order('start_time', { ascending: true });
        
        if (error) {
          throw error;
        }
        
        if (data) {
          const typedMeetings = data.map(ensureMeetingType);
          setMeetings(typedMeetings);
          
          // Calculate stats
          const newStats = {
            total: typedMeetings.length,
            scheduled: typedMeetings.filter(meeting => meeting.status === 'scheduled').length,
            in_progress: typedMeetings.filter(meeting => meeting.status === 'in_progress').length,
            completed: typedMeetings.filter(meeting => meeting.status === 'completed').length,
            cancelled: typedMeetings.filter(meeting => meeting.status === 'cancelled').length
          };
          
          setStats(newStats);
        }
      });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast({
        title: "Failed to load meetings",
        description: "There was a problem fetching meeting data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addMeeting = async (meetingData: Omit<import('@/types/client').MeetingData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          ...meetingData,
        })
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newMeeting = ensureMeetingType(data[0]);
        setMeetings(prevMeetings => [newMeeting, ...prevMeetings]);
        fetchMeetings(); // Refresh all meetings to update stats
        
        toast({
          title: "Meeting added",
          description: `${meetingData.title} has been scheduled successfully.`,
        });
        
        return newMeeting;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding meeting:', error);
      toast({
        title: "Failed to add meeting",
        description: "There was a problem scheduling the meeting.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateMeeting = async (id: string, meetingData: Partial<import('@/types/client').MeetingData>) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .update({
          ...meetingData,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setMeetings(prevMeetings => 
        prevMeetings.map(meeting => 
          meeting.id === id ? { ...meeting, ...meetingData } : meeting
        )
      );
      
      // If we're updating the status, refresh all meetings to update stats
      if ('status' in meetingData) {
        fetchMeetings();
      }
      
      toast({
        title: "Meeting updated",
        description: "Meeting information has been updated.",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Failed to update meeting",
        description: "There was a problem updating the meeting.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMeetings(prevMeetings => prevMeetings.filter(meeting => meeting.id !== id));
      fetchMeetings(); // Refresh all meetings to update stats
      
      toast({
        title: "Meeting cancelled",
        description: "The meeting has been removed from the schedule.",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Failed to cancel meeting",
        description: "There was a problem cancelling the meeting.",
        variant: "destructive"
      });
      return false;
    }
  };

  const getMeetingsByClientId = (clientId: string) => {
    return meetings.filter(meeting => meeting.client_id === clientId);
  };

  const getUpcomingMeetings = (limit: number = 5) => {
    const now = new Date();
    return meetings
      .filter(meeting => new Date(meeting.start_time) > now && meeting.status === 'scheduled')
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, limit);
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return {
    meetings,
    isLoading,
    stats,
    fetchMeetings,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    getMeetingsByClientId,
    getUpcomingMeetings
  };
}
