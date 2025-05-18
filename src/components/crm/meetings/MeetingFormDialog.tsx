
import React, { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { MeetingData } from "@/hooks/useMeetingManagement";
import { Loader2, CalendarCheck } from "lucide-react";
import { useClientManagement } from "@/hooks/useClientManagement";

interface MeetingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<MeetingData>) => void;
  meeting?: MeetingData;
  isSubmitting: boolean;
  title: string;
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  onSave,
  meeting,
  isSubmitting,
  title
}: MeetingFormDialogProps) {
  const { register, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<Partial<MeetingData>>();
  const { clients, isLoading: isLoadingClients } = useClientManagement();
  
  const startTime = watch('start_time');

  // Reset form when dialog opens/closes or meeting changes
  useEffect(() => {
    if (open) {
      if (meeting) {
        // Format ISO dates to datetime-local input format
        const formattedMeeting = {
          ...meeting,
          start_time: meeting.start_time ? new Date(meeting.start_time).toISOString().slice(0, 16) : '',
          end_time: meeting.end_time ? new Date(meeting.end_time).toISOString().slice(0, 16) : ''
        };
        reset(formattedMeeting);
      } else {
        // Set default meeting duration to 1 hour from now
        const now = new Date();
        const oneHourLater = new Date(now);
        oneHourLater.setHours(oneHourLater.getHours() + 1);
        
        reset({
          title: '',
          description: '',
          status: 'scheduled',
          meeting_type: 'consultation',
          location: 'Virtual',
          start_time: now.toISOString().slice(0, 16),
          end_time: oneHourLater.toISOString().slice(0, 16)
        });
      }
    }
  }, [open, meeting, reset]);
  
  // When start time changes, update end time to be 1 hour later if not already set
  useEffect(() => {
    if (startTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);
      setValue('end_time', endDate.toISOString().slice(0, 16));
    }
  }, [startTime, setValue]);
  
  const onSubmit = (data: Partial<MeetingData>) => {
    onSave(data);
  };

  const meetingTypes = [
    { value: 'consultation', label: 'Initial Consultation' },
    { value: 'followup', label: 'Follow-up Meeting' },
    { value: 'document_review', label: 'Document Review' },
    { value: 'court_preparation', label: 'Court Preparation' },
    { value: 'closing', label: 'Closing Meeting' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="required">Title</Label>
              <Input
                id="title"
                {...register("title", { required: "Meeting title is required" })}
                placeholder="Enter meeting title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Enter meeting agenda or description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="required">Start Time</Label>
                <Input
                  id="start_time"
                  type="datetime-local"
                  {...register("start_time", { required: "Start time is required" })}
                  className={errors.start_time ? "border-red-500" : ""}
                />
                {errors.start_time && <p className="text-red-500 text-xs">{errors.start_time.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time" className="required">End Time</Label>
                <Input
                  id="end_time"
                  type="datetime-local"
                  {...register("end_time", { required: "End time is required" })}
                  className={errors.end_time ? "border-red-500" : ""}
                />
                {errors.end_time && <p className="text-red-500 text-xs">{errors.end_time.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_type">Meeting Type</Label>
              <Select
                onValueChange={(value) => setValue("meeting_type", value)}
                defaultValue={meeting?.meeting_type || 'consultation'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meeting type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Virtual or meeting location"
                defaultValue="Virtual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(value) => setValue("status", value as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled')}
                defaultValue={meeting?.status || 'scheduled'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_id">Associated Client</Label>
              <Select
                onValueChange={(value) => setValue("client_id", value)}
                defaultValue={meeting?.client_id || ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
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
                  Saving...
                </>
              ) : (
                'Save Meeting'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
