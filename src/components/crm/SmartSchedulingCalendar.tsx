
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarView } from "./scheduling/calendar/CalendarView";

export const SmartSchedulingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      title: "Client Meeting - John Smith",
      time: "10:00 AM",
      type: "meeting",
      client: "John Smith"
    },
    {
      id: 2,
      title: "Document Review",
      time: "2:00 PM", 
      type: "review",
      client: "Sarah Johnson"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Scheduling Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarView />
        </CardContent>
      </Card>
    </div>
  );
};
