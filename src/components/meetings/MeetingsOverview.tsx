
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ClipboardCheck, LineChart, Video, Users } from "lucide-react";

interface MeetingsOverviewProps {
  setActiveTab: (tab: string) => void;
}

export const MeetingsOverview = ({ setActiveTab }: MeetingsOverviewProps) => {
  // Feature cards for meetings capabilities
  const meetingFeatures = [
    {
      title: "Upcoming Meetings",
      description: "View and manage your scheduled meetings",
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      action: () => setActiveTab("upcoming"),
      buttonText: "View Calendar",
    },
    {
      title: "Join Meeting",
      description: "Start or join virtual meetings with clients",
      icon: <Video className="h-8 w-8 text-purple-500" />,
      action: () => setActiveTab("join"),
      buttonText: "Join Now",
    },
    {
      title: "Meeting Notes",
      description: "Create and access meeting notes",
      icon: <ClipboardCheck className="h-8 w-8 text-green-500" />,
      action: () => setActiveTab("notes"),
      buttonText: "Take Notes",
    },
    {
      title: "Meeting Agenda",
      description: "Prepare and share meeting agendas",
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      action: () => setActiveTab("agenda"),
      buttonText: "Create Agenda",
    },
    {
      title: "Analytics",
      description: "Review insights and metrics from past meetings",
      icon: <LineChart className="h-8 w-8 text-indigo-500" />,
      action: () => setActiveTab("analytics"),
      buttonText: "View Analytics",
    },
    {
      title: "Client Feedback",
      description: "Collect and manage client feedback after meetings",
      icon: <Users className="h-8 w-8 text-rose-500" />,
      action: () => setActiveTab("analytics"), // Redirects to analytics that includes feedback
      buttonText: "View Feedback",
    },
  ];

  // Quick stats for meeting overview
  const quickStats = [
    { label: "Upcoming Meetings", value: "5" },
    { label: "This Week", value: "12" },
    { label: "Avg. Duration", value: "45 min" },
    { label: "Satisfaction", value: "4.8/5" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-muted/50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meeting features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {meetingFeatures.map((feature, index) => (
          <Card key={index} className="border shadow-sm transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={feature.action} className="w-full">
                {feature.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
