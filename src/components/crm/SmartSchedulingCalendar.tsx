
import React, { useState } from 'react';
import { CalendarView } from './scheduling/calendar/CalendarView';

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
      status: "confirmed"
    },
    {
      id: 2,
      title: "Document Review - Sarah Wilson",
      time: "2:00 PM",
      type: "review",
      status: "pending"
    }
  ];

  return (
    <CalendarView
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      calendarView={calendarView}
      setCalendarView={setCalendarView}
      appointments={appointments}
    />
  );
};
