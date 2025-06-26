
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { CalendarHeader } from './CalendarHeader';
import { useCalendarNavigation } from './useCalendarNavigation';
import { useAppointmentUtils } from './useAppointmentUtils';
import { Clock, Calendar as CalendarIcon, Users, Plus, FileText, Bell, Sparkles, Save } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { toast } from 'sonner';

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
  const [noteTitle, setNoteTitle] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const { handlePrevious, handleNext } = useCalendarNavigation(
    selectedDate,
    calendarView,
    setSelectedDate
  );
  
  const { getAppointmentColorClass } = useAppointmentUtils();

  // Mock data for clients
  const clients = [
    'John Smith',
    'Sarah Johnson',
    'Mike Chen',
    'Emily Davis',
    'Robert Wilson',
    'Lisa Anderson'
  ];

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

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !notes.trim()) {
      toast.error('Please fill in both title and note content');
      return;
    }

    if (!selectedClient) {
      toast.error('Please select a client for this note');
      return;
    }

    // Simulate saving to CRM client profile
    const noteData = {
      id: Date.now().toString(),
      title: noteTitle,
      content: notes,
      client: selectedClient,
      timestamp: new Date().toISOString(),
      createdBy: 'Current User', // In real app, get from auth context
      type: 'calendar_note'
    };

    // In a real application, this would save to Supabase or your backend
    // For now, we'll simulate the save and show success
    console.log('Saving note to client profile:', noteData);
    
    toast.success(`Note saved to ${selectedClient}'s profile`, {
      description: `"${noteTitle}" has been added to the client files`
    });

    // Clear the form
    setNoteTitle('');
    setNotes('');
    setSelectedClient('');
  };

  return (
    <div className="space-y-6 h-full">
      {/* Main Calendar Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Calendar View</h2>
                <p className="text-blue-100 text-sm">Manage your schedule and appointments</p>
              </div>
            </div>
            <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white">
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
        </div>
        
        <div className="p-6">
          <Tabs value={calendarView} onValueChange={(value) => setCalendarView(value as 'month' | 'week' | 'day')}>
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="month" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Month</TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Week</TabsTrigger>
              <TabsTrigger value="day" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Day</TabsTrigger>
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

      {/* Schedule and Notes Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {todaysAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{appointment.time}</span>
                    <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                      {appointment.priority}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{appointment.client}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.type}</p>
                </div>
                <Button variant="ghost" size="sm" className="hover:bg-blue-100 dark:hover:bg-blue-900/30">
                  <Users className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coming Up */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              Coming Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">{appointment.date}</span>
                    <span className="text-sm font-semibold">{appointment.time}</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{appointment.client}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.type}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Horizontal Quick Notes Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Quick Notes - Add to Client Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Client Selection */}
            <div className="lg:col-span-2">
              <label className="text-sm font-medium mb-2 block">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            {/* Note Title */}
            <div className="lg:col-span-3">
              <label className="text-sm font-medium mb-2 block">Note Title</label>
              <Input
                placeholder="Enter note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Note Content */}
            <div className="lg:col-span-5">
              <label className="text-sm font-medium mb-2 block">Note Content</label>
              <Textarea
                placeholder="Add your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-20"
              />
            </div>

            {/* Save Button */}
            <div className="lg:col-span-2 flex items-end">
              <Button 
                onClick={handleSaveNote}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-10"
              >
                <Save className="h-4 w-4 mr-2" />
                Save to Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
