import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export interface AvailableUser {
  id: string;
  full_name: string | null;
  email: string;
}

export const useAvailableUsers = () => {
  const { toast } = useToast();
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);

  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('available_users')
        .select('*');

      if (error) throw error;
      setAvailableUsers(data ? data.map((item: Record<string, unknown>) => ({
        id: typeof item.id === 'string' ? item.id : '',
        full_name: typeof item.full_name === 'string' ? item.full_name : '',
        email: typeof item.email === 'string' ? item.email : ''
      })) : []);
    } catch (error) {
      console.error('Error fetching available users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch available users"
      });
    }
  };

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  return { availableUsers };
};
