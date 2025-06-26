
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, User, MessageSquare, Save, Plus } from 'lucide-react';
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  calendarView: 'day' | 'week' | 'month';
  setCalendarView: (view: 'day' | 'week' | 'month') => void;
  appointments: any[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  setSelectedDate,
  calendarView,
  setCalendarView,
  appointments
}) => {
  const navigate = useNavigate();
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');

  const handleSaveQuickNote = () => {
    if (!quickNoteTitle.trim() || !quickNoteContent.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    // Simulate saving to CRM client profile
    toast.success("Quick note saved to client profile");
    setQuickNoteTitle('');
    setQuickNoteContent('');
  };

  const handleMessageTrustee = (trusteeName: string) => {
    navigate('/trustee/messages');
  };

  const todaysAppointments = [
    { time: "9:00 AM", client: "John Doe", type: "Consultation" },
    { time: "11:00 AM", client: "Jane Smith", type: "Document Review" },
    { time: "2:00 PM", client: "Bob Johnson", type: "Follow-up" }
  ];

  const upcomingAppointments = [
    { date: "Tomorrow", time: "10:00 AM", client: "Alice Brown", type: "Initial Meeting" },
    { date: "Friday", time: "3:00 PM", client: "Charlie Wilson", type: "Case Review" }
  ];

  const teamMembers = [
    { name: "Sarah Johnson", role: "Senior Trustee", status: "Available", caseload: 12, avatar: "/api/placeholder/32/32" },
    { name: "Mike Chen", role: "Trustee", status: "In Meeting", caseload: 8, avatar: "/api/placeholder/32/32" },
    { name: "Lisa Davis", role: "Junior Trustee", status: "Available", caseload: 6, avatar: "/api/placeholder/32/32" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Main Calendar Area - Takes up 3 columns on large screens */}
      <div className="lg:col-span-3 space-y-6">
        {/* Calendar Widget */}
        <Card className="h-96">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-700 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={calendarView === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </Button>
                <Button
                  variant={calendarView === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </Button>
                <Button
                  variant={calendarView === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-medium text-slate-600 p-2">{day}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 6);
                const isToday = date.toDateString() === new Date().toDateString();
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                
                return (
                  <button
                    key={i}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      isToday 
                        ? 'bg-blue-500 text-white font-semibold' 
                        : isCurrentMonth
                        ? 'hover:bg-slate-100 text-slate-900'
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Notes - Full Width */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Plus className="h-5 w-5" />
              Quick Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Note title..."
                value={quickNoteTitle}
                onChange={(e) => setQuickNoteTitle(e.target.value)}
                className="md:col-span-1"
              />
              <Textarea
                placeholder="Add a quick note for this client..."
                value={quickNoteContent}
                onChange={(e) => setQuickNoteContent(e.target.value)}
                className="md:col-span-2 min-h-[80px] resize-none"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveQuickNote} className="gap-2">
                <Save className="h-4 w-4" />
                Save Note
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Takes up 1 column */}
      <div className="space-y-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Clock className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {todaysAppointments.map((apt, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{apt.time}</div>
                  <div className="text-xs text-slate-600">{apt.client}</div>
                  <div className="text-xs text-slate-500">{apt.type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Coming Up */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <Calendar className="h-5 w-5" />
              Coming Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingAppointments.map((apt, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">{apt.date} - {apt.time}</div>
                  <div className="text-xs text-slate-600">{apt.client}</div>
                  <div className="text-xs text-slate-500">{apt.type}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Status & Caseload Sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <User className="h-5 w-5" />
              Team Status & Caseload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-slate-600">{member.role}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={member.status === 'Available' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {member.status}
                      </Badge>
                      <span className="text-xs text-slate-500">{member.caseload} cases</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleMessageTrustee(member.name)}
                  className="gap-1"
                >
                  <MessageSquare className="h-3 w-3" />
                  Message
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
