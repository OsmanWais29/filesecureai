
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CalendarPlus, 
  ListPlus, 
  Mail, 
  Phone
} from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="outline" className="flex flex-col h-auto py-4 gap-2">
        <UserPlus className="h-5 w-5 text-blue-500" />
        <span className="text-xs">Add Client</span>
      </Button>
      
      <Button variant="outline" className="flex flex-col h-auto py-4 gap-2">
        <CalendarPlus className="h-5 w-5 text-green-500" />
        <span className="text-xs">Schedule</span>
      </Button>
      
      <Button variant="outline" className="flex flex-col h-auto py-4 gap-2">
        <ListPlus className="h-5 w-5 text-amber-500" />
        <span className="text-xs">New Task</span>
      </Button>
      
      <Button variant="outline" className="flex flex-col h-auto py-4 gap-2">
        <Mail className="h-5 w-5 text-purple-500" />
        <span className="text-xs">Send Email</span>
      </Button>
      
      <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 col-span-2">
        <Phone className="h-5 w-5 text-red-500" />
        <span className="text-xs">Log Call</span>
      </Button>
    </div>
  );
}
