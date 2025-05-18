
import { Calendar } from "@/components/ui/calendar";
import { CalendarLegend } from "./CalendarLegend";
import { CalendarStats } from "./CalendarStats";
import { Appointment } from "../AppointmentsList";
import { memo, useMemo } from "react";

interface MonthViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  appointments: Appointment[];
  calendarView: "day" | "week" | "month";
}

export const MonthView = memo(({ 
  selectedDate, 
  setSelectedDate, 
  appointments,
  calendarView
}: MonthViewProps) => {
  // Memoize the calendar day content component to optimize rendering
  const calendarComponents = useMemo(() => ({
    DayContent: (props: { date: Date }) => {
      // Check if there are appointments on this date
      const hasAppointments = appointments.some(apt => 
        apt.date.getDate() === props.date.getDate() &&
        apt.date.getMonth() === props.date.getMonth() &&
        apt.date.getFullYear() === props.date.getFullYear()
      );

      // Check if there are high priority appointments
      const hasHighPriority = appointments.some(apt => 
        apt.date.getDate() === props.date.getDate() &&
        apt.date.getMonth() === props.date.getMonth() &&
        apt.date.getFullYear() === props.date.getFullYear() &&
        apt.priority === 'high'
      );

      return (
        <div className="relative">
          <div>{props.date.getDate()}</div>
          {hasAppointments && (
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-1 rounded-full ${hasHighPriority ? 'bg-red-500' : 'bg-blue-500'}`}></div>
          )}
        </div>
      );
    }
  }), [appointments]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      <div className="md:col-span-5">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border pointer-events-auto"
          components={calendarComponents}
        />
      </div>

      <div className="md:col-span-2 space-y-4">
        <CalendarLegend />
        <CalendarStats selectedDate={selectedDate} appointments={appointments} calendarView={calendarView} />
      </div>
    </div>
  );
});

MonthView.displayName = "MonthView";
