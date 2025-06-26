
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Mail, Calendar } from 'lucide-react';

interface CommunicationHubProps {
  clientId: string;
}

export const CommunicationHub = ({ clientId }: CommunicationHubProps) => {
  const handleAction = (action: string) => {
    console.log(`${action} initiated for client ${clientId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => handleAction('Call')}
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => handleAction('Email')}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => handleAction('Message')}
          >
            <MessageSquare className="h-4 w-4" />
            Message
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => handleAction('Schedule')}
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
