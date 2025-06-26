
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
import { Clock, Calendar as CalendarIcon, Users, Plus, FileText, Bell, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
          {/* Main Calendar Section - Takes up 3/4 of the width */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
              {/* Enhanced Header */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white rounded-t-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                      <CalendarIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold">Calendar Management</h1>
                      <p className="text-blue-100 text-lg">Organize your schedule with precision</p>
                    </div>
                  </div>
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white px-6 py-3 text-lg font-medium shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    New Appointment
                  </Button>
                </div>

                {/* Enhanced Calendar Navigation */}
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    onClick={handlePrevious}
                    className="text-white hover:bg-white/20 p-3 rounded-lg"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">
                      {format(selectedDate, calendarView === 'month' ? 'MMMM yyyy' : 'PPPP')}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {format(new Date(), 'EEEE, MMMM do')}
                    </p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    onClick={handleNext}
                    className="text-white hover:bg-white/20 p-3 rounded-lg"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              {/* Calendar Content */}
              <div className="p-8">
                <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'month' | 'week' | 'day')}>
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100 dark:bg-gray-800 h-12 rounded-xl p-1">
                    <TabsTrigger 
                      value="month" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-medium text-lg"
                    >
                      Month View
                    </TabsTrigger>
                    <TabsTrigger 
                      value="week" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-medium text-lg"
                    >
                      Week View
                    </TabsTrigger>
                    <TabsTrigger 
                      value="day" 
                      className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg font-medium text-lg"
                    >
                      Day View
                    </TabsTrigger>
                  </TabsList>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-inner p-6 min-h-[600px]">
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
                  </div>
                </Tabs>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Takes up 1/4 of the width */}
          <div className="xl:col-span-1 space-y-6">
            {/* Today's Schedule */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-900 dark:text-blue-100">Today's Schedule</div>
                    <div className="text-sm text-blue-600 dark:text-blue-300 font-normal">
                      {todaysAppointments.length} appointments
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg">
                          {appointment.time}
                        </span>
                        <Badge className={`text-xs font-medium ${getPriorityColor(appointment.priority)}`}>
                          {appointment.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg">
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{appointment.client}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{appointment.type}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Coming Up */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-orange-900 dark:text-orange-100">Coming Up</div>
                    <div className="text-sm text-orange-600 dark:text-orange-300 font-normal">
                      Next {upcomingAppointments.length} appointments
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-lg">
                        {appointment.date}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">{appointment.time}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">{appointment.client}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{appointment.type}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Notes */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-green-900 dark:text-green-100">Quick Notes</div>
                    <div className="text-sm text-green-600 dark:text-green-300 font-normal">
                      Jot down your thoughts
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[140px] resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-base"
                />
                <Button className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg py-3 text-lg font-medium rounded-xl">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
