import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, Info } from "lucide-react";
import { AddCreditorFormData } from "@/types/creditor";
import { Button } from "@/components/ui/button";

interface DocumentsStepProps {
  formData: AddCreditorFormData;
  updateFormData: (updates: Partial<AddCreditorFormData>) => void;
  errors: string[];
}

export function DocumentsStep({ formData, updateFormData, errors }: DocumentsStepProps) {
  const onDropProof = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      updateFormData({ proof_of_claim_file: acceptedFiles[0] });
    }
  }, [updateFormData]);

  const onDropSecurity = useCallback((acceptedFiles: File[]) => {
    updateFormData({ security_documents: [...(formData.security_documents || []), ...acceptedFiles] });
  }, [formData.security_documents, updateFormData]);

  const onDropSupporting = useCallback((acceptedFiles: File[]) => {
    updateFormData({ supporting_documents: [...(formData.supporting_documents || []), ...acceptedFiles] });
  }, [formData.supporting_documents, updateFormData]);

  const proofDropzone = useDropzone({ onDrop: onDropProof, maxFiles: 1, accept: { 'application/pdf': ['.pdf'] } });
  const securityDropzone = useDropzone({ onDrop: onDropSecurity, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] } });
  const supportingDropzone = useDropzone({ onDrop: onDropSupporting });

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-500/5 border-blue-500/20">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription>
          Upload supporting documents now or add them later. Documents are critical for audit defensibility.
        </AlertDescription>
      </Alert>

      {/* Proof of Claim */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Proof of Claim (Form 31)</Label>
        <div
          {...proofDropzone.getRootProps()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...proofDropzone.getInputProps()} />
          {formData.proof_of_claim_file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">{formData.proof_of_claim_file.name}</p>
                <p className="text-sm text-muted-foreground">{(formData.proof_of_claim_file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); updateFormData({ proof_of_claim_file: undefined }); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drop Form 31 here or click to upload</p>
            </>
          )}
        </div>
      </div>

      {/* Security Documents */}
      {formData.priority === "secured" && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Security Documents</Label>
          <div
            {...securityDropzone.getRootProps()}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input {...securityDropzone.getInputProps()} />
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Drop PPSA registrations, mortgages, or lien documents</p>
          </div>
          {formData.security_documents && formData.security_documents.length > 0 && (
            <div className="space-y-2">
              {formData.security_documents.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => updateFormData({ security_documents: formData.security_documents?.filter((_, idx) => idx !== i) })}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supporting Documents */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Other Supporting Documents</Label>
        <div
          {...supportingDropzone.getRootProps()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        >
          <input {...supportingDropzone.getInputProps()} />
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Statements, judgments, correspondence, etc.</p>
        </div>
        {formData.supporting_documents && formData.supporting_documents.length > 0 && (
          <div className="space-y-2">
            {formData.supporting_documents.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{file.name}</span>
                <Button variant="ghost" size="icon" onClick={() => updateFormData({ supporting_documents: formData.supporting_documents?.filter((_, idx) => idx !== i) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
