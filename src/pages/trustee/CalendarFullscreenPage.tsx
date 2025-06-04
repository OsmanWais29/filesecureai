
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users
} from "lucide-react";

const TrusteeCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  const events = [
    {
      id: 1,
      title: "Client Consultation - John Doe",
      date: "2025-01-15",
      time: "09:00 AM",
      duration: "1 hour",
      type: "consultation",
      location: "Office",
      description: "Initial bankruptcy consultation"
    },
    {
      id: 2,
      title: "Court Hearing - Smith vs Creditors",
      date: "2025-01-15",
      time: "02:00 PM", 
      duration: "2 hours",
      type: "court",
      location: "Superior Court",
      description: "Consumer proposal hearing"
    },
    {
      id: 3,
      title: "Document Review - Jane Wilson",
      date: "2025-01-16",
      time: "10:30 AM",
      duration: "30 minutes",
      type: "review",
      location: "Video Call",
      description: "Form 47 review and discussion"
    },
    {
      id: 4,
      title: "Creditors Meeting - ABC Corp",
      date: "2025-01-17",
      time: "01:00 PM",
      duration: "1.5 hours",
      type: "meeting",
      location: "Conference Room B",
      description: "Discuss payment terms and proposal"
    },
    {
      id: 5,
      title: "Team Stand-up",
      date: "2025-01-18",
      time: "08:30 AM",
      duration: "30 minutes",
      type: "internal",
      location: "Office",
      description: "Weekly team meeting"
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'court': return 'bg-red-100 text-red-800 border-red-200';
      case 'review': return 'bg-green-100 text-green-800 border-green-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'internal': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Get events for today and upcoming
  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0]);
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 5);

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and schedule.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDate(currentDate)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border">
                      {(['month', 'week', 'day'] as const).map((mode) => (
                        <Button
                          key={mode}
                          variant={viewMode === mode ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode(mode)}
                          className="capitalize"
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Simple calendar grid for month view */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                  {/* Calendar days would be generated here */}
                  {Array.from({ length: 35 }, (_, i) => (
                    <div key={i} className="p-2 text-center text-sm border rounded hover:bg-gray-50 min-h-[80px] relative">
                      <span className="text-gray-600">{((i % 31) + 1)}</span>
                      {/* Events would be shown here as small dots or indicators */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todayEvents.length > 0 ? (
                  <div className="space-y-3">
                    {todayEvents.map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getEventTypeColor(event.type)}>
                            {event.type}
                          </Badge>
                          <span className="text-sm text-gray-500">{event.time}</span>
                        </div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">No events scheduled for today</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {event.time}
                        <MapPin className="h-3 w-3 ml-2" />
                        {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Consultation
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Court Date
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Creditors Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TrusteeCalendarPage;
