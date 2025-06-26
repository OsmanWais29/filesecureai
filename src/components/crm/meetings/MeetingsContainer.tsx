
import React from "react";
import { MeetingsList } from "./MeetingsList";
import { useMeetingManagement } from "@/hooks/useMeetingManagement";

export const MeetingsContainer = () => {
  const { meetings, isLoading } = useMeetingManagement();

  // Filter for scheduled and in-progress meetings only
  const activeMeetings = meetings?.filter(meeting => 
    meeting.status === 'scheduled' || meeting.status === 'in_progress'
  ) || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Client Meetings</h2>
          <p className="text-gray-600 mt-1">Join meetings and share links with your clients</p>
        </div>
      </div>
      
      <MeetingsList
        meetings={activeMeetings}
        isLoading={isLoading}
      />
    </div>
  );
};
