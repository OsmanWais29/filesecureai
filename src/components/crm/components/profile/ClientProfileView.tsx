
import React from 'react';
import { ClientProfilePanel } from './ClientProfilePanel';
import { ClientActivityPanel } from './ClientActivityPanel';
import { ClientIntelligencePanel } from './ClientIntelligencePanel';
import { useClientInsights } from './hooks/useClientInsights';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus, MessageSquare, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const ClientProfileView = () => {
  const { insights, isLoading, selectedClient, setSelectedClient, refreshInsights } = useClientInsights();

  const handleRefresh = async () => {
    await refreshInsights();
    toast.success('Client insights refreshed');
  };

  const handleQuickAction = (action: string) => {
    toast.success(`${action} initiated for ${selectedClient}`);
  };

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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction('New Client')}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            New Client
          </Button>
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
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction('Send Message')}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickAction('Schedule Meeting')}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
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
