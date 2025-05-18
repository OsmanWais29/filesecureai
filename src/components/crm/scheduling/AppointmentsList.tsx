
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

export interface Appointment {
  id: string;
  clientName?: string;
  title: string;
  type?: string;
  time: string;
  date: Date;
  priority: 'high' | 'medium' | 'normal';
  status: 'confirmed' | 'pending' | 'cancelled' | 'self-booked';
  documents?: 'complete' | 'incomplete' | 'pending';
  alert?: string | null;
  color?: string;
  [key: string]: any;
}

interface AppointmentsListProps {
  appointments: Appointment[];
  selectedDate: Date;
}

export function AppointmentsList({ appointments, selectedDate }: AppointmentsListProps) {
  // Filter appointments for the selected date
  const selectedAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === selectedDate.getDate() &&
      appointmentDate.getMonth() === selectedDate.getMonth() &&
      appointmentDate.getFullYear() === selectedDate.getFullYear()
    );
  });
  
  const getDateDisplay = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else if (date < addDays(new Date(), 7)) {
      return format(date, 'EEEE'); // Day name
    } else {
      return format(date, 'MMM d, yyyy'); // Full date
    }
  };
  
  const priorityColors = {
    high: "bg-red-500 text-white",
    medium: "bg-amber-500 text-white",
    normal: "bg-green-500 text-white",
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Appointments for {getDateDisplay(selectedDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedAppointments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No appointments scheduled for this day
          </div>
        ) : (
          <div className="space-y-3">
            {selectedAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="p-3 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {appointment.title || appointment.type}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.clientName && `${appointment.clientName} - `}
                      {appointment.time}
                    </div>
                  </div>
                  <Badge className={priorityColors[appointment.priority]}>
                    {appointment.priority}
                  </Badge>
                </div>
                
                {appointment.alert && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                    {appointment.alert}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
