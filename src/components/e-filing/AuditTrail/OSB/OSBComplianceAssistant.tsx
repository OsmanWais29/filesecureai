import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Clock, Download, FileCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComplianceSummary {
  trustAccountDiscrepancies: number;
  agedEstatesExceeding: number;
  missingForms: Array<{ form: string; estate: string }>;
  surplusIncomeRecalculationsDue: number;
  outstandingDebtorDuties: Array<string>;
  proposalVotingDeadlines: number;
}

interface RemediationTask {
  id: string;
  title: string;
  directive: string;
  priority: "high" | "medium" | "low";
  assignedTo?: string;
  dueDate?: string;
}

interface OSBComplianceAssistantProps {
  summary?: ComplianceSummary;
  tasks?: RemediationTask[];
}

export const OSBComplianceAssistant = ({
  summary = {
    trustAccountDiscrepancies: 0,
    agedEstatesExceeding: 3,
    missingForms: [{ form: "Form 6", estate: "Estate 234" }],
    surplusIncomeRecalculationsDue: 2,
    outstandingDebtorDuties: ["Counseling 2nd session not recorded"],
    proposalVotingDeadlines: 1
  },
  tasks = [
    { id: "1", title: "Upload missing appraisal", directive: "Directive 7", priority: "high" },
    { id: "2", title: "Review trust transfer flagged due to mismatch", directive: "Dir. 5R5", priority: "high" },
    { id: "3", title: "Update SDR for final distribution", directive: "BIA 170", priority: "medium" },
    { id: "4", title: "Complete final Form 2 report", directive: "BIA 102", priority: "medium" },
    { id: "5", title: "Provide documentation for creditor dispute", directive: "BIA 135", priority: "low" }
  ]
}: OSBComplianceAssistantProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 h-full overflow-y-auto px-2">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Compliance Assistant</h3>
        </div>
      </div>

      {/* AI-Generated Compliance Summary */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">OSB Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Trust Discrepancies</span>
              <Badge variant={summary.trustAccountDiscrepancies > 0 ? "destructive" : "default"}>
                {summary.trustAccountDiscrepancies}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Aged Estates</span>
              <Badge variant={summary.agedEstatesExceeding > 0 ? "destructive" : "default"}>
                {summary.agedEstatesExceeding}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Missing Forms</span>
              <Badge variant={summary.missingForms.length > 0 ? "destructive" : "default"}>
                {summary.missingForms.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Recalculations Due</span>
              <Badge variant={summary.surplusIncomeRecalculationsDue > 0 ? "destructive" : "default"}>
                {summary.surplusIncomeRecalculationsDue}
              </Badge>
            </div>
          </div>

          {summary.missingForms.length > 0 && (
            <Alert className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Missing forms:</strong>
                <ul className="list-disc pl-4 mt-1">
                  {summary.missingForms.map((item, idx) => (
                    <li key={idx}>
                      {item.form} ({item.estate})
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {summary.outstandingDebtorDuties.length > 0 && (
            <Alert className="mt-2">
              <Clock className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Outstanding duties:</strong>
                <ul className="list-disc pl-4 mt-1">
                  {summary.outstandingDebtorDuties.map((duty, idx) => (
                    <li key={idx}>{duty}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Auto-Generated Remediation Tasks */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Remediation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-3">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {task.directive}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.assignedTo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Assigned to: {task.assignedTo}
                        </p>
                      )}
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Due: {task.dueDate}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" className="h-8">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* OSB Audit Prep Export */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">OSB Audit Package</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Generate comprehensive audit package including:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 mb-4 pl-4">
            <li>• Complete audit trail</li>
            <li>• Version history of all filings</li>
            <li>• Trust account reconciliation logs</li>
            <li>• Debtor assessments</li>
            <li>• Surplus income calculations</li>
            <li>• Aging estate breakdown</li>
          </ul>
          <Button className="w-full" variant="default">
            <Download className="h-4 w-4 mr-2" />
            Generate OSB Audit Package
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
