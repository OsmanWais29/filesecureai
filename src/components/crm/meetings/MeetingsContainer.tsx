
import React, { useState } from "react";
import { MeetingsList } from "./MeetingsList";
import { MeetingFormDialog } from "./MeetingFormDialog";
import { useMeetingManagement, MeetingData } from "@/hooks/useMeetingManagement";
import { toast } from "sonner";

export const MeetingsContainer = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingData | null>(null);

  const {
    meetings,
    isLoading,
    createMeeting,
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

  const handleStatusChange = async (meetingId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled') => {
    try {
      await updateMeeting(meetingId, { status });
      toast.success("Meeting status updated");
    } catch (error) {
      toast.error("Failed to update meeting status");
    }
  };

  const handleFormSubmit = async (data: Partial<MeetingData>) => {
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, data);
        toast.success("Meeting updated successfully");
      } else {
        await createMeeting(data);
        toast.success("Meeting created successfully");
      }
      setIsFormOpen(false);
      setEditingMeeting(null);
    } catch (error) {
      toast.error("Failed to save meeting");
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
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMeeting(null);
        }}
        onSubmit={handleFormSubmit}
        meeting={editingMeeting}
      />
    </>
  );
};
