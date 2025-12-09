import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCode,
  Printer,
  Eye,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { OSBForm } from "@/types/estate";

interface OSBFormsTabProps {
  estateId: string;
  forms: OSBForm[];
  onGenerateForm: (formType: string) => void;
  onExportXML: (form: OSBForm) => void;
  onExportPDF: (form: OSBForm) => void;
  onSubmitForm: (form: OSBForm) => void;
}

// OSB Form definitions with mapping info
const formDefinitions = [
  { 
    number: '31', 
    title: 'Assignment for the General Benefit of Creditors', 
    category: 'Assignment',
    requiredFields: ['debtor_name', 'address', 'creditors', 'assets', 'liabilities'],
    description: 'Statement of Affairs / Schedules'
  },
  { 
    number: '12', 
    title: 'Statement of Receipts and Disbursements', 
    category: 'Reporting',
    requiredFields: ['receipts', 'disbursements', 'fees', 'distribution'],
    description: 'Final accounting of estate'
  },
  { 
    number: '47', 
    title: 'Consumer Proposal', 
    category: 'Proposal',
    requiredFields: ['debtor_info', 'terms', 'payment_schedule', 'creditor_list'],
    description: 'Consumer proposal acceptance'
  },
  { 
    number: '48', 
    title: 'Report of Trustee on Consumer Proposal', 
    category: 'Reporting',
    requiredFields: ['meeting_results', 'vote_tally', 'recommendation'],
    description: 'Meeting results and voting'
  },
  { 
    number: '65', 
    title: 'Proof of Claim', 
    category: 'Claims',
    requiredFields: ['creditor_info', 'claim_amount', 'priority', 'evidence'],
    description: 'Creditor proof of claim'
  },
  { 
    number: '79', 
    title: 'Notice to Creditors', 
    category: 'Notices',
    requiredFields: ['creditor_addresses', 'notice_type', 'meeting_info'],
    description: 'Notice of meeting/dividend'
  },
  { 
    number: '36', 
    title: 'Proof of Claim (Secured)', 
    category: 'Claims',
    requiredFields: ['creditor_info', 'secured_amount', 'collateral', 'valuation'],
    description: 'Secured creditor claim'
  },
];

export function OSBFormsTab({
  estateId,
  forms,
  onGenerateForm,
  onExportXML,
  onExportPDF,
  onSubmitForm,
}: OSBFormsTabProps) {
  const [generatingForm, setGeneratingForm] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      draft: { 
        icon: <Clock className="h-3 w-3" />, 
        className: 'bg-muted text-muted-foreground border-border',
        label: 'Draft'
      },
      ready: { 
        icon: <CheckCircle2 className="h-3 w-3" />, 
        className: 'bg-green-500/10 text-green-600 border-green-500/20',
        label: 'Ready'
      },
      submitted: { 
        icon: <Upload className="h-3 w-3" />, 
        className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        label: 'Submitted'
      },
      filed: { 
        icon: <CheckCircle2 className="h-3 w-3" />, 
        className: 'bg-primary/10 text-primary border-primary/20',
        label: 'Filed'
      },
    };
    const { icon, className, label } = config[status] || config.draft;
    return (
      <Badge variant="outline" className={className}>
        {icon}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  const getFormByNumber = (formNumber: string) => {
    return forms.find(f => f.form_number === formNumber);
  };

  const handleGenerateForm = async (formType: string) => {
    setGeneratingForm(formType);
    await onGenerateForm(formType);
    setGeneratingForm(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="h-5 w-5" />
                OSB Forms
              </CardTitle>
              <CardDescription>
                Generate, validate, and submit OSB-compliant forms
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All
              </Button>
              <Button size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Auto-Fill
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Forms by Category */}
      {['Assignment', 'Claims', 'Reporting', 'Notices', 'Proposal'].map(category => {
        const categoryForms = formDefinitions.filter(f => f.category === category);
        if (categoryForms.length === 0) return null;

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Form</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryForms.map((formDef) => {
                    const existingForm = getFormByNumber(formDef.number);
                    return (
                      <TableRow key={formDef.number}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono">Form {formDef.number}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formDef.title}</p>
                            <p className="text-xs text-muted-foreground">{formDef.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {existingForm ? (
                            getStatusBadge(existingForm.status)
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Not Generated
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {existingForm ? new Date(existingForm.updated_at).toLocaleDateString('en-CA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {existingForm ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => onExportPDF(existingForm)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => onExportXML(existingForm)}
                                >
                                  <FileCode className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => onExportPDF(existingForm)}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                                {existingForm.status === 'ready' && (
                                  <Button 
                                    size="sm"
                                    onClick={() => onSubmitForm(existingForm)}
                                  >
                                    <Upload className="h-4 w-4 mr-1" />
                                    Submit
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Button 
                                size="sm"
                                variant="outline"
                                disabled={generatingForm === formDef.number}
                                onClick={() => handleGenerateForm(formDef.number)}
                              >
                                {generatingForm === formDef.number ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="h-4 w-4 mr-1" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {/* XML/PDF Export Info */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              <span>XML exports follow OSB schema specifications</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>PDF exports are print-ready and compliant</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
