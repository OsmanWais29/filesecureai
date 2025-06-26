
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Building, Phone, Mail, Calendar, TrendingUp } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company: string;
  status: string;
  lastActivity: string;
  riskScore: number;
}

interface ClientGridViewProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
  searchQuery: string;
  filterStatus: string;
  onExitGridView: () => void;
}

export const ClientGridView = ({ 
  clients, 
  onSelectClient, 
  searchQuery, 
  filterStatus,
  onExitGridView 
}: ClientGridViewProps) => {
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'at_risk': return 'destructive';
      default: return 'outline';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectClient(client.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={client.name} />
                      <AvatarFallback className="text-sm">
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{client.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {client.company}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(client.status)} className="text-xs">
                    {client.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Last activity: {new Date(client.lastActivity).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-muted-foreground">Risk Score:</span>
                    <span className={`font-medium ${getRiskScoreColor(client.riskScore)}`}>
                      {client.riskScore}%
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClient(client.id);
                  }}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No clients found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
