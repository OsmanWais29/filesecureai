import { AnalysisResult } from '../types/analysisTypes';

export const getMockForm31Data = (): AnalysisResult => {
  return {
    extracted_info: {
      formNumber: "31",
      type: "form-31",
      clientName: "Acme Corporation",
      dateSigned: "March 15, 2025",
      trusteeName: "Jane Smith, LIT",
      summary: "Proof of Claim (Form 31) filed by Acme Corporation as creditor",
      creditorAddress: "123 Business Ave, Toronto, ON M5H 2N2",
      creditorPhone: "(416) 555-0123",
      creditorEmail: "claims@acmecorp.com",
      trusteeAddress: "456 Financial Street, Toronto, ON M5J 2T3",
      trusteePhone: "(416) 555-0456",
      trusteeEmail: "jane.smith@trustee.ca",
      claimAmount: "$45,000.00",
      creditorName: "Acme Corporation"
    },
    risks: [
      {
        type: "compliance",
        description: "Missing Creditor Details",
        severity: "high",
        regulation: "BIA Rule 114(1)",
        impact: "May delay claim processing",
        requiredAction: "Complete all creditor information fields",
        solution: "Add complete creditor contact information",
        deadline: "Immediately"
      },
      {
        type: "compliance",
        description: "No Claim Amount Specified",
        severity: "high",
        regulation: "BIA Section 124(1)",
        impact: "Claim cannot be validated without amount",
        requiredAction: "Specify total claim amount",
        solution: "Add claim amount in dollars and cents",
        deadline: "Immediately"
      },
      {
        type: "legal",
        description: "Missing Supporting Documentation",
        severity: "medium",
        regulation: "BIA Section 124(2)",
        impact: "Claim may be disallowed without evidence",
        requiredAction: "Attach relevant supporting documents",
        solution: "Append invoices, contracts, statements, etc.",
        deadline: "3 days"
      },
      {
        type: "compliance",
        description: "Unsigned Proof of Claim",
        severity: "high",
        regulation: "BIA Rule 124(4)",
        impact: "Claim is invalid without signature",
        requiredAction: "Ensure document is properly signed",
        solution: "Obtain creditor signature on claim form",
        deadline: "Immediately"
      },
      {
        type: "compliance",
        description: "Claim Type Not Selected",
        severity: "medium",
        regulation: "BIA Rules",
        impact: "Cannot determine claim classification",
        requiredAction: "Select appropriate claim type",
        solution: "Check applicable box for claim category",
        deadline: "2 days"
      }
    ],
    regulatory_compliance: {
      status: "requires_review",
      details: "Form 31 Proof of Claim requires verification of claim details",
      references: [
        "BIA Rule 114(1)",
        "BIA Section 124(1)",
        "BIA Section 124(2)",
        "BIA Rule 124(4)"
      ]
    }
  };
};

export const getMockForm65Data = (): AnalysisResult => {
  return {
    extracted_info: {
      formNumber: "65",
      clientName: "John Smith",
      dateSigned: "2023-04-15",
      trusteeName: "Jane Doe, LIT",
      type: "Notice of Intention",
      summary: "Notice of Intention to Make a Proposal (Form 65)"
    },
    risks: [
      {
        type: "compliance",
        description: "Missing signature on Page 2",
        severity: "high",
        regulation: "BIA Section 50.4(1)",
        impact: "Filing may be rejected",
        requiredAction: "Obtain debtor signature",
        solution: "Have debtor sign Page 2 of Form 65",
        deadline: "Before submission to OSB"
      },
      {
        type: "compliance",
        description: "Creditor list incomplete",
        severity: "high",
        regulation: "BIA Section 50.5",
        impact: "Some creditors may not be notified",
        requiredAction: "Complete creditor list with all known creditors",
        solution: "Review financial records and add missing creditors",
        deadline: "Within 10 days of filing"
      }
    ],
    regulatory_compliance: {
      status: "non_compliant",
      details: "Missing required signatures and creditor information",
      references: ["BIA Section 50.4(1)", "BIA Section 50.5"]
    }
  };
};

export const getMockForm66Data = (): AnalysisResult => {
  return {
    extracted_info: {
      formNumber: "66",
      clientName: "Alice Johnson",
      dateSigned: "2023-05-20",
      trusteeName: "James Wilson, LIT",
      type: "Certificate of Filing",
      summary: "Certificate of Filing a Proposal (Form 66)"
    },
    risks: [
      {
        type: "compliance",
        description: "Missing OSB reference number",
        severity: "medium",
        regulation: "BIA Rule 128(1)",
        impact: "May delay processing",
        requiredAction: "Add OSB reference number",
        solution: "Contact OSB to obtain reference number",
        deadline: "Within 5 days"
      }
    ],
    regulatory_compliance: {
      status: "pending",
      details: "Requires OSB reference number",
      references: ["BIA Rule 128(1)"]
    }
  };
};

export const getMockForm76Data = (): AnalysisResult => {
  return {
    extracted_info: {
      formNumber: "76",
      clientName: "Robert Taylor",
      dateSigned: "2023-06-10",
      trusteeName: "Thomas Clark, LIT",
      type: "Statement of Affairs",
      summary: "Statement of Affairs (Form 76) for Robert Taylor"
    },
    risks: [
      {
        type: "compliance",
        description: "Assets section incomplete",
        severity: "high",
        regulation: "BIA Section 158(d)",
        impact: "May constitute an offense under the BIA",
        requiredAction: "Complete the assets section in full",
        solution: "List all assets including valuations",
        deadline: "Immediately"
      },
      {
        type: "compliance",
        description: "Income details missing",
        severity: "medium",
        regulation: "BIA Directive 6R3",
        impact: "Cannot determine surplus income",
        requiredAction: "Add complete income information",
        solution: "Include all sources of income with documentation",
        deadline: "Within 7 days"
      }
    ],
    regulatory_compliance: {
      status: "non_compliant",
      details: "Missing required asset and income information",
      references: ["BIA Section 158(d)", "BIA Directive 6R3"]
    }
  };
};
