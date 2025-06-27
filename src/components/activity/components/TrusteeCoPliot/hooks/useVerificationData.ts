
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

  return {
    verificationData
  };
}
