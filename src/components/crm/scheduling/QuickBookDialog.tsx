
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

interface QuickBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickBookDialog({ open, onOpenChange }: QuickBookDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [clientName, setClientName] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  const handleBookAppointment = () => {
    if (!clientName || !meetingType || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(`Appointment booked for ${clientName} on ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
    
    // Reset form
    setClientName("");
    setMeetingType("");
    setSelectedTime("");
    setSelectedDate(new Date());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quick Book Appointment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="meeting-type">Meeting Type</Label>
            <Select value={meetingType} onValueChange={setMeetingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial-consultation">Initial Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up Meeting</SelectItem>
                <SelectItem value="document-review">Document Review</SelectItem>
                <SelectItem value="financial-review">Financial Review</SelectItem>
                <SelectItem value="signing">Document Signing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time-slot">Time Slot</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleBookAppointment}>
            Book Appointment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
