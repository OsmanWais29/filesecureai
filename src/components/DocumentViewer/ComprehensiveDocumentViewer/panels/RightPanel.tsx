
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Shield, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileX,
  Scale
} from 'lucide-react';
import { DocumentDetails } from '../../types';

interface RightPanelProps {
  document: DocumentDetails;
  onRiskResolved: () => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  document,
  onRiskResolved
}) => {
  const [activeTab, setActiveTab] = useState('risks');
  const complianceScore = 76; // Mock score

  // Mock risk data
  const risks = [
    {
      id: '1',
      type: 'Missing Signature',
      severity: 'high',
      description: 'Trustee signature required on page 2',
      regulation: 'BIA Section 66.13',
      deadline: '2024-01-15',
      status: 'open'
    },
    {
      id: '2',
      type: 'Incomplete Field',
      severity: 'medium',
      description: 'Debtor employment information incomplete',
      regulation: 'OSB Form Requirements',
      deadline: '2024-01-10',
      status: 'open'
    },
    {
      id: '3',
      type: 'Date Inconsistency',
      severity: 'low',
      description: 'Filing date format should be standardized',
      regulation: 'General Formatting',
      deadline: '2024-01-20',
      status: 'resolved'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Risk Assessment & Compliance</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="risks" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Risks
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Compliance
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              Deadlines
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="risks" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                {/* Risk Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Issue Severity Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm">High Risk</span>
                      </div>
                      <Badge variant="destructive">1</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm">Medium Risk</span>
                      </div>
                      <Badge variant="secondary">1</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Low Risk</span>
                      </div>
                      <Badge variant="outline">1</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk List */}
                <div className="space-y-3">
                  {risks.map((risk) => (
                    <Card key={risk.id} className={`border-l-4 ${
                      risk.severity === 'high' ? 'border-l-red-500' :
                      risk.severity === 'medium' ? 'border-l-orange-500' : 'border-l-green-500'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(risk.severity)}
                            <span className="font-medium text-sm">{risk.type}</span>
                          </div>
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {risk.description}
                        </p>
                        
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Scale className="h-3 w-3" />
                            <span>{risk.regulation}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>Due: {new Date(risk.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1">
                            Fix Now
                          </Button>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="compliance" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                {/* Compliance Score */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Compliance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{complianceScore}%</span>
                        <Badge variant={complianceScore >= 80 ? "default" : "destructive"}>
                          {complianceScore >= 80 ? "Good" : "Needs Work"}
                        </Badge>
                      </div>
                      <Progress value={complianceScore} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Compared to similar forms: +12% above average
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* BIA Compliance */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">BIA Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Required Fields Complete</span>
                      <Badge variant="destructive">85%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Signature Requirements</span>
                      <Badge variant="destructive">Incomplete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Date Consistency</span>
                      <Badge variant="default">Complete</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Legal References</span>
                      <Badge variant="default">Valid</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deadlines" className="h-full mt-2">
            <ScrollArea className="h-full px-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fix Deadlines & Auto Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {risks.filter(r => r.status === 'open').map((risk) => (
                      <div key={risk.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium text-sm">{risk.type}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(risk.deadline).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            Add to Calendar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
