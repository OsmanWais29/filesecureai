
import { useState } from "react";
import { UpcomingMeetings } from "./UpcomingMeetings";
import { JoinMeetingPanel } from "./JoinMeetingPanel";
import { MeetingNotes } from "./MeetingNotes";
import { MeetingAgenda } from "./MeetingAgenda";
import { MeetingAnalytics } from "./MeetingAnalytics";
import { MeetingReviewForm } from "./MeetingReviewForm";
import { MeetingFeedbackDialog } from "./feedback/MeetingFeedbackDialog";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAnalytics } from "@/hooks/useEnhancedAnalytics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { HotkeysProvider } from "@/hooks/useHotkeys";

export const MeetingsDashboard = () => {
  const [isActiveCall, setIsActiveCall] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const { toast } = useToast();
  const analytics = useEnhancedAnalytics({ pageName: "Meetings" });

  const openNotesWindow = () => {
    const features = 'width=800,height=700,resizable=yes,scrollbars=yes';
    const notesWindow = window.open('/meetings/notes', 'meetingNotes', features);
    
    if (notesWindow) {
      notesWindow.focus();
      // Store current notes in localStorage to make them available in the new window
      const currentNotes = localStorage.getItem('meeting-notes');
      if (currentNotes) {
        localStorage.setItem('standalone-notes', currentNotes);
      }
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to open the notes in a new window.",
        variant: "destructive"
      });
    }
  };

  const openAgendaWindow = () => {
    const features = 'width=500,height=700,resizable=yes,scrollbars=yes';
    const agendaWindow = window.open('/meetings/agenda', 'meetingAgenda', features);
    
    if (agendaWindow) {
      agendaWindow.focus();
    } else {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to open the agenda in a new window.",
        variant: "destructive"
      });
    }
  };

  const startActiveCallMode = () => {
    setIsActiveCall(true);
    openNotesWindow();
    openAgendaWindow();
    
    toast({
      title: "Meeting Mode Activated",
      description: "Meeting tools opened in separate windows for easy access during your call."
    });
  };

  const endActiveCallMode = () => {
    setIsActiveCall(false);
    setShowReviewDialog(true);
  };

  const handleReviewComplete = () => {
    setShowReviewDialog(false);
    
    // After review completion, show a toast about analytics updates
    toast({
      title: "Analytics Updated",
      description: "Meeting data has been processed. View the Analytics tab to see insights."
    });
    
    // Prompt for client feedback
    setTimeout(() => {
      setShowFeedbackDialog(true);
    }, 1000);
  };

  const handleRequestFeedback = () => {
    setShowFeedbackDialog(true);
    
    toast({
      title: "Feedback Request",
      description: "A feedback form has been opened. You can also send this to the client via email."
    });
  };

  return (
    <HotkeysProvider>
      <div className="space-y-6 relative">
        {isActiveCall ? (
          <div className="bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Active Meeting in Progress</h3>
                <p className="text-sm text-muted-foreground">Meeting tools are available in separate windows.</p>
              </div>
              <Button variant="outline" onClick={endActiveCallMode}>
                End Meeting
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end mb-4">
            <Button onClick={startActiveCallMode} className="gap-2">
              <span>Start Meeting Mode</span>
            </Button>
          </div>
        )}
        
        {/* Meeting Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="sm:max-w-xl">
            <MeetingReviewForm 
              meetingId="recent-meeting-123"
              meetingTitle="Weekly Team Sync"
              onComplete={handleReviewComplete}
            />
          </DialogContent>
        </Dialog>
        
        {/* Meeting Feedback Dialog */}
        <MeetingFeedbackDialog
          open={showFeedbackDialog}
          onOpenChange={setShowFeedbackDialog}
          meetingId="recent-meeting-123"
          meetingTitle="Weekly Team Sync"
          clientName="John Smith"
        />
      </div>
    </HotkeysProvider>
  );
};
