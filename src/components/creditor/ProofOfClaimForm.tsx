import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Shield,
  Star,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Loader2,
} from "lucide-react";
import { ClaimPriority } from "@/types/creditor";

interface ProofOfClaimFormProps {
  creditorId: string;
  creditorName: string;
  onSubmit: (data: ProofOfClaimData) => void;
  onCancel: () => void;
}

interface ProofOfClaimData {
  claim_amount: number;
  secured_amount: number;
  preferred_amount: number;
  unsecured_amount: number;
  priority: ClaimPriority;
  collateral_description?: string;
  collateral_value?: number;
  supporting_documents: File[];
  is_late_filing: boolean;
  statutory_declaration: boolean;
}

interface AIValidation {
  isValid: boolean;
  suggestions: string[];
  autoClassification?: ClaimPriority;
  confidence: number;
}

export function ProofOfClaimForm({
  creditorId,
  creditorName,
  onSubmit,
  onCancel,
}: ProofOfClaimFormProps) {
  const [formData, setFormData] = useState<ProofOfClaimData>({
    claim_amount: 0,
    secured_amount: 0,
    preferred_amount: 0,
    unsecured_amount: 0,
    priority: 'unsecured',
    supporting_documents: [],
    is_late_filing: false,
    statutory_declaration: false,
  });

  const [isValidating, setIsValidating] = useState(false);
  const [aiValidation, setAiValidation] = useState<AIValidation | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    setFormData(prev => ({
      ...prev,
      supporting_documents: [...prev.supporting_documents, ...files],
    }));
  };

  const handleAIValidation = async () => {
    setIsValidating(true);
    // Simulate AI validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAiValidation({
      isValid: true,
      suggestions: [
        "Claim amount matches supporting documentation",
        "Consider classifying as secured - collateral detected",
      ],
      autoClassification: formData.collateral_description ? 'secured' : 'unsecured',
      confidence: 0.92,
    });
    setIsValidating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Auto-calculate unsecured amount
  const calculatedUnsecured = Math.max(0, 
    formData.claim_amount - formData.secured_amount - formData.preferred_amount
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proof of Claim</CardTitle>
          <CardDescription>
            Filing for: {creditorName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Claim Amounts */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="claim_amount">Total Claim Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="claim_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.claim_amount || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      claim_amount: parseFloat(e.target.value) || 0,
                    }))}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secured_amount">Secured Amount</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <Input
                    id="secured_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.claim_amount}
                    value={formData.secured_amount || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      secured_amount: parseFloat(e.target.value) || 0,
                    }))}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_amount">Preferred Amount</Label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                  <Input
                    id="preferred_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.claim_amount - formData.secured_amount}
                    value={formData.preferred_amount || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferred_amount: parseFloat(e.target.value) || 0,
                    }))}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unsecured Amount (Calculated)</Label>
                <div className="p-3 rounded-lg bg-muted font-mono">
                  {formatCurrency(calculatedUnsecured)}
                </div>
              </div>
            </div>
          </div>

          {/* Priority Classification */}
          <div className="space-y-3">
            <Label>Claim Priority</Label>
            <RadioGroup
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                priority: value as ClaimPriority,
              }))}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="secured" id="secured" />
                <Label htmlFor="secured" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Secured
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="preferred" id="preferred" />
                <Label htmlFor="preferred" className="flex items-center gap-2 cursor-pointer">
                  <Star className="h-4 w-4 text-amber-500" />
                  Preferred
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="unsecured" id="unsecured" />
                <Label htmlFor="unsecured" className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Unsecured
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Collateral (if secured) */}
          {(formData.priority === 'secured' || formData.secured_amount > 0) && (
            <div className="space-y-4 p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Collateral Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="collateral_description">Collateral Description</Label>
                  <Textarea
                    id="collateral_description"
                    value={formData.collateral_description || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      collateral_description: e.target.value,
                    }))}
                    placeholder="Describe the collateral securing this claim..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collateral_value">Collateral Value</Label>
                  <Input
                    id="collateral_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.collateral_value || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      collateral_value: parseFloat(e.target.value) || 0,
                    }))}
                    placeholder="Estimated value"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          <div className="space-y-3">
            <Label>Supporting Documents</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, JPG, PNG
                </p>
              </label>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {(file.size / 1024).toFixed(0)} KB
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Late Filing */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="late_filing"
              checked={formData.is_late_filing}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                is_late_filing: checked as boolean,
              }))}
            />
            <Label htmlFor="late_filing" className="text-sm">
              This is a late filing (filed after the claims bar date)
            </Label>
          </div>

          {/* Statutory Declaration */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="statutory_declaration"
              checked={formData.statutory_declaration}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                statutory_declaration: checked as boolean,
              }))}
            />
            <Label htmlFor="statutory_declaration" className="text-sm">
              I confirm this claim is accurate and complete (Statutory Declaration)
            </Label>
          </div>

          {/* AI Validation */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleAIValidation}
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Validate with SAFA AI
                </>
              )}
            </Button>

            {aiValidation && (
              <div className={`p-4 rounded-lg border ${
                aiValidation.isValid 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {aiValidation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">AI Validation Results</span>
                  </div>
                  <Badge variant="outline">
                    {Math.round(aiValidation.confidence * 100)}% confidence
                  </Badge>
                </div>
                <ul className="space-y-1">
                  {aiValidation.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
                {aiValidation.autoClassification && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Suggested classification: </span>
                      <Badge variant="outline" className="capitalize ml-1">
                        {aiValidation.autoClassification}
                      </Badge>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.statutory_declaration || formData.claim_amount <= 0}>
          Submit Proof of Claim
        </Button>
      </div>
    </form>
  );
}
