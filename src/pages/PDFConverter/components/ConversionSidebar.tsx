
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, Download, Edit, Search, Clock } from "lucide-react";

interface ConversionHistory {
  id: string;
  fileName: string;
  clientName: string;
  documentType: string;
  date: string;
  status: 'completed' | 'pending' | 'error';
}

export const ConversionSidebar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<'all' | 'client' | 'date' | 'type'>('all');

  // Mock data for recent conversions
  const conversions: ConversionHistory[] = [
    {
      id: '1',
      fileName: 'Form65_JohnDoe.pdf',
      clientName: 'John Doe',
      documentType: 'Form 65',
      date: '2025-01-27',
      status: 'completed'
    },
    {
      id: '2',
      fileName: 'BankStatement_JaneSmith.pdf', 
      clientName: 'Jane Smith',
      documentType: 'Bank Statement',
      date: '2025-01-26',
      status: 'completed'
    },
    {
      id: '3',
      fileName: 'Form66_BobJohnson.pdf',
      clientName: 'Bob Johnson', 
      documentType: 'Form 66',
      date: '2025-01-25',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredConversions = conversions.filter(conv =>
    conv.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.documentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 border-r bg-card flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          Recent Conversions
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Clock className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Resume Last Conversion
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Download All as ZIP
            </Button>
          </div>
        </div>

        {/* Conversion History */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Filter by: Client, Date, Document Type
          </h3>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredConversions.map((conversion) => (
                <Card key={conversion.id} className="p-3 hover:bg-accent cursor-pointer">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {conversion.fileName}
                      </span>
                      <Badge className={getStatusColor(conversion.status)}>
                        {conversion.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Client: {conversion.clientName}</div>
                      <div>Type: {conversion.documentType}</div>
                      <div>Date: {conversion.date}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </div>
  );
};
