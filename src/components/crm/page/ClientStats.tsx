
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientStats as ClientStatsType } from "@/hooks/useClientManagement";
import { Users, UserCheck, UserMinus, Clock } from "lucide-react";

interface ClientStatsProps {
  stats: ClientStatsType;
  isLoading?: boolean;
}

export function ClientStats({ stats, isLoading = false }: ClientStatsProps) {
  const statItems = [
    {
      title: "Total Clients",
      value: stats.total,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      description: "All clients in the system",
    },
    {
      title: "Active Clients",
      value: stats.active,
      icon: <UserCheck className="h-4 w-4 text-green-500" />,
      description: "Currently active clients",
    },
    {
      title: "Inactive Clients",
      value: stats.inactive,
      icon: <UserMinus className="h-4 w-4 text-gray-500" />,
      description: "Inactive or closed clients",
    },
    {
      title: "Pending Clients",
      value: stats.pending,
      icon: <Clock className="h-4 w-4 text-yellow-500" />,
      description: "Clients awaiting approval",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {item.title}
            </CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              ) : (
                item.value
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
