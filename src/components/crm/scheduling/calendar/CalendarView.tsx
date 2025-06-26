
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Save,
  MessageSquare,
  User,
  Calendar as CalendarIcon,
  FileText,
  Phone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarView: 'day' | 'week' | 'month';
  setCalendarView: (view: 'day' | 'week' | 'month') => void;
  appointments: any[];
}

export const CalendarView = ({ 
  selectedDate, 
  setSelectedDate, 
  calendarView, 
  setCalendarView, 
  appointments 
}: CalendarViewProps) => {
  const [quickNote, setQuickNote] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  // Mock team data
  const teamMembers = [
    { id: 1, name: "Sarah Wilson", role: "Senior Trustee", status: "Available", caseload: 12, avatar: "SW", phone: "+1 (555) 123-4567" },
    { id: 2, name: "Michael Chen", role: "Junior Trustee", status: "In Meeting", caseload: 8, avatar: "MC", phone: "+1 (555) 987-6543" },
    { id: 3, name: "Emma Rodriguez", role: "Trustee Assistant", status: "Available", caseload: 15, avatar: "ER", phone: "+1 (555) 456-7890" },
  ];

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.date || Date.now()).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date || Date.now()) > new Date()
  ).slice(0, 3);

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !quickNote.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and note content.",
        variant: "destructive"
      });
      return;
    }

    // Simulate saving to client profile
    console.log('Saving note to client profile:', {
      title: noteTitle,
      content: quickNote,
      timestamp: new Date(),
      clientId: 'current-client-id'
    });

    toast({
      title: "Note Saved",
      description: "Quick note has been added to the client profile.",
    });

    // Clear the form
    setNoteTitle('');
    setQuickNote('');
  };

  const handleSendMessage = (member: any) => {
    // This will navigate to a new messaging page
    console.log('Opening message thread with:', member.name);
    toast({
      title: "Message Thread",
      description: `Opening message thread with ${member.name}`,
    });
    // TODO: Navigate to messaging page
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Meeting': return 'bg-yellow-100 text-yellow-800';
      case 'Busy': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 p-6">
      {/* Main Calendar Section */}
      <div className="col-span-8 space-y-6">
        {/* Enhanced Calendar Widget */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={calendarView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('month')}
                  className="text-sm"
                >
                  Month
                </Button>
                <Button
                  variant={calendarView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('week')}
                  className="text-sm"
                >
                  Week
                </Button>
                <Button
                  variant={calendarView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('day')}
                  className="text-sm"
                >
                  Day
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-lg border shadow-sm scale-110 mx-auto"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-lg font-semibold",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-md hover:bg-accent",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-12 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm relative p-0 h-12 w-12 focus-within:relative focus-within:z-20",
                  day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground font-semibold",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Quick Notes Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Quick Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <Label htmlFor="note-title" className="text-sm font-medium text-gray-700">
                    Note Title
                  </Label>
                  <Input
                    id="note-title"
                    placeholder="Enter note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-5">
                  <Label htmlFor="note-content" className="text-sm font-medium text-gray-700">
                    Note Content
                  </Label>
                  <Textarea
                    id="note-content"
                    placeholder="Add your quick note here..."
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    rows={2}
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button 
                    onClick={handleSaveNote}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!noteTitle.trim() || !quickNote.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Note
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="col-span-4 space-y-6">
        {/* Today's Schedule */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {todayAppointments.length > 0 ? (
              <div className="space-y-3">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{appointment.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{appointment.time}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">No appointments scheduled for today</p>
            )}
          </CardContent>
        </Card>

        {/* Coming Up */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Coming Up
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{appointment.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{appointment.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {appointment.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4 text-sm">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Status & Caseload Sharing - Full Width Bottom */}
      <div className="col-span-12">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Status & Caseload Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{member.name}</h4>
                        <p className="text-xs text-gray-600">{member.role}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs px-2 py-1 ${getStatusColor(member.status)}`}>
                      {member.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Caseload:</span>
                      <span className="text-xs font-medium">{member.caseload} cases</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Phone:</span>
                      <span className="text-xs font-medium">{member.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSendMessage(member)}
                      className="flex-1 text-xs h-8"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Message
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 text-xs h-8"
                    >
                      <User className="h-3 w-3 mr-1" />
                      Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
