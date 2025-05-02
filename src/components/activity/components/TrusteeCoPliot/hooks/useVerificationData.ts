
import { useState } from "react";
import { CheckCircle, AlertTriangle, X, AlertCircle } from "lucide-react";
import { VerificationData } from "../types";

export function useVerificationData() {
  // Enhanced verification data
  const [verificationData] = useState<VerificationData>({
    sections: [
      {
        id: "income",
        title: "Income Verification",
        items: [
          { id: "primary", status: "verified", label: "Primary income", details: "Paystub verified ($2,420.35)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "secondary", status: "pending", label: "Secondary income", details: "Cash income needs documentation", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
          { id: "spouse", status: "missing", label: "Spouse income", details: "Documentation missing", icon: <X className="h-5 w-5 text-red-500" /> }
        ]
      },
      {
        id: "expenses",
        title: "Expense Verification",
        items: [
          { id: "rent", status: "verified", label: "Housing expenses", details: "Rent receipt verified ($1,200)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "utilities", status: "verified", label: "Utilities", details: "Matches average ($275)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "food", status: "flagged", label: "Food expenses", details: "Above threshold for household size", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> },
          { id: "transportation", status: "verified", label: "Transportation", details: "Within acceptable range", icon: <CheckCircle className="h-5 w-5 text-green-500" /> }
        ]
      },
      {
        id: "compliance",
        title: "Regulatory Compliance",
        items: [
          { id: "surplus", status: "flagged", label: "Surplus income", details: "Exceeds threshold by $217.35", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
          { id: "directive", status: "verified", label: "Directive 11R2", details: "Calculation follows current guidelines", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "exceptions", status: "required", label: "Exception memo", details: "Required for cash income", icon: <AlertCircle className="h-5 w-5 text-yellow-500" /> }
        ]
      },
      {
        id: "consistency",
        title: "Data Consistency",
        items: [
          { id: "month-over-month", status: "flagged", label: "Month-over-month", details: "15% increase in discretionary expenses", icon: <AlertTriangle className="h-5 w-5 text-yellow-500" /> },
          { id: "family-size", status: "verified", label: "Family size alignment", details: "All dependents accounted for", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
          { id: "cross-document", status: "verified", label: "Cross-document validation", details: "Form 65 matches intake data", icon: <CheckCircle className="h-5 w-5 text-green-500" /> }
        ]
      }
    ],
    riskProfile: {
      level: "medium",
      primaryFactors: [
        "Cash income without proper documentation",
        "Above-threshold food expenses",
        "Surplus income exceeds BIA guidelines"
      ],
      recommendations: [
        "Request exception memo for cash income",
        "Schedule verification meeting for expense review",
        "Review surplus income implications with trustee"
      ]
    },
    stats: {
      verified: 7,
      flagged: 4, 
      missing: 1,
      overallScore: 75
    }
  });

  return { verificationData };
}
