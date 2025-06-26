
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek, startOfMonth, eachDayOfInterval, endOfMonth, isSameDay, isToday } from "date-fns";
import { Clock, MapPin, User } from "lucide-react";

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
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'border-green-500';
      case 'pending': return 'border-amber-500';
      case 'self-booked': return 'border-blue-500';
      default: return 'border-gray-300';
    }
  };

  // Day view
  const renderDayView = () => {
    const today = new Date(selectedDate);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todaysAppointments = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= today && appointmentDate < tomorrow;
    });
    
    const timeSlots = Array.from({ length: 12 }, (_, i) => {
      const hour = 8 + i;
      return {
        time: `${hour}:00`,
        displayTime: format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')
      };
    });
    
    return (
      <div className="bg-white rounded-lg">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-600">{todaysAppointments.length} appointments scheduled</p>
        </div>
        
        <div className="divide-y divide-gray-100">
          {timeSlots.map((slot) => {
            const slotHour = parseInt(slot.time.split(':')[0]);
            const slotAppointments = todaysAppointments.filter((appointment) => {
              const appointmentHour = new Date(appointment.date).getHours();
              return appointmentHour === slotHour;
            });
            
            return (
              <div key={slot.time} className="flex min-h-[80px] hover:bg-gray-50 transition-colors">
                <div className="w-24 p-4 text-sm font-medium text-gray-500 border-r">
                  {slot.displayTime}
                </div>
                <div className="flex-1 p-4">
                  {slotAppointments.length > 0 ? (
                    <div className="space-y-2">
                      {slotAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className={`p-3 rounded-lg shadow-sm border-l-4 ${getStatusColor(appointment.status)} bg-white hover:shadow-md transition-shadow cursor-pointer`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{appointment.title}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <User className="h-3 w-3" />
                                {appointment.clientName}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {appointment.time}
                              </p>
                            </div>
                            <Badge className={getPriorityColor(appointment.priority)}>
                              {appointment.priority}
                            </Badge>
                          </div>
                          {appointment.alert && (
                            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                              {appointment.alert}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <div className="text-center">
                        <Clock className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <p>Available</p>
                      </div>
                    </div>
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
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 border-b bg-gray-50">
          <div className="p-3 text-sm font-medium text-gray-500"></div>
          {weekDays.map((day) => (
            <div 
              key={day.toISOString()}
              className={`p-3 text-center cursor-pointer hover:bg-gray-100 transition-colors ${
                isToday(day) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-xs uppercase tracking-wide">{format(day, 'EEE')}</div>
              <div className={`text-lg ${isToday(day) ? 'font-bold' : 'font-medium'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = 8 + i;
            const timeLabel = format(new Date().setHours(hour, 0, 0, 0), 'h a');
            
            return (
              <div key={hour} className="grid grid-cols-8 min-h-[60px]">
                <div className="p-2 text-xs text-gray-500 border-r bg-gray-50 flex items-start">
                  {timeLabel}
                </div>
                {weekDays.map((day) => {
                  const dayAppointments = appointments.filter((appointment) => {
                    const appointmentDate = new Date(appointment.date);
                    const appointmentHour = appointmentDate.getHours();
                    return (
                      isSameDay(appointmentDate, day) && appointmentHour === hour
                    );
                  });
                  
                  return (
                    <div 
                      key={`${day.toISOString()}-${hour}`}
                      className="p-1 border-r border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      {dayAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className={`p-1 text-xs rounded mb-1 border-l-2 ${getStatusColor(appointment.status)} bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                        >
                          <div className="font-medium truncate">{appointment.title}</div>
                          <div className="text-gray-600 truncate">{appointment.clientName}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
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
    
    const firstDay = monthStart.getDay() || 7;
    const prevMonthDays = Array.from(
      { length: firstDay - 1 },
      (_, i) => new Date(monthStart.getFullYear(), monthStart.getMonth(), -i)
    ).reverse();
    
    const calendarDays = [...prevMonthDays, ...monthDays];
    while (calendarDays.length < 42) {
      const nextDay = new Date(calendarDays[calendarDays.length - 1]);
      nextDay.setDate(nextDay.getDate() + 1);
      calendarDays.push(nextDay);
    }
    
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dayAppointments = appointments.filter((appointment) => 
              isSameDay(new Date(appointment.date), day)
            );
            
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            const isDayToday = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <div 
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border-r border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
                } ${isDayToday ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedDate(day)}
              >
                <div className={`text-sm mb-1 ${
                  isDayToday ? 'font-bold text-blue-700' : isSelected ? 'font-semibold' : 'font-medium'
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map((appointment) => (
                    <div 
                      key={appointment.id}
                      className={`p-1 text-xs rounded truncate border-l-2 ${getStatusColor(appointment.status)} bg-white shadow-sm`}
                      title={`${appointment.title} - ${appointment.clientName} at ${appointment.time}`}
                    >
                      <div className="font-medium">{appointment.title}</div>
                      <div className="text-gray-600">{appointment.time}</div>
                    </div>
                  ))}
                  
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 font-medium">
                      +{dayAppointments.length - 3} more
                    </div>
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
    <div className="p-4">
      {calendarView === "day" && renderDayView()}
      {calendarView === "week" && renderWeekView()}
      {calendarView === "month" && renderMonthView()}
    </div>
  );
}
