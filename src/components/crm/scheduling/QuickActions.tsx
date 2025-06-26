
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, Mail, FileText, Clock, Users, Plus } from "lucide-react";
import { toast } from "sonner";

export function QuickActions() {
  const handleQuickAction = (action: string) => {
    toast.success(`${action} initiated`);
  };

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Schedule Appointment")}
      >
        <Calendar className="h-4 w-4" />
        Schedule Appointment
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Call Client")}
      >
        <Phone className="h-4 w-4" />
        Call Client
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Send Email")}
      >
        <Mail className="h-4 w-4" />
        Send Email
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Generate Report")}
      >
        <FileText className="h-4 w-4" />
        Generate Report
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Block Time")}
      >
        <Clock className="h-4 w-4" />
        Block Time
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Group Meeting")}
      >
        <Users className="h-4 w-4" />
        Group Meeting
      </Button>
      
      <Button 
        className="w-full justify-start gap-2"
        onClick={() => handleQuickAction("Add New Client")}
      >
        <Plus className="h-4 w-4" />
        Add New Client
      </Button>
    </div>
  );
}
