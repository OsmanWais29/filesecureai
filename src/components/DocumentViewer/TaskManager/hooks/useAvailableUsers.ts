
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { toString } from "@/utils/typeSafetyUtils";

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export const useAvailableUsers = () => {
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .order('full_name');

        if (error) throw error;

        // Map data to strongly typed User objects
        const users: User[] = (data || []).map(user => ({
          id: toString(user.id),
          email: toString(user.email),
          name: toString(user.full_name),
          avatar_url: toString(user.avatar_url)
        }));

        setAvailableUsers(users);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to load users');
        toast.error('Error loading users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return {
    users: availableUsers,
    loading,
    error
  };
};
