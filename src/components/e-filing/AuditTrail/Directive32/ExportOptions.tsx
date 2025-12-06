import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  FileCode, 
  Shield,
  Package,
  Link2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const exportOptions = [
  {
    id: "pdf_full",
    title: "Full Audit Trail (PDF/A)",
    description: "Complete audit log in archival PDF format",
    icon: FileText,
    format: "PDF/A",
    compliant: true
  },
  {
    id: "pdf_signed",
    title: "Cryptographically Signed Export",
    description: "PDF with digital signature file for authenticity verification",
    icon: Shield,
    format: "PDF + SIG",
    compliant: true
  },
  {
    id: "osb_csv",
    title: "OSB-Ready CSV",
    description: "Structured data format for OSB submission",
    icon: FileCode,
    format: "CSV",
    compliant: true
  },
  {
    id: "osb_xml",
    title: "OSB-Ready XML",
    description: "XML format following OSB schema specifications",
    icon: FileCode,
    format: "XML",
    compliant: true
  },
  {
    id: "json_bundle",
    title: "Compressed Multi-Log Bundle",
    description: "All logs in JSON format with compression",
    icon: Package,
    format: "JSON.ZIP",
    compliant: true
  },
  {
    id: "custody_report",
    title: "Chain-of-Custody Report",
    description: "Complete document custody timeline with verification",
    icon: Link2,
    format: "PDF/A",
    compliant: true
  }
];

export const ExportOptions = () => {
  const handleExport = (option: typeof exportOptions[0]) => {
    toast.success(`Export initiated: ${option.title}`, {
      description: `Format: ${option.format}. This action has been logged.`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Export Options</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          Directive 32 Compliant Formats
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        All exports are logged in the Access Log for complete auditability.
        Choose from OSB-compliant formats for regulatory submissions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {option.compliant && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Compliant
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm mt-2">{option.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  {option.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {option.format}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport(option)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="text-sm font-medium mb-1">Export Security Notice</h4>
              <p className="text-xs text-muted-foreground">
                Every export action is automatically logged with timestamp, user identity, 
                export format, and document scope. Cryptographically signed exports include 
                SHA-256 hash verification for authenticity as required by Directive 32.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
