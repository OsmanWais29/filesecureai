
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
import { StatusBadge } from "./StatusBadge";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  MessageSquare,
  ArrowRight,
  Clock4,
  ChevronRight
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
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "upcoming":
        return "default";
      case "completed":
        return "success";
      case "cancelled":
        return "destructive";
      case "rescheduled":
        return "warning";
      default:
        return "default";
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
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your scheduled appointments with your trustee and support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section - Enhanced */}
        <Card className="lg:col-span-1 overflow-hidden border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Calendar View</CardTitle>
            </div>
            <CardDescription>Select a date to view appointments</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md p-3 pointer-events-auto"
              components={{
                DayContent: (props) => {
                  // Check if there are appointments on this date
                  const hasAppointments = appointments.some(apt => 
                    apt.date.getDate() === props.date.getDate() &&
                    apt.date.getMonth() === props.date.getMonth() &&
                    apt.date.getFullYear() === props.date.getFullYear()
                  );

                  return (
                    <div className="relative flex items-center justify-center h-8 w-8">
                      <div>{props.date.getDate()}</div>
                      {hasAppointments && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 bg-primary rounded-full"></div>
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
          <CardFooter className="flex flex-col pt-2 border-t bg-muted/20">
            <div className="w-full space-y-2">
              <h3 className="text-sm font-medium">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
              </h3>
              
              {appointmentsOnSelectedDate.length > 0 ? (
                <div className="space-y-2">
                  {appointmentsOnSelectedDate.map((appointment) => (
                    <div key={appointment.id} className="p-2 bg-muted rounded-md text-sm flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${appointment.status === 'upcoming' ? 'bg-blue-500' : appointment.status === 'completed' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      <span className="font-medium">{appointment.time}</span>
                      <span className="text-muted-foreground flex-1 truncate">{appointment.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center p-4 border border-dashed rounded-md">
                  No appointments scheduled for this date
                </div>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Appointments List - Enhanced */}
        <div className="lg:col-span-2">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">My Appointments</CardTitle>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  Filter <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="upcoming" className="flex items-center gap-1">
                    Upcoming
                    {appointmentCounts.upcoming > 0 && (
                      <Badge variant="default" className="ml-1">
                        {appointmentCounts.upcoming}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>

            <CardContent className="p-3">
              <TabsContent value={activeTab} className="mt-0">
                {filteredAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <Card key={appointment.id} className="overflow-hidden transition-all hover:shadow-md">
                        <div className={`h-1 w-full ${
                          appointment.status === 'upcoming' ? 'bg-blue-500' : 
                          appointment.status === 'completed' ? 'bg-green-500' : 
                          appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                        }`}></div>
                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                appointment.status === 'upcoming' ? 'bg-blue-500' : 
                                appointment.status === 'completed' ? 'bg-green-500' : 
                                appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                              }`}></div>
                              <CardTitle className="text-lg">{appointment.title}</CardTitle>
                            </div>
                            <CardDescription>
                              Scheduled with {appointment.with}
                            </CardDescription>
                          </div>
                          <StatusBadge status={appointment.status} size="md" />
                        </CardHeader>
                        
                        <CardContent className="grid gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="rounded-full p-2 bg-primary/10 text-primary">
                                <CalendarIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Date & Time</p>
                                <p className="text-sm text-muted-foreground">{format(appointment.date, 'EEEE, MMMM d, yyyy')} at {appointment.time}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="rounded-full p-2 bg-primary/10 text-primary">
                                <Clock className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-sm font-medium">Duration</p>
                                <p className="text-sm text-muted-foreground">{appointment.duration}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="rounded-full p-2 bg-primary/10 text-primary">
                                {getAppointmentTypeIcon(appointment.type)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">Meeting Type</p>
                                <p className="text-sm text-muted-foreground">
                                  {appointment.type === "in-person" ? "In-person Meeting" : 
                                  appointment.type === "video" ? "Video Conference" : "Phone Call"}
                                </p>
                              </div>
                            </div>
                            
                            {appointment.type === "in-person" && appointment.location && (
                              <div className="flex items-start gap-3">
                                <div className="rounded-full p-2 bg-primary/10 text-primary">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Location</p>
                                  <p className="text-sm text-muted-foreground">{appointment.location}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {appointment.notes && (
                            <div className="bg-muted/30 p-3 rounded-md border-l-4 border-primary/30">
                              <p className="text-sm font-medium mb-1">Notes:</p>
                              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                            </div>
                          )}
                        </CardContent>
                        
                        <CardFooter className="border-t bg-muted/30 flex justify-end gap-2 pt-3 pb-3">
                          {appointment.status === "upcoming" && (
                            <>
                              <Button variant="outline" size="sm">Reschedule</Button>
                              {appointment.type === "video" && (
                                <Button size="sm">Join Meeting</Button>
                              )}
                            </>
                          )}
                          {appointment.status === "completed" && (
                            <Button variant="outline" size="sm">View Summary</Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No {activeTab} appointments</h3>
                    <p className="text-muted-foreground max-w-md mb-6 px-6">
                      {activeTab === "upcoming" ? 
                        "You don't have any upcoming appointments scheduled. Contact your trustee if you need to schedule a meeting." :
                        activeTab === "completed" ?
                        "You haven't completed any appointments yet. They will appear here after you've attended them." :
                        activeTab === "cancelled" ?
                        "You don't have any cancelled appointments." :
                        "No appointments found."}
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions Card - Enhanced */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-4 p-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="font-medium text-lg">Need to schedule a meeting?</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Contact your trustee to schedule a meeting or discuss any concerns about your case.
            </p>
          </div>
          <Button className="ml-auto whitespace-nowrap">
            Request Appointment <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
