
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User, AlertCircle, Video, Phone } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Meeting {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  meeting_type: string;
  status: string;
  metadata: any;
  trustee: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export const ClientAppointments = () => {
  const { user } = useAuthState();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMeetings();
    }
  }, [user]);

  const fetchMeetings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          *,
          profiles!meetings_trustee_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('client_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching meetings:', error);
        setError('Failed to load appointments');
        return;
      }
      
      const formattedMeetings = (data || []).map(meeting => ({
        ...meeting,
        trustee: meeting.profiles || {
          full_name: 'Unknown Trustee',
          email: '',
          phone: ''
        }
      }));
      
      setMeetings(formattedMeetings);
      setError(null);
    } catch (err) {
      console.error('Error in fetchMeetings:', err);
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'default';
      case 'confirmed': return 'secondary';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'in-person': return <MapPin className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'hh:mm a')
    };
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const isPast = (endTime: string) => {
    return new Date(endTime) < new Date();
  };

  const upcomingMeetings = meetings.filter(meeting => isUpcoming(meeting.start_time));
  const pastMeetings = meetings.filter(meeting => isPast(meeting.end_time));

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

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Appointments</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchMeetings} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <p className="text-muted-foreground">
          View your scheduled meetings with your trustee
        </p>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
        {upcomingMeetings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingMeetings.map((meeting) => {
              const startDateTime = formatDateTime(meeting.start_time);
              const endDateTime = formatDateTime(meeting.end_time);
              
              return (
                <Card key={meeting.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getMeetingTypeIcon(meeting.meeting_type)}
                          {meeting.title}
                        </CardTitle>
                        <CardDescription>{meeting.description}</CardDescription>
                      </div>
                      <Badge variant={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{startDateTime.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{startDateTime.time} - {endDateTime.time}</span>
                      </div>
                      {meeting.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{meeting.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.trustee.full_name}</span>
                      </div>
                    </div>
                    
                    {meeting.metadata?.meeting_link && (
                      <div className="pt-2">
                        <Button size="sm" asChild>
                          <a 
                            href={meeting.metadata.meeting_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Join Meeting
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastMeetings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Past Appointments</h2>
          <div className="space-y-4">
            {pastMeetings.slice(0, 5).map((meeting) => {
              const startDateTime = formatDateTime(meeting.start_time);
              
              return (
                <Card key={meeting.id} className="opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {getMeetingTypeIcon(meeting.meeting_type)}
                          {meeting.title}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {startDateTime.date} • {meeting.trustee.full_name}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Meeting */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-medium mb-2">Need to Schedule a Meeting?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact your trustee to schedule a new appointment
            </p>
            <Button variant="outline" disabled>
              Request Meeting
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
