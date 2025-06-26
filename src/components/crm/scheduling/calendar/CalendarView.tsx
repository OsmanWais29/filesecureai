
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { CalendarHeader } from './CalendarHeader';
import { useCalendarNavigation } from './useCalendarNavigation';
import { useAppointmentUtils } from './useAppointmentUtils';
import { Clock, Calendar as CalendarIcon, Users, Plus, FileText, Bell } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';

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
  const [notes, setNotes] = useState('');
  const { handlePrevious, handleNext } = useCalendarNavigation(
    selectedDate,
    calendarView,
    setSelectedDate
  );
  
  const { getAppointmentColorClass } = useAppointmentUtils();

  // Mock data for today's appointments and upcoming
  const todaysAppointments = [
    { id: 1, time: '9:00 AM', client: 'John Smith', type: 'Initial Consultation', priority: 'high' },
    { id: 2, time: '11:30 AM', client: 'Sarah Johnson', type: 'Document Review', priority: 'medium' },
    { id: 3, time: '2:00 PM', client: 'Mike Chen', type: 'Status Update', priority: 'normal' },
    { id: 4, time: '4:00 PM', client: 'Emily Davis', type: 'Final Meeting', priority: 'high' }
  ];

  const upcomingAppointments = [
    { id: 5, date: 'Tomorrow', time: '10:00 AM', client: 'Robert Wilson', type: 'Asset Review' },
    { id: 6, date: 'Thu, Dec 28', time: '1:00 PM', client: 'Lisa Anderson', type: 'Court Hearing' },
    { id: 7, date: 'Fri, Dec 29', time: '3:30 PM', client: 'David Brown', type: 'Consultation' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main Calendar Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar View</h2>
                <p className="text-gray-600 dark:text-gray-300">Manage your schedule and appointments</p>
              </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </div>

          <CalendarHeader
            selectedDate={selectedDate}
            calendarView={calendarView}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
          
          <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'month' | 'week' | 'day')}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>

            <TabsContent value="month" className="mt-0">
              <MonthView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                appointments={appointments}
                calendarView={calendarView}
              />
            </TabsContent>

            <TabsContent value="week" className="mt-0">
              <WeekView
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                appointments={appointments}
                getAppointmentColorClass={getAppointmentColorClass}
              />
            </TabsContent>

            <TabsContent value="day" className="mt-0">
              <DayView
                selectedDate={selectedDate}
                appointments={appointments}
                getAppointmentColorClass={getAppointmentColorClass}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar - Schedule & Notes */}
      <div className="space-y-6">
        {/* Today's Schedule */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{appointment.time}</span>
                    <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                      {appointment.priority}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{appointment.client}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.type}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coming Up */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-orange-600" />
              Coming Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{appointment.date}</span>
                    <span className="text-sm font-semibold">{appointment.time}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{appointment.client}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.type}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Notes */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-green-600" />
              Quick Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Add your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none border-gray-200 dark:border-gray-700"
            />
            <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white">
              Save Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
