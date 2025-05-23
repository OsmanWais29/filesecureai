
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle, Phone, Mail, Calendar, ChevronRight } from "lucide-react";
import { Client } from "../../types/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { convertClientArray } from "@/utils/typeGuards";

interface ClientOverviewProps {
  onSelectClient: (client: Client) => void;
}

export const ClientOverview = ({ onSelectClient }: ClientOverviewProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('last_interaction', { ascending: false });

      if (error) throw error;

      const safeClients = convertClientArray(data || []);
      setClients(safeClients);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load client list."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Clients</h2>
        <Button variant="outline">Add New Client</Button>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {clients.map((client) => (
            <Card 
              key={client.id}
              className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => onSelectClient(client)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground space-x-4">
                      {client.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      Engagement Score: {client.engagement_score.toFixed(1)}
                    </div>
                    {client.last_interaction && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(client.last_interaction).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
