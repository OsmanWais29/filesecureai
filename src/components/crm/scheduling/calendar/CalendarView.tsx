
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarHeader } from "./CalendarHeader";
import { AppointmentsList } from "../AppointmentsList";
import { useCalendarNavigation } from "./useCalendarNavigation";
import { useAppointmentUtils } from "./useAppointmentUtils";
import { toast } from "@/components/ui/use-toast";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  FileText,
  Plus,
  Save
} from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";

// Mock data for appointments
const mockAppointments = [
  {
    id: "1",
    clientName: "Sarah Johnson",
    title: "Initial Consultation",
    type: "consultation",
    time: "10:00 AM",
    date: new Date(),
    priority: "high" as const,
    status: "confirmed" as const,
    documents: "complete" as const
  },
  {
    id: "2",
    clientName: "Michael Chen",
    title: "Document Review",
    type: "review",
    time: "2:30 PM",
    date: new Date(),
    priority: "medium" as const,
    status: "pending" as const,
    documents: "incomplete" as const
  },
  {
    id: "3",
    clientName: "Emma Wilson",
    title: "Follow-up Meeting",
    type: "follow-up",
    time: "11:00 AM",
    date: addDays(new Date(), 1),
    priority: "normal" as const,
    status: "confirmed" as const,
    documents: "complete" as const
  },
  {
    id: "4",
    clientName: "Robert Davis",
    title: "Case Discussion",
    type: "discussion",
    time: "3:00 PM",
    date: addDays(new Date(), 2),
    priority: "high" as const,
    status: "self-booked" as const,
    documents: "pending" as const
  }
];

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("month");
  const [quickNote, setQuickNote] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  
  const { handlePrevious, handleNext } = useCalendarNavigation(selectedDate, calendarView, setSelectedDate);
  const { getAppointmentColorClass } = useAppointmentUtils();

  // Get today's appointments
  const todayAppointments = mockAppointments.filter(apt => isToday(apt.date));
  
  // Get upcoming appointments (next 7 days, excluding today)
  const upcomingAppointments = mockAppointments.filter(apt => {
    const appointmentDate = apt.date;
    const today = new Date();
    const nextWeek = addDays(today, 7);
    return appointmentDate > today && appointmentDate <= nextWeek;
  });

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !quickNote.trim()) {
      toast({
        title: "Note Required",
        description: "Please add both a title and note content.",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would save to the current client's profile
    toast({
      title: "Note Saved",
      description: "Your note has been saved to the client profile.",
    });
    
    // Clear the form
    setNoteTitle("");
    setQuickNote("");
  };

  const getDateDisplay = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, 'MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Smart Calendar</h1>
        <p className="text-gray-600">Manage your appointments and schedule efficiently</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section - Takes up 3 columns */}
        <div className="lg:col-span-3 space-y-6">
          {/* Calendar Widget */}
          <Card className="shadow-sm border-0">
            <CardHeader className="bg-white border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium text-gray-900">
                    {format(selectedDate, 'MMMM yyyy')}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="h-8 w-8 p-0"
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    className="h-8 w-8 p-0"
                  >
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="w-full max-w-none scale-110 p-4"
                  classNames={{
                    months: "flex w-full",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-medium",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell: "text-gray-500 rounded-md w-full font-medium text-sm p-2",
                    row: "flex w-full mt-2",
                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 w-full",
                    day: "h-12 w-full p-0 font-normal hover:bg-blue-50 rounded-md transition-colors",
                    day_selected: "bg-blue-600 text-white hover:bg-blue-700",
                    day_today: "bg-blue-100 text-blue-900 font-semibold",
                    day_outside: "text-gray-400"
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Notes Section */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Quick Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <Input
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="md:col-span-7">
                  <Textarea
                    placeholder="Add a quick note to the current client profile..."
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    className="min-h-[40px] resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    onClick={handleSaveNote}
                    className="w-full h-10"
                    disabled={!noteTitle.trim() || !quickNote.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Schedule Sections */}
        <div className="lg:col-span-1 space-y-6">
          {/* Today's Schedule */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No appointments today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">{appointment.time}</div>
                        <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                          {appointment.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{appointment.title}</div>
                      <div className="text-xs text-gray-500">{appointment.clientName}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coming Up */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Coming Up
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No upcoming appointments</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-sm">
                          {getDateDisplay(appointment.date)} at {appointment.time}
                        </div>
                        <Badge className={`text-xs ${getPriorityColor(appointment.priority)}`}>
                          {appointment.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">{appointment.title}</div>
                      <div className="text-xs text-gray-500">{appointment.clientName}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Status */}
          <Card className="shadow-sm border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Team Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Available</span>
                  </div>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-sm">In Meeting</span>
                  </div>
                  <span className="text-sm font-medium">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Busy</span>
                  </div>
                  <span className="text-sm font-medium">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
