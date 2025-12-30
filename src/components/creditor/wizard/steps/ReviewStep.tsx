import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, FileText, Shield, Star, DollarSign, Sparkles } from "lucide-react";
import { AddCreditorFormData } from "@/types/creditor";

interface ReviewStepProps {
  formData: AddCreditorFormData;
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const formatCurrency = (amount?: number) => amount ? new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(amount) : "N/A";

  // AI Risk Assessment (simulated)
  const risks: string[] = [];
  if (!formData.proof_of_claim_file && formData.claim_filed === "yes") risks.push("Missing Proof of Claim document");
  if (formData.priority === "secured" && !formData.collateral_description) risks.push("Security type selected but no collateral described");
  if (formData.creditor_type === "government" && formData.government_type === "cra" && !formData.cra_claim_type) risks.push("CRA creditor without claim type specified");

  const completeness = Math.round(((formData.name ? 1 : 0) + (formData.email ? 1 : 0) + (formData.address ? 1 : 0) + (formData.claim_amount ? 1 : 0) + (formData.proof_of_claim_file ? 1 : 0)) / 5 * 100);

  return (
    <div className="space-y-6">
      {/* AI Risk Panel */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Compliance Review
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Completeness Score</span>
            <Badge variant={completeness >= 80 ? "default" : "secondary"}>{completeness}%</Badge>
          </div>
          {risks.length > 0 ? (
            <Alert variant="destructive" className="bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside text-sm">
                  {risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-500/10 border-green-500/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">No compliance issues detected</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Creditor Identity</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><strong>Name:</strong> {formData.name || "Not specified"}</p>
            <p><strong>Type:</strong> {formData.creditor_type.replace("_", " ")}</p>
            <p><strong>Email:</strong> {formData.email || "N/A"}</p>
            <p><strong>Phone:</strong> {formData.phone || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Claim Details</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><strong>Filed:</strong> {formData.claim_filed === "yes" ? "Yes" : formData.claim_filed === "no" ? "No" : "Not Yet"}</p>
            <p><strong>Amount:</strong> {formatCurrency(formData.claim_amount)}</p>
            <div className="flex items-center gap-2">
              <strong>Priority:</strong>
              <Badge variant="outline" className="text-xs">
                {formData.priority === "secured" && <Shield className="h-3 w-3 mr-1" />}
                {formData.priority === "preferred" && <Star className="h-3 w-3 mr-1" />}
                {formData.priority === "unsecured" && <DollarSign className="h-3 w-3 mr-1" />}
                {formData.priority}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Documents</CardTitle></CardHeader>
          <CardContent className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Proof of Claim: {formData.proof_of_claim_file ? "✓ Uploaded" : "Not uploaded"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Supporting: {(formData.supporting_documents?.length || 0)} files</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
