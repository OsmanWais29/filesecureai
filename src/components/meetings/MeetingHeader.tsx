
import { Button } from "@/components/ui/button";
import { Video, Clock, Calendar } from "lucide-react";

interface MeetingHeaderProps {
  isActiveCall: boolean;
  onStartMeetingMode: () => void;
  onEndMeeting: () => void;
  onRequestFeedback: () => void;
}

export const MeetingHeader = ({
  isActiveCall,
  onStartMeetingMode,
  onEndMeeting,
  onRequestFeedback
}: MeetingHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {isActiveCall ? (
        <div className="flex items-center gap-4 w-full">
          <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 p-3 rounded-lg flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 p-2 rounded-full">
                  <Video className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div>
                  <h3 className="font-medium">Active Meeting in Progress</h3>
                  <p className="text-sm text-muted-foreground">Meeting in progress</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="destructive" size="sm" onClick={onEndMeeting}>
                  End Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h1 className="text-3xl font-bold mb-1">Meetings</h1>
            <p className="text-muted-foreground">Schedule and manage client meetings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule</span>
            </Button>
            <Button className="gap-2" onClick={onStartMeetingMode}>
              <Video className="h-4 w-4" />
              <span>Start Meeting</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
