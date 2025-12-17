import { useState } from "react";
import { User, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClientListItem } from "./ClientListItem";
import { AddClientModal } from "@/components/client/AddClientModal";

interface Client {
  id: string;
  name: string;
}

interface ClientSectionProps {
  clients: Client[];
  onClientSelect: (clientId: string) => void;
  onClientViewerAccess: (clientId: string) => void;
  selectedClientId?: string;
  className?: string;
  onClientCreated?: (clientId: string) => void;
}

export const ClientSection = ({ 
  clients, 
  onClientSelect, 
  onClientViewerAccess,
  selectedClientId,
  className,
  onClientCreated
}: ClientSectionProps) => {
  const [showAddModal, setShowAddModal] = useState(false);

  // Create a Map to deduplicate clients by ID
  const uniqueClients = new Map<string, Client>();
  clients.forEach(client => {
    if (!uniqueClients.has(client.id)) {
      uniqueClients.set(client.id, client);
    }
  });
  
  // Convert Map back to array and sort by name
  const deduplicatedClients = Array.from(uniqueClients.values())
    .sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className={cn("h-full border-r bg-background/95 w-56 shrink-0", className)}>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-medium flex items-center">
          <User className="h-4 w-4 mr-1.5" />
          Clients
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
            {deduplicatedClients.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setShowAddModal(true)}
            title="Add Client"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-12rem)]">
        {deduplicatedClients.length > 0 ? (
          <div className="py-1">
            {deduplicatedClients.map((client) => (
              <ClientListItem
                key={client.id}
                client={client}
                isSelected={selectedClientId === client.id}
                onSelect={onClientSelect}
                onViewerAccess={onClientViewerAccess}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 p-4 gap-2">
            <p className="text-sm text-muted-foreground">No clients found</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Client
            </Button>
          </div>
        )}
      </ScrollArea>

      <AddClientModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onClientCreated={(clientId) => {
          onClientCreated?.(clientId);
        }}
      />
    </div>
  );
};
