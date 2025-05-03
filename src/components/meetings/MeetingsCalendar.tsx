
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';

export const MeetingsCalendar: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meeting Calendar</h2>
        <Button variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Calendar
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Monthly Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="font-medium">Initial Consultation</div>
                  <div className="text-sm text-muted-foreground mt-1">Today, 2:00 PM</div>
                  <div className="text-sm text-muted-foreground">John Doe</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">Financial Review</div>
                  <div className="text-sm text-muted-foreground mt-1">Tomorrow, 10:00 AM</div>
                  <div className="text-sm text-muted-foreground">Jane Smith</div>
                </div>
                
                <div className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">Document Signing</div>
                  <div className="text-sm text-muted-foreground mt-1">May 5, 3:30 PM</div>
                  <div className="text-sm text-muted-foreground">Michael Brown</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Daily Schedule</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-muted-foreground">
                {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex border-l-2 border-primary pl-4 py-2">
                  <div className="w-20 text-muted-foreground">9:00 AM</div>
                  <div className="flex-1 bg-primary/10 p-2 rounded-lg">
                    <div className="font-medium">Team Meeting</div>
                    <div className="text-sm text-muted-foreground">Daily Standup</div>
                  </div>
                </div>
                
                <div className="flex border-l-2 border-transparent pl-4 py-2">
                  <div className="w-20 text-muted-foreground">10:00 AM</div>
                  <div className="flex-1"></div>
                </div>
                
                <div className="flex border-l-2 border-secondary pl-4 py-2">
                  <div className="w-20 text-muted-foreground">11:00 AM</div>
                  <div className="flex-1 bg-secondary/10 p-2 rounded-lg">
                    <div className="font-medium">Client Intake</div>
                    <div className="text-sm text-muted-foreground">New Client - Jane Smith</div>
                  </div>
                </div>
                
                <div className="flex border-l-2 border-transparent pl-4 py-2">
                  <div className="w-20 text-muted-foreground">12:00 PM</div>
                  <div className="flex-1 p-2 italic text-muted-foreground">Lunch Break</div>
                </div>
                
                <div className="flex border-l-2 border-primary pl-4 py-2">
                  <div className="w-20 text-muted-foreground">2:00 PM</div>
                  <div className="flex-1 bg-primary/10 p-2 rounded-lg">
                    <div className="font-medium">Initial Consultation</div>
                    <div className="text-sm text-muted-foreground">John Doe</div>
                  </div>
                </div>
                
                <div className="flex border-l-2 border-transparent pl-4 py-2">
                  <div className="w-20 text-muted-foreground">3:00 PM</div>
                  <div className="flex-1"></div>
                </div>
                
                <div className="flex border-l-2 border-secondary pl-4 py-2">
                  <div className="w-20 text-muted-foreground">4:00 PM</div>
                  <div className="flex-1 bg-secondary/10 p-2 rounded-lg">
                    <div className="font-medium">Document Review</div>
                    <div className="text-sm text-muted-foreground">Michael Brown</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
