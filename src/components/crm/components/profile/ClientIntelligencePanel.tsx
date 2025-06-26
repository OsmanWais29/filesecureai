
import { ClientInsightData } from "../../../activity/hooks/predictiveData/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle, Clock, Brain, TrendingUp, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ClientIntelligencePanelProps {
  insights: ClientInsightData;
}

export const ClientIntelligencePanel = ({ insights }: ClientIntelligencePanelProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-purple-500';
      case 'in_progress': return 'bg-amber-500';
      case 'proposal_sent': return 'bg-indigo-500';
      case 'closed_won': return 'bg-green-500';
      case 'closed_lost': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskIndicator = () => {
    if (insights.riskLevel === 'high') {
      return (
        <div className="flex items-center gap-2 text-red-600 p-2 bg-red-50 rounded-md">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">High risk - No activity in 30 days</span>
        </div>
      );
    } else if (insights.riskLevel === 'medium') {
      return (
        <div className="flex items-center gap-2 text-amber-600 p-2 bg-amber-50 rounded-md">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Medium risk - Monitor closely</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-green-600 p-2 bg-green-50 rounded-md">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Low risk - Engaged recently</span>
        </div>
      );
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Client Intelligence
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Lead Status */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Lead Status</label>
          </div>
          <Select defaultValue="in_progress">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Lead</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="proposal_sent">Proposal Sent</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Separator />

        {/* Account Health Score */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Account Health Score</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Badge 
                variant={insights.riskScore < 40 ? "destructive" : insights.riskScore < 70 ? "outline" : "secondary"}
                className="text-xs"
              >
                {insights.riskScore < 40 ? "At Risk" : insights.riskScore < 70 ? "Needs Attention" : "Healthy"}
              </Badge>
              <span className={`font-bold text-lg ${getHealthScoreColor(insights.riskScore)}`}>
                {insights.riskScore}%
              </span>
            </div>
            <Progress value={insights.riskScore} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Based on engagement, response time, and case complexity
            </p>
          </div>
        </div>
        
        <Separator />

        {/* Risk Assessment */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Risk Assessment</h4>
          </div>
          {getRiskIndicator()}
        </div>
        
        <Separator />

        {/* Case Progress */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-medium">Case Progress</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-medium">{insights.caseProgress}%</span>
            </div>
            <Progress value={insights.caseProgress} className="h-2" />
            
            {/* Milestones */}
            <div className="space-y-2 mt-4">
              <h5 className="text-xs font-medium text-muted-foreground">MILESTONES</h5>
              {insights.milestones?.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                    milestone.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-muted-foreground'
                  }`}>
                    {milestone.completed && <CheckCircle className="h-2 w-2 text-white" />}
                  </div>
                  <span className={milestone.completed ? 'text-foreground' : 'text-muted-foreground'}>
                    {milestone.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Separator />

        {/* AI Insights & Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">AI Recommendations</h4>
          </div>
          <div className="space-y-3">
            {insights.aiSuggestions
              .filter(s => s.type !== 'info')
              .map((suggestion, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-md text-sm border-l-4 ${
                    suggestion.type === 'urgent' 
                      ? 'bg-red-50 border-red-500 text-red-700' :
                    suggestion.type === 'warning' 
                      ? 'bg-amber-50 border-amber-500 text-amber-700' :
                    'bg-blue-50 border-blue-500 text-blue-700'
                  }`}
                >
                  <p className="font-medium mb-1">{suggestion.message}</p>
                  
                  {suggestion.action && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className={`p-0 h-auto text-xs font-medium hover:underline ${
                        suggestion.type === 'urgent' ? 'text-red-600 hover:text-red-700' :
                        suggestion.type === 'warning' ? 'text-amber-600 hover:text-amber-700' :
                        'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {suggestion.action} →
                    </Button>
                  )}
                </div>
              ))}
              
            {insights.aiSuggestions.filter(s => s.type !== 'info').length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No critical insights at this time</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </div>
  );
};
