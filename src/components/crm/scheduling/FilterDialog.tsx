
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    showHighPriority: boolean;
    showMediumPriority: boolean;
    showRegularMeetings: boolean;
    showSelfBooked: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    showHighPriority: boolean;
    showMediumPriority: boolean;
    showRegularMeetings: boolean;
    showSelfBooked: boolean;
  }>>;
}

export function FilterDialog({ open, onOpenChange, filters, setFilters }: FilterDialogProps) {
  const handleFilterChange = (key: keyof typeof filters, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      showHighPriority: true,
      showMediumPriority: true,
      showRegularMeetings: true,
      showSelfBooked: true
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Appointments</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-priority">High Priority</Label>
            <Switch
              id="high-priority"
              checked={filters.showHighPriority}
              onCheckedChange={(checked) => handleFilterChange('showHighPriority', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="medium-priority">Medium Priority</Label>
            <Switch
              id="medium-priority"
              checked={filters.showMediumPriority}
              onCheckedChange={(checked) => handleFilterChange('showMediumPriority', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="regular-meetings">Regular Meetings</Label>
            <Switch
              id="regular-meetings"
              checked={filters.showRegularMeetings}
              onCheckedChange={(checked) => handleFilterChange('showRegularMeetings', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="self-booked">Self-Booked</Label>
            <Switch
              id="self-booked"
              checked={filters.showSelfBooked}
              onCheckedChange={(checked) => handleFilterChange('showSelfBooked', checked)}
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={resetFilters}>
            Reset All
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
