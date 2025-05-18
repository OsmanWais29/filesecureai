
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface FilterProps {
  showHighPriority: boolean;
  showMediumPriority: boolean;
  showRegularMeetings: boolean;
  showSelfBooked: boolean;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterProps;
  setFilters: React.Dispatch<React.SetStateAction<FilterProps>>;
}

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  setFilters
}: FilterDialogProps) {
  const handleFilterChange = (key: keyof FilterProps) => {
    setFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Filter Appointments</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-priority" className="flex-1">
              High priority appointments
            </Label>
            <Switch
              id="high-priority"
              checked={filters.showHighPriority}
              onCheckedChange={() => handleFilterChange('showHighPriority')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="medium-priority" className="flex-1">
              Medium priority appointments
            </Label>
            <Switch
              id="medium-priority"
              checked={filters.showMediumPriority}
              onCheckedChange={() => handleFilterChange('showMediumPriority')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="regular-meetings" className="flex-1">
              Regular meetings
            </Label>
            <Switch
              id="regular-meetings"
              checked={filters.showRegularMeetings}
              onCheckedChange={() => handleFilterChange('showRegularMeetings')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="self-booked" className="flex-1">
              Self-booked appointments
            </Label>
            <Switch
              id="self-booked"
              checked={filters.showSelfBooked}
              onCheckedChange={() => handleFilterChange('showSelfBooked')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
