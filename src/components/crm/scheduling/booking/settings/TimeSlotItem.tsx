
import React, { memo } from "react";
import { Switch } from "@/components/ui/switch";
import { Clock } from "lucide-react";
import { TimeSlot } from "../types";

interface TimeSlotItemProps {
  slot: TimeSlot;
  onToggle: (id: string) => void;
}

export const TimeSlotItem: React.FC<TimeSlotItemProps> = memo(({ slot, onToggle }) => {
  return (
    <div 
      className={`flex items-center justify-between p-3 border rounded-md ${
        slot.enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center">
        <Clock className={`h-4 w-4 mr-2 ${slot.enabled ? 'text-green-500' : 'text-gray-400'}`} />
        <span className={slot.enabled ? 'font-medium' : 'text-muted-foreground'}>
          {slot.time}
        </span>
      </div>
      <Switch 
        checked={slot.enabled} 
        onCheckedChange={() => onToggle(slot.id)} 
      />
    </div>
  );
});

TimeSlotItem.displayName = "TimeSlotItem";
