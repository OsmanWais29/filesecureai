
import React, { useState } from "react";
import { MeetingsList } from "./MeetingsList";
import { MeetingFormDialog } from "./MeetingFormDialog";
import { useMeetingManagement, MeetingData } from "@/hooks/useMeetingManagement";
import { toast } from "sonner";

export const MeetingsContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    meetings,
    isLoading,
    addMeeting,
    updateMeeting,
    deleteMeeting
  } = useMeetingManagement();

  const handleAdd = () => {
    setEditingMeeting(null);
    setIsFormOpen(true);
  };

  const handleEdit = (meeting: MeetingData) => {
    setEditingMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleDelete = async (meeting: MeetingData) => {
    try {
      await deleteMeeting(meeting.id);
      toast.success("Meeting deleted successfully");
    } catch (error) {
      toast.error("Failed to delete meeting");
    }
  };

  const handleStatusChange = async (meetingId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateMeeting(meetingId, { status });
      toast.success("Meeting status updated");
    } catch (error) {
      toast.error("Failed to update meeting status");
    }
  };

  const handleFormSubmit = async (data: Partial<MeetingData>) => {
    setIsSubmitting(true);
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, data);
        toast.success("Meeting updated successfully");
      } else {
        await addMeeting(data as Omit<MeetingData, 'id' | 'created_at' | 'updated_at'>);
        toast.success("Meeting created successfully");
      }
      setIsFormOpen(false);
      setEditingMeeting(null);
    } catch (error) {
      toast.error("Failed to save meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MeetingsList
        meetings={meetings}
        isLoading={isLoading}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
      
      <MeetingFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingMeeting(null);
          }
        }}
        onSave={handleFormSubmit}
        meeting={editingMeeting || undefined}
        isSubmitting={isSubmitting}
        title={editingMeeting ? "Edit Meeting" : "Create Meeting"}
      />
    </>
  );
};
