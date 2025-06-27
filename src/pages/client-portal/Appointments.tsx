
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar,
  Clock,
  Video,
  MapPin,
  Plus,
  Phone
} from "lucide-react";

const appointments = [
  {
    id: 1,
    title: "Monthly Review Meeting",
    date: "2024-01-20",
    time: "10:00 AM",
    duration: "60 minutes",
    type: "video",
    status: "confirmed",
    description: "Review monthly financial progress and discuss next steps"
  },
  {
    id: 2,
    title: "Document Review Session",
    date: "2024-01-25",
    time: "2:00 PM",
    duration: "30 minutes",
    type: "phone",
    status: "pending",
    description: "Review and verify submitted financial documents"
  },
  {
    id: 3,
    title: "Final Assessment Meeting",
    date: "2024-02-05",
    time: "11:00 AM",
    duration: "90 minutes",
    type: "in-person",
    status: "scheduled",
    description: "Comprehensive review of case progress and final recommendations"
  }
];

const pastAppointments = [
  {
    id: 4,
    title: "Initial Consultation",
    date: "2024-01-10",
    time: "9:00 AM",
    duration: "45 minutes",
    type: "video",
    status: "completed",
    description: "Initial case assessment and documentation review"
  },
  {
    id: 5,
    title: "Financial Planning Session",
    date: "2024-01-05",
    time: "3:30 PM",
    duration: "60 minutes",
    type: "phone",
    status: "completed",
    description: "Detailed financial planning and budget creation"
  }
];

export const ClientAppointments = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "scheduled":
        return "outline";
      case "completed":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "in-person":
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const AppointmentCard = ({ appointment, isPast = false }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{appointment.title}</CardTitle>
          <Badge variant={getStatusColor(appointment.status)}>
            {appointment.status}
          </Badge>
        </div>
        <CardDescription>{appointment.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{appointment.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2">
            {getTypeIcon(appointment.type)}
            <span className="capitalize">{appointment.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{appointment.duration}</span>
          </div>
        </div>
        
        {!isPast && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              {appointment.type === "video" ? "Join Meeting" : "View Details"}
            </Button>
            <Button variant="outline" size="sm">
              Reschedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your meetings and consultations</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Request Appointment
        </Button>
      </div>

      {/* Next Appointment Highlight */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Calendar className="h-5 w-5" />
            Next Appointment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Monthly Review Meeting</h3>
              <p className="text-blue-700">January 20, 2024 at 10:00 AM</p>
              <p className="text-sm text-blue-600 mt-1">Video call - 60 minutes</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Video className="h-4 w-4 mr-2" />
              Join Meeting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
          
          {appointments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming appointments</h3>
                <p className="text-gray-600 mb-4">Schedule a meeting with your trustee</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Appointment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4">
            {pastAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} isPast={true} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
