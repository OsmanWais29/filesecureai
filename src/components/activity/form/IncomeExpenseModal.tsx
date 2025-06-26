
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { IncomeExpenseForm } from "../IncomeExpenseForm";
import { Client } from "../types";

interface IncomeExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (clientId: string, clientName: string) => void;
}

export const IncomeExpenseModal = ({ 
  open, 
  onOpenChange, 
  onClientCreated 
}: IncomeExpenseModalProps) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Mock client for demonstration - in real app this would come from client selection
  const mockClient: Client = {
    id: "demo-client-1",
    name: "John Doe",
    status: "active",
    last_activity: "2024-03-15"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            📊 Income & Expense Form
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <IncomeExpenseForm selectedClient={mockClient} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
