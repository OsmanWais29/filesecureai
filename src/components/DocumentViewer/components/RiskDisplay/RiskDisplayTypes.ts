
export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  biaReference: string;
  fieldLocation: string;
  deadline?: string;
  assignedTo?: string;
}

export interface ColorCodedRiskDisplayProps {
  risks: RiskFactor[];
  overallRisk: 'low' | 'medium' | 'high';
  onJumpToField?: (fieldLocation: string) => void;
  onViewBIAReference?: (reference: string) => void;
  onCreateTask?: (risk: RiskFactor) => void;
}
