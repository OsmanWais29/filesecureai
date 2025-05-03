
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface MeetingsHeaderProps {
  onStartMeetingMode?: () => void;
  isActiveCall?: boolean;
}

export const MeetingsHeader = ({ 
  onStartMeetingMode, 
  isActiveCall = false
}: MeetingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold">Meetings</h2>
        <p className="text-muted-foreground">Schedule and manage client meetings</p>
      </div>
      
      <div className="flex gap-2">
        {!isActiveCall && (
          <Button onClick={onStartMeetingMode} className="gap-2">
            <Video className="h-4 w-4" />
            <span>Start Meeting</span>
          </Button>
        )}
      </div>
    </div>
  );
};
