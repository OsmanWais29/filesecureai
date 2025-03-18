
import { isSameDay } from "date-fns";
import { Appointment } from "../AppointmentsList";

interface DayViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  getAppointmentColorClass: (appointment: Appointment) => string;
}

export const DayView = ({ 
  selectedDate, 
  appointments,
  getAppointmentColorClass
}: DayViewProps) => {
  return (
    <div className="border rounded-md p-4">
      <div className="text-center mb-2 font-medium">
        {selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => {
          const timeString = `${hour}:00`;
          const appointmentsAtTime = appointments.filter(apt => 
            isSameDay(apt.date, selectedDate) && apt.time.startsWith(`${hour}:`)
          );
          
          return (
            <div key={hour} className="grid grid-cols-[60px,1fr] gap-2">
              <div className="text-sm text-gray-500 text-right pt-2">{timeString}</div>
              <div className="min-h-[60px] border-l pl-2">
                {appointmentsAtTime.length > 0 ? (
                  appointmentsAtTime.map(apt => (
                    <div 
                      key={apt.id} 
                      className={`px-2 py-1 mb-1 rounded text-white text-sm ${getAppointmentColorClass(apt)}`}
                    >
                      {apt.time} - {apt.clientName}
                    </div>
                  ))
                ) : (
                  <div className="h-full border border-dashed border-gray-200 rounded-md"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
