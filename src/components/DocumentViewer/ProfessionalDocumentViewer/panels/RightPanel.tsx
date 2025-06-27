
import React, { useState } from 'react';
import { DocumentDetails } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  Filter,
  ExternalLink,
  Flag,
  X,
  ChevronDown
} from 'lucide-react';

interface RightPanelProps {
  document: DocumentDetails;
  onClose?: () => void;
}

// Mock risk data - in real app this would come from document analysis
const mockRisks = [
  {
    id: '1',
    title: 'Missing Trustee Signature',
    severity: 'high' as const,
    page: 4,
    formType: 'Form 31',
    reasoning: 'Required trustee signature not detected on final page',
    biaViolation: 'BIA s.66.11(2)',
    clauseSummary: 'All proof of claim forms must be signed by the trustee',
    suggestedFix: 'Digitally sign Page 4 using DocuSign integration',
    deadline: '2025-01-15',
    status: 'pending'
  },
  {
    id: '2', 
    title: 'Inconsistent Date Format',
    severity: 'medium' as const,
    page: 2,
    formType: 'Form 31',
    reasoning: 'Date format differs from standard YYYY-MM-DD format',
    biaViolation: 'OSB Directive 12R',
    clauseSummary: 'All dates must follow standardized format',
    suggestedFix: 'Update date format to 2025-01-10',
    deadline: '2025-01-20',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Amount Verification Required',
    severity: 'low' as const,
    page: 3,
    formType: 'Form 31',
    reasoning: 'Claim amount appears higher than typical range',
    biaViolation: null,
    clauseSummary: 'Verification recommended for amounts over $50,000',
    suggestedFix: 'Review supporting documentation',
    deadline: '2025-01-25',
    status: 'pending'
  }
];

export const RightPanel: React.FC<RightPanelProps> = ({ document, onClose }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredRisks = mockRisks.filter(risk => {
    if (filterSeverity !== 'all' && risk.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && risk.status !== filterStatus) return false;
    return true;
  });

  const riskCounts = {
    high: mockRisks.filter(r => r.severity === 'high').length,
    medium: mockRisks.filter(r => r.severity === 'medium').length,
    low: mockRisks.filter(r => r.severity === 'low').length
  };

  const complianceScore = Math.round(((mockRisks.length - riskCounts.high * 3 - riskCounts.medium * 2 - riskCounts.low) / mockRisks.length) * 100);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Risk Assessment</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Compliance Score */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm">
            <span>Compliance Score</span>
            <span className="font-bold">{complianceScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className={`h-2 rounded-full ${complianceScore > 80 ? 'bg-green-500' : complianceScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${complianceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="risks" className="h-full flex flex-col">
          <div className="px-4 pt-2">
            <TabsList className="w-full">
              <TabsTrigger value="risks" className="flex-1 text-xs">
                Risks ({filteredRisks.length})
              </TabsTrigger>
              <TabsTrigger value="overview" className="flex-1 text-xs">
                Overview
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="risks" className="flex-1 overflow-hidden mt-0">
            {/* Filters */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="all">All Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>

            {/* Risk Cards */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredRisks.map((risk) => (
                  <Card key={risk.id} className="border-l-4" style={{
                    borderLeftColor: risk.severity === 'high' ? '#dc2626' : 
                                   risk.severity === 'medium' ? '#d97706' : '#16a34a'
                  }}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-medium">{risk.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${getSeverityColor(risk.severity)}`}>
                              {getSeverityIcon(risk.severity)}
                              <span className="ml-1">{risk.severity.toUpperCase()}</span>
                            </Badge>
                            <span className="text-xs text-muted-foreground">Page {risk.page}</span>
                            <span className="text-xs text-muted-foreground">{risk.formType}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedRisk === risk.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-3">{risk.reasoning}</p>
                      
                      {expandedRisk === risk.id && (
                        <div className="space-y-3 border-t pt-3">
                          {risk.biaViolation && (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <ExternalLink className="h-3 w-3" />
                                <span className="text-xs font-medium">BIA Violation</span>
                              </div>
                              <Button variant="link" className="text-xs p-0 h-auto text-blue-600">
                                {risk.biaViolation}
                              </Button>
                              <p className="text-xs text-muted-foreground mt-1">{risk.clauseSummary}</p>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-xs font-medium">Suggested Fix:</span>
                            <p className="text-xs text-muted-foreground mt-1">{risk.suggestedFix}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3" />
                            <span>Deadline: {new Date(risk.deadline).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Fix Now
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs">
                              <Flag className="h-3 w-3 mr-1" />
                              False Positive
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Document Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Document Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client Name:</span>
                        <span className="font-medium">John Doe (OCR)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Trustee:</span>
                        <span className="font-medium">Smith & Associates</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Document Type:</span>
                        <span className="font-medium">{document.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date Uploaded:</span>
                        <span className="font-medium">{new Date(document.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Uploaded By:</span>
                        <span className="font-medium">Admin User</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">AI Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This document appears to be a Form 31 Proof of Claim with {mockRisks.length} identified issues. 
                      The document contains standard bankruptcy proceeding information and requires {riskCounts.high} critical fixes 
                      before submission to ensure BIA compliance.
                    </p>
                  </CardContent>
                </Card>

                {/* Version History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Version History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>v1.0 (Current)</span>
                        <span className="text-muted-foreground">Today</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View All Versions
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
