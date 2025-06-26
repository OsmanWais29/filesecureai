import React, { useState } from 'react';
import { ClientGridView } from '../ClientGridView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Users, ArrowLeft } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company: string;
  status: string;
  lastActivity: string;
  riskScore: number;
}

interface AllClientsViewProps {
  onBackToProfile: () => void;
  onSelectClient: (clientId: string) => void;
}

export const AllClientsView = ({ onBackToProfile, onSelectClient }: AllClientsViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock client data - in a real app, this would come from an API
  const allClients: Client[] = [
    {
      id: "client1",
      name: "John Smith",
      company: "Tech Solutions Inc.",
      status: "active",
      lastActivity: "2024-01-15T10:30:00Z",
      riskScore: 85
    },
    {
      id: "client2", 
      name: "Sarah Johnson",
      company: "Marketing Pro Ltd.",
      status: "active",
      lastActivity: "2024-01-14T14:20:00Z",
      riskScore: 72
    },
    {
      id: "client3",
      name: "Michael Brown",
      company: "Construction Corp",
      status: "at_risk",
      lastActivity: "2024-01-10T09:15:00Z",
      riskScore: 35
    },
    {
      id: "client4",
      name: "Emily Davis",
      company: "Retail Express",
      status: "inactive",
      lastActivity: "2024-01-05T16:45:00Z",
      riskScore: 55
    },
    {
      id: "client5",
      name: "David Wilson",
      company: "Financial Services Co.",
      status: "active",
      lastActivity: "2024-01-16T11:00:00Z",
      riskScore: 90
    },
    {
      id: "client6",
      name: "Lisa Anderson",
      company: "Healthcare Solutions",
      status: "active",
      lastActivity: "2024-01-13T13:30:00Z",
      riskScore: 78
    }
  ];

  const handleClientSelect = (clientId: string) => {
    onSelectClient(clientId);
    onBackToProfile();
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToProfile}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6" />
              All Clients
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage and view all client profiles
            </p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {allClients.length} total clients
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Client Grid */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Client Directory</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <ClientGridView
              clients={allClients}
              onSelectClient={handleClientSelect}
              searchQuery={searchQuery}
              filterStatus={filterStatus}
              onExitGridView={onBackToProfile}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
