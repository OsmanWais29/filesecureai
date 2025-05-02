
export type VerificationStatus = "verified" | "flagged" | "pending" | "missing" | "required";
export type RiskLevel = "high" | "medium" | "low";

export interface VerificationItem {
  id: string;
  status: VerificationStatus;
  label: string;
  details: string;
  icon: React.ReactNode;
}

export interface VerificationSection {
  id: string;
  title: string;
  items: VerificationItem[];
}

export interface RiskProfile {
  level: RiskLevel;
  primaryFactors: string[];
  recommendations: string[];
}

export interface VerificationStats {
  verified: number;
  flagged: number;
  missing: number;
  overallScore: number;
}

export interface VerificationData {
  sections: VerificationSection[];
  riskProfile: RiskProfile;
  stats: VerificationStats;
}
