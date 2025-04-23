
export interface AnalysisResult {
  extracted_info: {
    formNumber: string;
    clientName: string;
    dateSigned: string;
    trusteeName: string;
    type: string;
    summary: string;
    clientAddress?: string;
    clientPhone?: string;
    clientEmail?: string;
    trusteeAddress?: string;
    trusteePhone?: string;
    trusteeEmail?: string;
    totalDebts?: string;
    totalAssets?: string;
    monthlyIncome?: string;
    
    // Fields for specific form types
    creditorAddress?: string;
    creditorPhone?: string;
    creditorEmail?: string;
    claimAmount?: string;
    creditorName?: string;
  };
  risks: Array<{
    type: string;
    description: string;
    severity: string;
    regulation: string;
    impact: string;
    requiredAction: string;
    solution: string;
    deadline: string;
  }>;
  regulatory_compliance: {
    status: string;
    details: string;
    references: string[];
  };
}
