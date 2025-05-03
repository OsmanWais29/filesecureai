
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Settings, Save } from 'lucide-react';

export const MeetingsSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meeting Settings</h2>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Calendar Settings</CardTitle>
          <CardDescription>
            Configure your meeting calendar preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox id="automatic-reminders" defaultChecked />
              <div className="space-y-1 leading-none">
                <Label htmlFor="automatic-reminders">
                  Enable automatic meeting reminders
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send email reminders 24 hours before meetings
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox id="buffer-time" defaultChecked />
              <div className="space-y-1 leading-none">
                <Label htmlFor="buffer-time">
                  Add buffer time between meetings
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add 15 minutes buffer between consecutive meetings
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox id="meeting-notes" />
              <div className="space-y-1 leading-none">
                <Label htmlFor="meeting-notes">
                  Enable automatic meeting notes
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create a note template for each meeting type
                </p>
              </div>
            </div>
            
            <div className="flex flex-row items-start space-x-3 space-y-0">
              <Checkbox id="sync-outlook" defaultChecked />
              <div className="space-y-1 leading-none">
                <Label htmlFor="sync-outlook">
                  Sync with Outlook calendar
                </Label>
                <p className="text-sm text-muted-foreground">
                  Keep your Outlook calendar in sync with SecureFiles AI
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Meeting Templates</CardTitle>
          <CardDescription>
            Manage your meeting templates and default settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Initial Consultation</h3>
                  <p className="text-sm text-muted-foreground">30 minutes, Video call</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Document Review</h3>
                  <p className="text-sm text-muted-foreground">45 minutes, Video call</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Financial Assessment</h3>
                  <p className="text-sm text-muted-foreground">60 minutes, In person</p>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
