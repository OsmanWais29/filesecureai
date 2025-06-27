
import { useState, useEffect } from "react";

export interface VerificationStats {
  totalVerified: number;
  flaggedItems: number;
  confidenceScore: number;
}

export interface VerificationData {
  stats: VerificationStats;
}

export function useVerificationData() {
  const [verificationData, setVerificationData] = useState<VerificationData>({
    stats: {
      totalVerified: 2,
      flaggedItems: 1,
      confidenceScore: 87
    }
  });

  // Transform the data to match the StatsSidebar expected format
  const transformedStats = {
    verified: verificationData.stats.totalVerified,
    flagged: verificationData.stats.flaggedItems,
    missing: 0, // Add missing count
    overallScore: verificationData.stats.confidenceScore
  };

  return {
    verificationData, // Original format for VerificationPanel
    transformedStats  // Transformed format for StatsSidebar
  };
}
