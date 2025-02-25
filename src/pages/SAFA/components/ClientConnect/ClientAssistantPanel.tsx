
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, MessageSquare, History, Mail, Phone } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Client } from "../../types/client";
import { ClientOverview } from "./ClientOverview";

interface ClientAssistantPanelProps {
  onStartConversation: () => void;
  onViewHistory: () => void;
}

export const ClientAssistantPanel = ({
  onStartConversation,
  onViewHistory
}: ClientAssistantPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const { toast } = useToast();

  const handleStartConversation = async () => {
    if (!selectedClient) {
      toast({
        title: "No Client Selected",
        description: "Please select a client to start a conversation.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Initialize conversation in database
      const { error } = await supabase
        .from('conversations')
        .insert([{ 
          type: 'client_connect',
          status: 'active',
          created_at: new Date().toISOString(),
          metadata: { client_id: selectedClient.id }
        }]);

      if (error) throw error;
      
      // Update client's last interaction
      await supabase
        .from('clients')
        .update({ last_interaction: new Date().toISOString() })
        .eq('id', selectedClient.id);

      onStartConversation();
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start conversation. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = async () => {
    if (!selectedClient) {
      toast({
        title: "No Client Selected",
        description: "Please select a client to view history.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const [conversationsResponse, interactionsResponse] = await Promise.all([
        supabase
          .from('conversations')
          .select('*')
          .eq('type', 'client_connect')
          .contains('metadata', { client_id: selectedClient.id })
          .order('created_at', { ascending: false }),
        supabase
          .from('client_interactions')
          .select('*')
          .eq('client_id', selectedClient.id)
          .order('created_at', { ascending: false })
      ]);

      if (conversationsResponse.error) throw conversationsResponse.error;
      if (interactionsResponse.error) throw interactionsResponse.error;

      onViewHistory();
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load conversation history. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedClient) {
    return <ClientOverview onSelectClient={setSelectedClient} />;
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Client Assistant</h2>
        </div>
        <Button variant="outline" onClick={() => setSelectedClient(null)}>
          Back to Clients
        </Button>
      </div>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{selectedClient.name}</h3>
            <div className={`px-2 py-1 rounded-full text-sm ${
              selectedClient.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {selectedClient.status}
            </div>
          </div>

          <div className="space-y-2">
            {selectedClient.email && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                {selectedClient.email}
              </div>
            )}
            {selectedClient.phone && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                {selectedClient.phone}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              size="lg" 
              className="w-full"
              onClick={handleStartConversation}
              disabled={isLoading}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              {isLoading ? "Starting..." : "Start Conversation"}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={handleViewHistory}
              disabled={isLoading}
            >
              <History className="mr-2 h-5 w-5" />
              {isLoading ? "Loading..." : "View Conversation History"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex-1">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <ScrollArea className="h-[calc(100vh-500px)]">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Loading recent client activity...
            </p>
          </Card>
        </ScrollArea>
      </div>
    </div>
  );
};
