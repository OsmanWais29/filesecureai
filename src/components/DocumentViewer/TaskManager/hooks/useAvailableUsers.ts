
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { safeString } from '@/utils/typeSafetyUtils';

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
      
      if (data && Array.isArray(data)) {
        const typedUsers: AvailableUser[] = data.map(item => ({
          id: safeString(item.id, ''),
          full_name: safeString(item.full_name, null),
          email: safeString(item.email, '')
        }));
        
        setAvailableUsers(typedUsers);
      } else {
        setAvailableUsers([]);
      }
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
