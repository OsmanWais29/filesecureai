
import { useState } from "react";
import { 
  Card, 
  CardContent, 
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
  CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  MessageSquare, 
  ArrowRight,
  ChevronRight,
  BookOpen,
  MoveRight
} from "lucide-react";
import { format, isSameDay } from "date-fns";

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

  // Get appointments for selected date
  const appointmentsOnSelectedDate = appointments.filter(appointment => 
    selectedDate && isSameDay(appointment.date, selectedDate)
  );

  // Count appointments by status
  const appointmentCounts = {
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
        return <MessageSqule className="h-4 w-4" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-300">
      {/* Page Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your scheduled meetings with your trustee and support team.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel - Calendar and Selected Date Details */}
        <div className="lg:col-span-4 space-y-6">
          {/* Calendar Card */}
          <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Select a Date</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md p-3"
                components={{
                  DayContent: (props) => {
                    // Check if there are appointments on this date
                    const hasAppointments = appointments.some(apt => 
                      apt.date.getDate() === props.date.getDate() &&
                      apt.date.getMonth() === props.date.getMonth() &&
                      apt.date.getFullYear() === props.date.getFullYear()
                    );

                    // Check if there are high priority appointments (upcoming)
                    const hasUpcoming = appointments.some(apt => 
                      apt.date.getDate() === props.date.getDate() &&
                      apt.date.getMonth() === props.date.getMonth() &&
                      apt.date.getFullYear() === props.date.getFullYear() &&
                      apt.status === 'upcoming'
                    );

                    return (
                      <div className="relative flex items-center justify-center h-9 w-9">
                        <div>{props.date.getDate()}</div>
                        {hasAppointments && (
                          <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1.5 w-1.5 rounded-full ${
                            hasUpcoming ? 'bg-primary' : 'bg-muted-foreground'
                          }`}></div>
                        )}
                      </div>
                    );
                  }
                }}
              />
            </CardContent>
            
            {/* Selected Date Card */}
            <CardFooter className="flex flex-col pt-2 border-t">
              <div className="w-full">
                <h3 className="text-md font-medium mb-2">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'No date selected'}
                </h3>

                {appointmentsOnSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {appointmentsOnSelectedDate.map((appointment) => (
                      <div 
                        key={appointment.id} 
                        className="p-3 bg-muted/50 hover:bg-muted/80 rounded-lg transition-colors cursor-pointer"
                        onClick={() => {
                          setActiveTab(appointment.status);
                          document.getElementById(`appointment-${appointment.id}`)?.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'center'
                          });
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{appointment.title}</div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                          <StatusBadge status={appointment.status} size="sm" />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{appointment.with}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                            <MoveRight className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-md bg-muted/30">
                    <BookOpen className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No appointments scheduled for this date
                    </p>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none shadow-sm">
            <div className="p-5">
              <div className="flex flex-col items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Need to schedule a meeting?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact your trustee to schedule a meeting or discuss any concerns about your case.
                  </p>
                  <Button className="w-full">
                    Request Appointment <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right Panel - Appointments List */}
        <div className="lg:col-span-8">
          <Card className="h-full border-t-4 border-t-primary">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">My Appointments</CardTitle>
                </div>
              </div>

              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="grid grid-cols-4 mb-2">
                  <TabsTrigger value="upcoming" className="flex items-center justify-center gap-1">
                    Upcoming
                    {appointmentCounts.upcoming > 0 && (
                      <Badge variant="default" className="ml-1">
                        {appointmentCounts.upcoming}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  <TabsTrigger value="rescheduled">Rescheduled</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-4 space-y-4">
                  {appointments.filter(app => app.status === "upcoming").length > 0 ? (
                    <div className="space-y-4">
                      {appointments
                        .filter(app => app.status === "upcoming")
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            getAppointmentTypeIcon={getAppointmentTypeIcon}
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyAppointments status="upcoming" />
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-4 space-y-4">
                  {appointments.filter(app => app.status === "completed").length > 0 ? (
                    <div className="space-y-4">
                      {appointments
                        .filter(app => app.status === "completed")
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            getAppointmentTypeIcon={getAppointmentTypeIcon}
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyAppointments status="completed" />
                  )}
                </TabsContent>
                
                <TabsContent value="cancelled" className="mt-4 space-y-4">
                  {appointments.filter(app => app.status === "cancelled").length > 0 ? (
                    <div className="space-y-4">
                      {appointments
                        .filter(app => app.status === "cancelled")
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            getAppointmentTypeIcon={getAppointmentTypeIcon}
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyAppointments status="cancelled" />
                  )}
                </TabsContent>
                
                <TabsContent value="rescheduled" className="mt-4 space-y-4">
                  {appointments.filter(app => app.status === "rescheduled").length > 0 ? (
                    <div className="space-y-4">
                      {appointments
                        .filter(app => app.status === "rescheduled")
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            getAppointmentTypeIcon={getAppointmentTypeIcon}
                          />
                        ))}
                    </div>
                  ) : (
                    <EmptyAppointments status="rescheduled" />
                  )}
                </TabsContent>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
  getAppointmentTypeIcon: (type: "in-person" | "video" | "phone") => JSX.Element;
}

const AppointmentCard = ({ appointment, getAppointmentTypeIcon }: AppointmentCardProps) => {
  return (
    <Card 
      id={`appointment-${appointment.id}`} 
      className="overflow-hidden transition-all hover:shadow-md animate-in fade-in-50"
    >
      <div className={`h-1 w-full ${
        appointment.status === 'upcoming' ? 'bg-primary' : 
        appointment.status === 'completed' ? 'bg-green-500' : 
        appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
      }`}></div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                appointment.status === 'upcoming' ? 'bg-primary' : 
                appointment.status === 'completed' ? 'bg-green-500' : 
                appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
              }`}></div>
              <CardTitle className="text-lg">{appointment.title}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              With {appointment.with}
            </p>
          </div>
          <StatusBadge status={appointment.status} size="md" />
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full p-2 bg-primary/10 text-primary">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Date & Time</p>
              <p className="text-sm text-muted-foreground">
                {format(appointment.date, 'EEEE, MMMM d, yyyy')} at {appointment.time}
              </p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
          <div className="mt-4 bg-muted/30 p-3 rounded-md border-l-4 border-primary/30">
            <p className="text-sm font-medium mb-1">Notes:</p>
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/20 flex justify-end gap-2 pt-3 pb-3">
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
  );
};

// Empty Appointments Component
interface EmptyAppointmentsProps {
  status: string;
}

const EmptyAppointments = ({ status }: EmptyAppointmentsProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No {status} appointments</h3>
      <p className="text-muted-foreground max-w-md mb-6 px-6">
        {status === "upcoming" ? 
          "You don't have any upcoming appointments scheduled. Contact your trustee if you need to schedule a meeting." :
          status === "completed" ?
          "You haven't completed any appointments yet. They will appear here after you've attended them." :
          status === "cancelled" ?
          "You don't have any cancelled appointments." :
          "You don't have any rescheduled appointments at this time."}
      </p>
    </div>
  );
};
