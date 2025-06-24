
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Clock,
  Users,
  Plus,
  Video,
  Phone,
  MapPin,
  AlertCircle
} from "lucide-react";

const TrusteeCalendarPage = () => {
  const upcomingMeetings = [
    {
      id: "1",
      title: "Client Consultation - John Smith",
      time: "10:00 AM - 11:00 AM",
      date: "Today",
      type: "In-Person",
      location: "Office - Room 201",
      priority: "high"
    },
    {
      id: "2",
      title: "Form 47 Review - Sarah Johnson", 
      time: "2:00 PM - 2:30 PM",
      date: "Today",
      type: "Video Call",
      location: "Zoom Meeting",
      priority: "medium"
    },
    {
      id: "3",
      title: "Compliance Review Meeting",
      time: "9:00 AM - 10:30 AM", 
      date: "Tomorrow",
      type: "In-Person",
      location: "Conference Room A",
      priority: "high"
    }
  ];

  const todaySchedule = [
    { time: "9:00 AM", event: "Morning Review", duration: "30 min" },
    { time: "10:00 AM", event: "Client Consultation - John Smith", duration: "60 min" },
    { time: "11:30 AM", event: "Document Analysis", duration: "45 min" },
    { time: "2:00 PM", event: "Form 47 Review - Sarah Johnson", duration: "30 min" },
    { time: "3:00 PM", event: "Risk Assessment Review", duration: "45 min" },
    { time: "4:30 PM", event: "Admin Tasks", duration: "60 min" }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Video Call": return Video;
      case "Phone Call": return Phone; 
      case "In-Person": return MapPin;
      default: return Users;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar & Meetings</h1>
            <p className="text-gray-600 mt-1">Manage your schedule, client meetings, and important deadlines.</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Meeting
          </Button>
        </div>

        {/* Today's Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Meetings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">2 high priority</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">Scheduled meetings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">127</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => {
                  const TypeIcon = getTypeIcon(meeting.type);
                  return (
                    <div key={meeting.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{meeting.title}</h3>
                          <p className="text-sm text-gray-600">{meeting.time}</p>
                          <p className="text-sm text-gray-500">{meeting.date}</p>
                        </div>
                        <Badge className={getPriorityColor(meeting.priority)}>
                          {meeting.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TypeIcon className="h-4 w-4" />
                        <span>{meeting.location}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Join
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.duration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Interactive calendar view will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">Full calendar integration with meeting scheduling</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeCalendarPage;
