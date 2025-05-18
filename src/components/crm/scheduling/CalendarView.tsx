
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, startOfWeek, startOfMonth, eachDayOfInterval, endOfMonth } from "date-fns";
import { MeetingData } from "@/hooks/useMeetingManagement";
import { Badge } from "@/components/ui/badge";

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarView: "day" | "week" | "month";
  setCalendarView: (view: "day" | "week" | "month") => void;
  appointments: any[];
}

export function CalendarView({
  selectedDate,
  setSelectedDate,
  calendarView,
  appointments,
}: CalendarViewProps) {
  // Day view
  const renderDayView = () => {
    // Filter appointments for the selected date
    const today = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.start_time || appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });
    
    // Generate time slots for the day (9am to 5pm)
    const timeSlots = Array.from({ length: 9 }, (_, i) => {
      const hour = 9 + i;
      return `${hour}:00${hour < 12 ? 'am' : 'pm'}`;
    });
    
    return (
      <div className="p-4 border rounded-md bg-card">
        <h3 className="text-lg font-medium mb-4">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        
        <div className="space-y-2">
          {timeSlots.map((timeSlot) => {
            // Find appointments for this time slot
            const slotAppointments = todaysAppointments.filter((appointment) => {
              const appointmentHour = new Date(appointment.start_time || appointment.date).getHours();
              const slotHour = parseInt(timeSlot.split(':')[0]);
              return appointmentHour === slotHour;
            });
            
            return (
              <div key={timeSlot} className="flex border-b pb-2">
                <div className="w-20 font-medium">{timeSlot}</div>
                <div className="flex-1">
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-1">
                      {slotAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className={`p-2 rounded-md ${appointment.color || 'bg-primary/10'}`}
                        >
                          <div className="font-medium">{appointment.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(appointment.start_time || appointment.date), 'h:mm a')} - 
                            {appointment.end_time && format(new Date(appointment.end_time), ' h:mm a')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 text-muted-foreground">No appointments</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
    
    // Generate days for the week
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="p-4 border rounded-md bg-card">
        <h3 className="text-lg font-medium mb-4">
          {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dayAppointments = appointments.filter((appointment) => {
              const appointmentDate = new Date(appointment.start_time || appointment.date);
              return (
                appointmentDate.getDate() === day.getDate() &&
                appointmentDate.getMonth() === day.getMonth() &&
                appointmentDate.getFullYear() === day.getFullYear()
              );
            });
            
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            
            return (
              <div 
                key={day.toISOString()}
                className={`
                  p-2 border rounded-md min-h-[100px] cursor-pointer
                  ${isToday ? 'bg-primary/10' : ''}
                  ${isSelected ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => setSelectedDate(day)}
              >
                <div className="text-center font-medium mb-2">
                  <div>{format(day, 'EEE')}</div>
                  <div>{format(day, 'd')}</div>
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`p-1 text-xs rounded ${appointment.color || 'bg-primary/10'}`}
                    >
                      {format(new Date(appointment.start_time || appointment.date), 'h:mm a')} - {appointment.title}
                    </div>
                  ))}
                  
                  {dayAppointments.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center">No events</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add days from previous month to start the calendar from Monday
    const firstDay = monthStart.getDay() || 7; // 0 is Sunday, we want Monday as 1
    const prevMonthDays = Array.from(
      { length: firstDay - 1 },
      (_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), -i)
    ).reverse();
    
    // Calculate rows needed (always 6 rows for consistency)
    const calendarDays = [...prevMonthDays, ...monthDays];
    while (calendarDays.length < 42) {
      const nextDay = new Date(calendarDays[calendarDays.length - 1]);
      nextDay.setDate(nextDay.getDate() + 1);
      calendarDays.push(nextDay);
    }
    
    return (
      <div className="p-4 border rounded-md bg-card">
        <h3 className="text-lg font-medium mb-4 text-center">
          {format(monthStart, 'MMMM yyyy')}
        </h3>
        
        <div className="grid grid-cols-7 gap-0">
          {/* Day headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center font-medium p-2 text-xs">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dayAppointments = appointments.filter((appointment) => {
              const appointmentDate = new Date(appointment.start_time || appointment.date);
              return (
                appointmentDate.getDate() === day.getDate() &&
                appointmentDate.getMonth() === day.getMonth() &&
                appointmentDate.getFullYear() === day.getFullYear()
              );
            });
            
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === selectedDate.toDateString();
            
            return (
              <div 
                key={day.toISOString()}
                className={`
                  p-1 border min-h-[80px] cursor-pointer
                  ${!isCurrentMonth ? 'bg-muted/30 text-muted-foreground' : ''}
                  ${isToday ? 'bg-primary/10' : ''}
                  ${isSelected ? 'ring-2 ring-primary' : ''}
                `}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-right text-xs ${isSelected ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1 mt-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`p-0.5 text-xs rounded truncate ${appointment.color || 'bg-primary/10'}`}
                      title={appointment.title}
                    >
                      {appointment.title}
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{dayAppointments.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        {calendarView === "day" && renderDayView()}
        {calendarView === "week" && renderWeekView()}
        {calendarView === "month" && renderMonthView()}
      </CardContent>
    </Card>
  );
}
