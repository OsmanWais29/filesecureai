
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  MessageSquare,
  ArrowRight,
  Clock4
} from "lucide-react";
import { format } from "date-fns";

// Types for appointments
interface Appointment {
  id: string;
  title: string;
  type: "in-person" | "video" | "phone";
  date: Date;
  time: string;
  duration: string;
  with: string;
  location?: string;
  notes?: string;
  status: "upcoming" | "completed" | "cancelled" | "rescheduled";
}

export const ClientAppointments = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");

  // Sample appointments data
  const appointments: Appointment[] = [
    {
      id: "1",
      title: "Initial Consultation",
      type: "in-person",
      date: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
      time: "10:00 AM",
      duration: "60 min",
      with: "John Smith (Trustee)",
      location: "123 Financial Street, Suite 400",
      notes: "Please bring your financial statements and ID.",
      status: "upcoming"
    },
    {
      id: "2",
      title: "Review Meeting",
      type: "video",
      date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
      time: "2:00 PM",
      duration: "30 min",
      with: "John Smith (Trustee)",
      notes: "We'll discuss your progress and answer any questions.",
      status: "upcoming"
    },
    {
      id: "3",
      title: "Financial Counselling Session",
      type: "video",
      date: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
      time: "11:30 AM",
      duration: "45 min",
      with: "Jane Doe (Counsellor)",
      status: "completed"
    }
  ];

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === "all") return true;
    return appointment.status === activeTab;
  });

  // Count appointments by status
  const appointmentCounts = {
    all: appointments.length,
    upcoming: appointments.filter(app => app.status === "upcoming").length,
    completed: appointments.filter(app => app.status === "completed").length,
    cancelled: appointments.filter(app => app.status === "cancelled").length,
    rescheduled: appointments.filter(app => app.status === "rescheduled").length,
  };

  // Get icon for appointment type
  const getAppointmentTypeIcon = (type: "in-person" | "video" | "phone") => {
    switch (type) {
      case "in-person":
        return <Users className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "phone":
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Get color for appointment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "rescheduled":
        return <Badge className="bg-amber-100 text-amber-800">Rescheduled</Badge>;
      default:
        return null;
    }
  };

  // Function to check if appointment is on selected date
  const isAppointmentOnSelectedDate = (appointment: Appointment): boolean => {
    if (!selectedDate) return false;
    
    return (
      appointment.date.getDate() === selectedDate.getDate() &&
      appointment.date.getMonth() === selectedDate.getMonth() &&
      appointment.date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Get appointments for selected date
  const appointmentsOnSelectedDate = appointments.filter(isAppointmentOnSelectedDate);

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Appointments</h1>
      </div>
      
      <p className="text-muted-foreground">
        View and manage your scheduled appointments with your trustee and support team.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendar</CardTitle>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md p-3 pointer-events-auto"
            />
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
              </h3>
              
              {appointmentsOnSelectedDate.length > 0 ? (
                <div className="space-y-2">
                  {appointmentsOnSelectedDate.map((appointment) => (
                    <div key={appointment.id} className="p-2 bg-muted rounded-md text-sm flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock4 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{appointment.time} - {appointment.title}</span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center p-2">
                  No appointments scheduled for this date
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All
                <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
                  {appointmentCounts.all}
                </span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                Upcoming
                <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
                  {appointmentCounts.upcoming}
                </span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                Completed
                <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
                  {appointmentCounts.completed}
                </span>
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                Cancelled
                <span className="flex items-center justify-center h-5 w-5 bg-muted rounded-full text-xs">
                  {appointmentCounts.cancelled}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{appointment.title}</CardTitle>
                            <CardDescription>
                              Scheduled with {appointment.with}
                            </CardDescription>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                              {getAppointmentTypeIcon(appointment.type)}
                            </div>
                            <div>
                              <p className="font-medium">
                                {appointment.type === "in-person" ? "In-person Meeting" : 
                                 appointment.type === "video" ? "Video Conference" : "Phone Call"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.duration} duration
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">Date & Time</p>
                                <p className="text-muted-foreground">
                                  {format(appointment.date, 'MMMM d, yyyy')} at {appointment.time}
                                </p>
                              </div>
                            </div>
                            
                            {appointment.type === "in-person" && appointment.location && (
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <p className="font-medium">Location</p>
                                  <p className="text-muted-foreground">{appointment.location}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {appointment.notes && (
                            <div className="pt-2">
                              <p className="text-sm font-medium">Notes:</p>
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-muted/50 flex justify-end">
                        {appointment.status === "upcoming" && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            {appointment.type === "video" && (
                              <Button size="sm">Join Meeting</Button>
                            )}
                          </div>
                        )}
                        {appointment.status === "completed" && (
                          <Button variant="outline" size="sm">View Summary</Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No {activeTab} appointments</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    {activeTab === "upcoming" ? 
                      "You don't have any upcoming appointments scheduled. Contact your trustee if you need to schedule a meeting." :
                      activeTab === "completed" ?
                      "You haven't completed any appointments yet. They will appear here after you've attended them." :
                      activeTab === "cancelled" ?
                      "You don't have any cancelled appointments." :
                      "No appointments found."}
                  </p>
                  <Button variant="outline">Request Appointment</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Quick Actions Card */}
      <Card className="mt-6">
        <div className="flex items-center gap-3 p-4">
          <div className="p-2 bg-blue-50 rounded-full">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium">Need to schedule a meeting?</h3>
            <p className="text-sm text-muted-foreground">
              Contact your trustee to schedule a meeting or discuss any concerns about your case.
            </p>
          </div>
          <Button variant="outline" className="ml-auto">
            Request Appointment <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
