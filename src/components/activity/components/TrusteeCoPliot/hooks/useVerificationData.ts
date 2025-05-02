
import { useState } from "react";
import { VerificationData } from "../types";

export function useVerificationData() {
  // Enhanced verification data
  const [verificationData] = useState<VerificationData>({
    sections: [
      {
        id: "income",
        title: "Income Verification",
        items: [
          { id: "primary", status: "verified", label: "Primary income", details: "Paystub verified ($2,420.35)", iconType: "check-circle" },
          { id: "secondary", status: "pending", label: "Secondary income", details: "Cash income needs documentation", iconType: "alert-triangle" },
          { id: "spouse", status: "missing", label: "Spouse income", details: "Documentation missing", iconType: "x" }
        ]
      },
      {
        id: "expenses",
        title: "Expense Verification",
        items: [
          { id: "rent", status: "verified", label: "Housing expenses", details: "Rent receipt verified ($1,200)", iconType: "check-circle" },
          { id: "utilities", status: "verified", label: "Utilities", details: "Matches average ($275)", iconType: "check-circle" },
          { id: "food", status: "flagged", label: "Food expenses", details: "Above threshold for household size", iconType: "alert-circle" },
          { id: "transportation", status: "verified", label: "Transportation", details: "Within acceptable range", iconType: "check-circle" }
        ]
      },
      {
        id: "compliance",
        title: "Regulatory Compliance",
        items: [
          { id: "surplus", status: "flagged", label: "Surplus income", details: "Exceeds threshold by $217.35", iconType: "alert-triangle" },
          { id: "directive", status: "verified", label: "Directive 11R2", details: "Calculation follows current guidelines", iconType: "check-circle" },
          { id: "exceptions", status: "required", label: "Exception memo", details: "Required for cash income", iconType: "alert-circle" }
        ]
      },
      {
        id: "consistency",
        title: "Data Consistency",
        items: [
          { id: "month-over-month", status: "flagged", label: "Month-over-month", details: "15% increase in discretionary expenses", iconType: "alert-triangle" },
          { id: "family-size", status: "verified", label: "Family size alignment", details: "All dependents accounted for", iconType: "check-circle" },
          { id: "cross-document", status: "verified", label: "Cross-document validation", details: "Form 65 matches intake data", iconType: "check-circle" }
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
