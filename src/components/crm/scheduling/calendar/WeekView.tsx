
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay
} from "date-fns";
import { Appointment } from "../AppointmentsList";
import { memo } from "react";

interface WeekViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  appointments: Appointment[];
  getAppointmentColorClass: (appointment: Appointment) => string;
}

export const WeekView = memo(({ 
  selectedDate, 
  setSelectedDate, 
  appointments,
  getAppointmentColorClass
}: WeekViewProps) => {
  // Generate weekly view days
  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    return eachDayOfInterval({ start, end: endOfWeek(selectedDate) });
  };

  // Check if appointment is on a specific date
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      isSameDay(apt.date, date)
    );
  };

  const weekDays = getWeekDays();

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day, i) => (
          <div 
            key={i} 
            className={`text-center py-2 font-medium ${
              isSameDay(day, new Date()) ? 'bg-blue-50' : ''
            }`}
          >
            <div>{format(day, "EEE")}</div>
            <div className={`text-lg ${isSameDay(day, selectedDate) ? 'text-blue-600 font-bold' : ''}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x h-[350px] overflow-y-auto">
        {weekDays.map((day, i) => {
          const dayAppointments = getAppointmentsForDate(day);
          
          return (
            <div 
              key={i} 
              className={`p-1 ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              {dayAppointments.length > 0 ? (
                <div className="space-y-1">
                  {dayAppointments.map(apt => (
                    <div 
                      key={apt.id} 
                      className={`px-2 py-1 rounded text-white text-xs ${getAppointmentColorClass(apt)}`}
                    >
                      <div className="font-medium truncate">{apt.time}</div>
                      <div className="truncate">{apt.clientName}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">No Events</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

WeekView.displayName = "WeekView";
