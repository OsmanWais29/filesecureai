
import React from "react";
import { MeetingsList } from "./MeetingsList";
import { useMeetingManagement } from "@/hooks/useMeetingManagement";

export const MeetingsContainer = () => {
  const { meetings, isLoading } = useMeetingManagement();

  // Filter for scheduled and in-progress meetings only
  const activeMeetings = meetings.filter(meeting => 
    meeting.status === 'scheduled' || meeting.status === 'in_progress'
  );

  return (
    <MeetingsList
      meetings={activeMeetings}
      isLoading={isLoading}
    />
  );
};
