
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { CalendarHeader } from './CalendarHeader';
import { useCalendarNavigation } from './useCalendarNavigation';
import { useAppointmentUtils } from './useAppointmentUtils';

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarView: 'month' | 'week' | 'day';
  setCalendarView: (view: 'month' | 'week' | 'day') => void;
  appointments: any[];
}

export const CalendarView = ({
  selectedDate,
  setSelectedDate,
  calendarView,
  setCalendarView,
  appointments
}: CalendarViewProps) => {
  const { handlePrevious, handleNext } = useCalendarNavigation(
    selectedDate,
    calendarView,
    setSelectedDate
  );
  
  const { getAppointmentColorClass } = useAppointmentUtils();

  return (
    <div className="space-y-4">
      <CalendarHeader
        selectedDate={selectedDate}
        calendarView={calendarView}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
      
      <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'month' | 'week' | 'day')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <MonthView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={appointments}
            calendarView={calendarView}
          />
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <WeekView
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            appointments={appointments}
            getAppointmentColorClass={getAppointmentColorClass}
          />
        </TabsContent>

        <TabsContent value="day" className="space-y-4">
          <DayView
            selectedDate={selectedDate}
            appointments={appointments}
            getAppointmentColorClass={getAppointmentColorClass}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
