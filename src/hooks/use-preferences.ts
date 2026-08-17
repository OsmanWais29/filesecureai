
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const usePreferences = () => {
  const { toast } = useToast();

  const { data: preferences, isLoading: isLoadingPreferences } = useQuery({
    queryKey: ['user-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handlePreferencesUpdate = async ({ key, value }: { key: string; value: boolean }) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ [key]: value } as any)
        .eq('user_id', preferences?.user_id);

      if (error) throw error;

      toast({
        title: "Preferences updated",
        description: `${key === 'dark_mode' ? 'Theme' : 'Email notifications'} preference has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating preferences",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    isLoadingPreferences,
    handlePreferencesUpdate
  };
};
