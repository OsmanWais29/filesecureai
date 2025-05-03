import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Mic, MicOff, ExternalLink } from "lucide-react";
import { useTranscription } from "./notes/useTranscription";
import { Badge } from "@/components/ui/badge";
import { NotesControls } from "./notes/NotesControls";

interface MeetingNotesProps {
  clientName?: string;
}

export const MeetingNotes = ({ clientName }: MeetingNotesProps) => {
  const {
    isRecording,
    transcription,
    summary,
    actionItems,
    activeTab,
    setActiveTab,
    toggleRecording,
    saveNotes,
    printNotes,
    exportPdf,
    exportNotes,
    contentRef
  } = useTranscription();

  return (
    <div className="space-y-6" ref={contentRef}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Meeting Notes</h2>
          <p className="text-sm text-muted-foreground">
            {clientName ? `Record and transcribe meetings with ${clientName}` : "Record and transcribe meetings, generate summaries and action items"}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={isRecording ? "destructive" : "default"}
            onClick={toggleRecording}
            className="flex items-center gap-1"
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Start Recording
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('/meetings/notes-standalone', '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-4 w-4" />
            Pop Out
          </Button>
        </div>
      </div>
      
      {isRecording && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-600 font-medium text-sm">Recording in progress</span>
            </div>
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
              Live Transcription
            </Badge>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transcription" className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Meeting Transcription
              </CardTitle>
              <CardDescription>
                Full meeting transcript with speaker identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transcription ? (
                <div className="whitespace-pre-line">
                  {transcription}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isRecording ? "Recording in progress. Transcription will appear here..." : 
                      "No transcription available. Start recording to begin transcription."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle>Meeting Summary</CardTitle>
              <CardDescription>
                AI-generated summary of key discussion points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {summary ? (
                <p>{summary}</p>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isRecording ? "Summary will be generated after recording is stopped." : 
                      "No summary available. Complete a recording to generate a summary."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="action-items" className="space-y-4">
          <Card className="min-h-[400px]">
            <CardHeader className="pb-3">
              <CardTitle>Action Items</CardTitle>
              <CardDescription>
                Tasks and follow-ups identified from the meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionItems && actionItems.length > 0 ? (
                <ul className="space-y-2">
                  {actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 border rounded-md">
                      <div className="h-5 w-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs">
                        {index + 1}
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isRecording ? "Action items will be generated after recording is stopped." : 
                      "No action items available. Complete a recording to generate action items."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {(transcription || summary || (actionItems && actionItems.length > 0)) && (
        <NotesControls 
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          hasTranscription={!!transcription}
          onExportNotes={exportNotes}
          onSaveNotes={saveNotes}
          onPrintNotes={printNotes}
          onExportPdf={exportPdf}
        />
      )}
    </div>
  );
};
