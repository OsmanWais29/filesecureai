import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, AlertCircle, Search, Plus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { AddClientModal } from "@/components/client/AddClientModal";

interface Client {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending" | "flagged";
  location?: string;
  lastActivity?: string;
  needsAttention?: boolean;
}

interface ClientListProps {
  clients: Client[];
  selectedClientId?: string;
  onClientSelect?: (clientId: string) => void;
  onClientCreated?: (clientId: string) => void;
}

export const ClientList = ({ clients, selectedClientId, onClientSelect, onClientCreated }: ClientListProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter clients based on search query
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectClient = (clientId: string) => {
    console.log("ClientList: Selected client ID:", clientId);
    toast.info(`Loading client: ${clientId}`);
    
    if (onClientSelect) {
      onClientSelect(clientId);
    } else {
      console.log("Navigating to client viewer:", `/client-viewer/${clientId}`);
      navigate(`/client-viewer/${clientId}`);
    }
  };

  const handleClientCreated = (clientId: string) => {
    toast.success("Client created successfully!");
    onClientCreated?.(clientId);
  };
  
  return (
    <div className="h-full border-r flex flex-col">
      <div className="px-4 py-2 border-b bg-muted/30 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="text-xs text-muted-foreground">Select a client to view their documents</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="h-8"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {/* Search Input */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 py-1"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <Card 
                key={client.id}
                className={cn(
                  "p-3 cursor-pointer hover:border-primary/50 transition-colors",
                  selectedClientId === client.id && "bg-muted border-primary"
                )}
                onClick={() => handleSelectClient(client.id)}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{client.name}</div>
                    {client.status && (
                      <Badge 
                        variant={
                          client.status === "active" ? "default" : 
                          client.status === "pending" ? "outline" :
                          client.status === "flagged" ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {client.status}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{client.location || "Unknown location"}</span>
                    {client.lastActivity && (
                      <span className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {client.lastActivity}
                      </span>
                    )}
                  </div>
                  
                  {client.needsAttention && (
                    <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Needs attention</span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground space-y-4">
              <p>{searchQuery ? "No matching clients found" : "No clients found"}</p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <AddClientModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
};
