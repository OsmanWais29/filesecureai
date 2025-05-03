
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, Plus, Video } from 'lucide-react';

interface MeetingsSchedulerProps {
  clientName: string;
}

export const MeetingsScheduler: React.FC<MeetingsSchedulerProps> = ({ clientName }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedule Meeting</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Meeting
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Schedule a meeting with {clientName}</CardTitle>
            <CardDescription>
              Choose a meeting type and select available time slots
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer border-2 hover:border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Initial Consultation</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">30 minutes</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Video call</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">Select</Button>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer border-2 hover:border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Document Review</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">45 minutes</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Video call</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">Select</Button>
                </CardFooter>
              </Card>
              
              <Card className="cursor-pointer border-2 hover:border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Financial Assessment</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">60 minutes</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">In person</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full">Select</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
