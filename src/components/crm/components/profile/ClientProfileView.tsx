
import React, { useState } from 'react';
import { ClientProfilePanel } from './ClientProfilePanel';
import { ClientActivityPanel } from './ClientActivityPanel';
import { ClientIntelligencePanel } from './ClientIntelligencePanel';
import { AllClientsView } from './AllClientsView';
import { useClientInsights } from './hooks/useClientInsights';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { RefreshCw, Users, ChevronDown, MessageSquare, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const ClientProfileView = () => {
  const { insights, isLoading, selectedClient, setSelectedClient, refreshInsights, availableClients } = useClientInsights();
  const [showAllClients, setShowAllClients] = useState(false);

  const handleRefresh = async () => {
    await refreshInsights();
    toast.success('Client insights refreshed');
  };

  const handleClientAction = (action: string) => {
    toast.success(`${action} initiated`);
  };

  const handleClientSelect = (clientName: string) => {
    setSelectedClient(clientName);
    toast.success(`Switched to ${clientName}'s profile`);
  };

  const handleViewAllClients = () => {
    setShowAllClients(true);
    toast.info('Loading all clients view...');
  };

  const handleBackToProfile = () => {
    setShowAllClients(false);
  };

  const handleSelectClientFromAll = (clientId: string) => {
    // Map client ID to client name (in a real app, you'd have proper mapping)
    const clientNameMap: { [key: string]: string } = {
      'client1': 'John Smith',
      'client2': 'Sarah Johnson', 
      'client3': 'Michael Brown',
      'client4': 'Emily Davis',
      'client5': 'David Wilson',
      'client6': 'Lisa Anderson'
    };
    
    const clientName = clientNameMap[clientId] || clientId;
    setSelectedClient(clientName);
    toast.success(`Switched to ${clientName}'s profile`);
  };

  // Show All Clients View if requested
  if (showAllClients) {
    return (
      <AllClientsView 
        onBackToProfile={handleBackToProfile}
        onSelectClient={handleSelectClientFromAll}
      />
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Profile</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive client overview and intelligence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Client Options
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {availableClients
                .filter(client => client !== selectedClient)
                .map((clientName) => (
                  <DropdownMenuItem 
                    key={clientName}
                    onClick={() => handleClientSelect(clientName)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {clientName} Profile
                  </DropdownMenuItem>
                ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewAllClients}>
                <Eye className="h-4 w-4 mr-2" />
                View All Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Action Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Active Client:</span>
              <span className="ml-2 font-medium">{selectedClient}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Risk Level:</span>
              <span className={`ml-2 font-medium ${
                insights.riskLevel === 'high' ? 'text-red-600' :
                insights.riskLevel === 'medium' ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {insights.riskLevel.charAt(0).toUpperCase() + insights.riskLevel.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClientAction('Send Message')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Panel - Client Information */}
        <Card className="lg:col-span-1 overflow-hidden">
          <ClientProfilePanel 
            insights={insights} 
            clientName={selectedClient}
          />
        </Card>

        {/* Center Panel - Activity & Timeline */}
        <Card className="lg:col-span-1 overflow-hidden">
          <ClientActivityPanel insights={insights} />
        </Card>

        {/* Right Panel - Intelligence & Insights */}
        <Card className="lg:col-span-1 overflow-hidden">
          <ClientIntelligencePanel insights={insights} />
        </Card>
      </div>
    </div>
  );
};
