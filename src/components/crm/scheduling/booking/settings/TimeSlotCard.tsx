
import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { TimeSlotItem } from "./TimeSlotItem";
import { TimeSlot } from "../types";
import { CustomTimeSlotDialog } from "./CustomTimeSlotDialog";

interface TimeSlotCardProps {
  availableTimeSlots: TimeSlot[];
  toggleTimeSlot: (id: string) => void;
  handleSyncCalendar: () => void;
  isCustomTimeSlotDialogOpen: boolean;
  setIsCustomTimeSlotDialogOpen: (open: boolean) => void;
  addTimeSlot: (time: string) => void;
}

export const TimeSlotCard: React.FC<TimeSlotCardProps> = memo(({
  availableTimeSlots,
  toggleTimeSlot,
  handleSyncCalendar,
  isCustomTimeSlotDialogOpen,
  setIsCustomTimeSlotDialogOpen,
  addTimeSlot
}) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Available Time Slots</h3>
          <Button variant="outline" size="sm" onClick={handleSyncCalendar}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Sync with Calendar
          </Button>
        </div>
        
        <div className="space-y-3">
          {availableTimeSlots.map(slot => (
            <TimeSlotItem 
              key={slot.id} 
              slot={slot}
              onToggle={toggleTimeSlot}
            />
          ))}
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsCustomTimeSlotDialogOpen(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Add Custom Time Slot
          </Button>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Staff Availability</h4>
          <div className="text-xs text-muted-foreground mb-2">
            Configure individual availability for each staff member:
          </div>
          <Button size="sm" variant="outline" className="w-full">
            Manage Staff Availability
          </Button>
        </div>

        <CustomTimeSlotDialog
          open={isCustomTimeSlotDialogOpen}
          onOpenChange={setIsCustomTimeSlotDialogOpen}
          onAddTimeSlot={addTimeSlot}
        />
      </CardContent>
    </Card>
  );
});

TimeSlotCard.displayName = "TimeSlotCard";
