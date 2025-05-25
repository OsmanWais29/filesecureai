
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, Phone, Plus } from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  meeting_type: string;
  location?: string;
  status: string;
}

export const ClientAppointments = () => {
  const { user } = useAuthState();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        title: 'Initial Consultation',
        description: 'Discuss your financial situation and available options',
        start_time: '2024-03-15T14:00:00Z',
        end_time: '2024-03-15T15:00:00Z',
        meeting_type: 'video',
        location: 'Online Meeting',
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Document Review',
        description: 'Review submitted financial documents',
        start_time: '2024-03-20T10:00:00Z',
        end_time: '2024-03-20T10:30:00Z',
        meeting_type: 'phone',
        status: 'scheduled'
      },
      {
        id: '3',
        title: 'Follow-up Meeting',
        description: 'Check progress and address any questions',
        start_time: '2024-02-28T13:00:00Z',
        end_time: '2024-02-28T13:30:00Z',
        meeting_type: 'in_person',
        location: '123 Business St, Toronto, ON',
        status: 'completed'
      }
    ];

    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 1000);
  }, [user]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'in_person':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.start_time) > new Date() && apt.status === 'scheduled'
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.start_time) <= new Date() || apt.status === 'completed'
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="h-20 bg-muted rounded"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            View and manage your scheduled meetings
          </p>
        </div>
        <Button onClick={() => toast.info('Appointment booking feature coming soon')}>
          <Plus className="h-4 w-4 mr-2" />
          Request Appointment
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
          <CardDescription>Your scheduled meetings and consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
              <p className="text-muted-foreground mb-4">
                Schedule a meeting with your trustee to discuss your case
              </p>
              <Button variant="outline">
                Request Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.start_time);
                return (
                  <div key={appointment.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{appointment.title}</h3>
                          <Badge variant={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground">
                            {appointment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {time}
                          </div>
                          <div className="flex items-center gap-1">
                            {getMeetingIcon(appointment.meeting_type)}
                            {appointment.meeting_type === 'video' && 'Video Call'}
                            {appointment.meeting_type === 'phone' && 'Phone Call'}
                            {appointment.meeting_type === 'in_person' && 'In Person'}
                          </div>
                        </div>
                        {appointment.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {appointment.location}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        {appointment.meeting_type === 'video' && (
                          <Button size="sm">
                            Join Meeting
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Appointments
            </CardTitle>
            <CardDescription>Your completed meetings and consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => {
                const { date, time } = formatDateTime(appointment.start_time);
                return (
                  <div key={appointment.id} className="p-4 border rounded-lg opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{appointment.title}</h3>
                          <Badge variant={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.description && (
                          <p className="text-sm text-muted-foreground">
                            {appointment.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientAppointments;
