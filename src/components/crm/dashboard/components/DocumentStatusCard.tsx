
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface DocumentStatusCardProps {
  clientId: string;
}

export const DocumentStatusCard = ({ clientId }: DocumentStatusCardProps) => {
  // Mock documents - in real app this would be fetched based on clientId
  const documents = [
    {
      id: '1',
      name: 'Form 47 - Consumer Proposal',
      type: 'Legal Form',
      status: 'completed',
      lastUpdated: '2024-06-20',
      completeness: 100
    },
    {
      id: '2',
      name: 'Financial Statements',
      type: 'Financial',
      status: 'in-review',
      lastUpdated: '2024-06-18',
      completeness: 85
    },
    {
      id: '3',
      name: 'Bank Statements',
      type: 'Financial',
      status: 'missing',
      lastUpdated: null,
      completeness: 0
    },
    {
      id: '4',
      name: 'Income Verification',
      type: 'Employment',
      status: 'completed',
      lastUpdated: '2024-06-15',
      completeness: 100
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-review': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'missing': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-review': return 'bg-blue-100 text-blue-800';
      case 'missing': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(doc.status)}
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.type}</p>
                  {doc.lastUpdated && (
                    <p className="text-xs text-gray-500">Updated: {doc.lastUpdated}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge className={getStatusColor(doc.status)} variant="secondary">
                  {doc.status}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">{doc.completeness}%</p>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-4">
            View All Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
