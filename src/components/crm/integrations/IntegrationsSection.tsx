
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { APIIntegration, IntegrationProvider } from "./types";
import { IntegrationCard } from "./components/IntegrationCard";
import { AddIntegrationDialog } from "./components/AddIntegrationDialog";

import { sfaiFunctions } from "@/lib/sfaiFunctions";
export const IntegrationsSection = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<APIIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to match our APIIntegration interface
      const typedIntegrations: APIIntegration[] = data?.map(integration => ({
        ...integration,
        metadata: integration.metadata as Record<string, any> ?? {},
        settings: integration.settings as Record<string, any> ?? {},
        last_sync_at: integration.last_sync_at ?? null,
      })) ?? [];

      setActiveIntegrations(typedIntegrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load integrations.",
      });
    }
  };

  const handleIntegrationSetup = async (
    provider: IntegrationProvider,
    formData: Record<string, string>
  ) => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Not authenticated");
      }

      // First, store the integration in our database
      const { data: integration, error: dbError } = await supabase
        .from('api_integrations')
        .insert({
          provider_name: provider.id,
          api_key: formData.api_key,
          settings: formData,
          user_id: session.session.user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Then, call our edge function to handle the API-specific setup
      const response = await sfaiFunctions.invoke('handle-integration', {
        body: {
          provider: provider.id,
          action: 'setup',
          integrationId: integration.id,
        },
      });

      if (response.error) throw response.error;

      await fetchIntegrations();

      toast({
        title: "Integration Added",
        description: `${provider.name} has been successfully integrated.`,
      });
    } catch (error) {
      console.error('Error setting up integration:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to setup integration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Integrations</h2>
        <AddIntegrationDialog onSetup={handleIntegrationSetup} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeIntegrations.map((integration) => (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onRefresh={fetchIntegrations}
          />
        ))}
      </div>
    </div>
  );
};
