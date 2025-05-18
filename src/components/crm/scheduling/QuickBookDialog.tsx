
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClientManagement } from "@/hooks/useClientManagement";
import { useMeetingManagement } from "@/hooks/useMeetingManagement";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays, format } from "date-fns";
import { Loader2 } from "lucide-react";

interface QuickBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickBookDialog({
  open,
  onOpenChange
}: QuickBookDialogProps) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [appointmentType, setAppointmentType] = useState("consultation");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { clients } = useClientManagement();
  const { addMeeting } = useMeetingManagement();

  useEffect(() => {
    if (open) {
      // Set default date to tomorrow
      const tomorrow = addDays(new Date(), 1);
      setAppointmentDate(format(tomorrow, 'yyyy-MM-dd'));
      
      // Reset form
      setTitle("");
      setClientId("");
      setAppointmentType("consultation");
      setAppointmentTime("10:00");
      setDuration("60");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Calculate start and end times
      const startDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(startDateTime.getMinutes() + parseInt(duration));
      
      // Create meeting object
      const meetingData = {
        title: title || getDefaultTitle(),
        client_id: clientId || undefined,
        meeting_type: appointmentType,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'scheduled' as const,
        location: 'Virtual'
      };
      
      // Add meeting
      await addMeeting(meetingData);
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getDefaultTitle = (): string => {
    const typeLabels: Record<string, string> = {
      consultation: "Initial Consultation",
      followup: "Follow-up Meeting",
      document_review: "Document Review",
      court_preparation: "Court Preparation",
      closing: "Closing Meeting",
      other: "Meeting"
    };
    
    const typeLabel = typeLabels[appointmentType] || "Meeting";
    
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        return `${typeLabel} with ${client.name}`;
      }
    }
    
    return typeLabel;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Book Appointment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client (optional)</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Initial Consultation</SelectItem>
                  <SelectItem value="followup">Follow-up Meeting</SelectItem>
                  <SelectItem value="document_review">Document Review</SelectItem>
                  <SelectItem value="court_preparation">Court Preparation</SelectItem>
                  <SelectItem value="closing">Closing Meeting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={getDefaultTitle()}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank for automatic title based on appointment type and client
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                'Schedule Appointment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
