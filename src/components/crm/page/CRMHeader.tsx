
import { Button } from "@/components/ui/button";
import { UserPlus, Search } from "lucide-react";

interface CRMHeaderProps {
  openClientDialog: () => void;
}

export function CRMHeader({ openClientDialog }: CRMHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Client Relationship Management</h1>
        <p className="text-muted-foreground">Manage your clients, interactions, and tasks</p>
      </div>
      <Button onClick={openClientDialog} className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        Add New Client
      </Button>
    </div>
  );
}
