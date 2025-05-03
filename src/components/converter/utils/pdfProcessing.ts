
import { ProcessingOptions, ExtractedSection } from "../types";

interface ProcessedDocument {
  sections: ExtractedSection[];
  rawText: string;
}

export const processDocument = async (
  pdfText: string,
  options: ProcessingOptions
): Promise<ProcessedDocument> => {
  console.log("Processing document with options:", options);
  console.log("Document text sample:", pdfText.substring(0, 200));
  
  // This is a simplified implementation - in a real system, this would be much more sophisticated
  // We would use NLP, pattern matching, and ML to identify sections and extract structured data
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Identify document sections (simplified version)
  const sections = identifySections(pdfText);
  
  return {
    sections,
    rawText: pdfText
  };
};

// Identify document sections (simplified implementation)
const identifySections = (pdfText: string): ExtractedSection[] => {
  const sections: ExtractedSection[] = [];
  
  // Extract creditor information
  const creditorSection = extractCreditorInfo(pdfText);
  if (creditorSection) {
    sections.push(creditorSection);
  }
  
  // Extract statement information
  const statementSection = extractStatementInfo(pdfText);
  if (statementSection) {
    sections.push(statementSection);
  }
  
  // Extract customer information
  const customerSection = extractCustomerInfo(pdfText);
  if (customerSection) {
    sections.push(customerSection);
  }
  
  // Extract account summary
  const summarySection = extractAccountSummary(pdfText);
  if (summarySection) {
    sections.push(summarySection);
  }
  
  // Extract transactions
  const transactionsSection = extractTransactions(pdfText);
  if (transactionsSection) {
    sections.push(transactionsSection);
  }
  
  return sections;
};

// Extract creditor information (simplified)
const extractCreditorInfo = (text: string): ExtractedSection | null => {
  // In a real implementation, this would use more sophisticated pattern matching
  const nameMatch = text.match(/(?:ABC|XYZ)\s+Financial\s+Services/i);
  
  if (nameMatch) {
    return {
      name: "CreditorInformation",
      fields: [
        { name: "CreditorName", value: nameMatch[0], confidence: 0.9 },
        { name: "CreditorPhone", value: extractPhone(text) || "1-800-555-1234", confidence: 0.7 },
        { name: "CreditorWebsite", value: extractWebsite(text) || "www.financialservices.example.com", confidence: 0.7 },
      ]
    };
  }
  
  // Fallback with mock data
  return {
    name: "CreditorInformation",
    fields: [
      { name: "CreditorName", value: "ABC Financial Services", confidence: 0.6 },
      { name: "CreditorPhone", value: "1-800-555-1234", confidence: 0.6 },
      { name: "CreditorWebsite", value: "www.abcfinancial.example.com", confidence: 0.6 },
    ]
  };
};

// Extract statement information (simplified)
const extractStatementInfo = (text: string): ExtractedSection | null => {
  // Match statement number and date
  const statementNumberMatch = text.match(/Statement\s+(?:Number|#):\s*([A-Z0-9]+)/i) ||
                              text.match(/Stmt\s+#\s*([A-Z0-9]+)/i);
  
  const dateMatch = text.match(/Statement\s+Date:?\s*(\w+\s+\d{1,2},?\s*\d{4})/i) ||
                   text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  
  return {
    name: "StatementInformation",
    fields: [
      { 
        name: "StatementNumber", 
        value: statementNumberMatch ? statementNumberMatch[1] : "S" + Math.floor(Math.random() * 10000000), 
        confidence: statementNumberMatch ? 0.9 : 0.5 
      },
      { 
        name: "StatementDate", 
        value: dateMatch ? dateMatch[1] : "2025-04-15", 
        confidence: dateMatch ? 0.9 : 0.5 
      },
    ]
  };
};

// Extract customer information (simplified)
const extractCustomerInfo = (text: string): ExtractedSection | null => {
  // Match customer name
  const nameMatch = text.match(/(?:Customer|Client|Account\s+Holder):\s*([A-Za-z\s\.]+)/i) ||
                   text.match(/([A-Za-z]+\s+[A-Za-z]\.\s+[A-Za-z]+)/);
                   
  // Match account number
  const accountMatch = text.match(/Account\s+(?:Number|#):\s*([A-Za-z0-9\-]+)/i) ||
                      text.match(/(?:Acct|Account):\s*([A-Za-z0-9\-]+)/i);
  
  return {
    name: "CustomerInformation",
    fields: [
      { 
        name: "CustomerName", 
        value: nameMatch ? nameMatch[1].trim() : "John Q. Public", 
        confidence: nameMatch ? 0.9 : 0.5 
      },
      { 
        name: "AccountNumber", 
        value: accountMatch ? accountMatch[1] : "9217-8452-7391-0142", 
        confidence: accountMatch ? 0.9 : 0.5 
      },
    ]
  };
};

// Extract account summary (simplified)
const extractAccountSummary = (text: string): ExtractedSection | null => {
  // Match balance information
  const previousBalanceMatch = text.match(/Previous\s+Balance:?\s*\$?(\d+,?\d*\.\d{2})/i);
  const newBalanceMatch = text.match(/(?:New|Current)\s+Balance:?\s*\$?(\d+,?\d*\.\d{2})/i);
  const paymentMatch = text.match(/(?:Payment|Payments)(?:\s+received)?:?\s*\$?(\-?\d+,?\d*\.\d{2})/i);
  
  return {
    name: "AccountSummary",
    fields: [
      { 
        name: "PreviousBalance", 
        value: previousBalanceMatch ? previousBalanceMatch[1] : "2345.67", 
        confidence: previousBalanceMatch ? 0.9 : 0.5 
      },
      { 
        name: "Payments", 
        value: paymentMatch ? paymentMatch[1] : "-750.00", 
        confidence: paymentMatch ? 0.9 : 0.5 
      },
      { 
        name: "NewBalance", 
        value: newBalanceMatch ? newBalanceMatch[1] : "2455.24", 
        confidence: newBalanceMatch ? 0.9 : 0.5 
      },
    ]
  };
};

// Extract transactions (simplified)
const extractTransactions = (text: string): ExtractedSection | null => {
  // This is a very simplified transaction extraction
  // In a real implementation, we'd use more sophisticated table detection and parsing

  // Look for transaction table markers
  const hasTransactionList = /transactions|activity|purchases|charges|payments/i.test(text);
  
  if (!hasTransactionList) {
    return null;
  }
  
  // Mock transactions based on text content
  const mockTransactions = [];
  
  // Check for common transaction patterns
  const paymentPattern = /payment|thank\s+you/i;
  if (paymentPattern.test(text)) {
    mockTransactions.push({
      name: "Transaction",
      fields: [
        { name: "TransactionDate", value: "2025-03-17", confidence: 0.7 },
        { name: "Description", value: "ONLINE PAYMENT THANK YOU", confidence: 0.8 },
        { name: "Amount", value: "-750.00", confidence: 0.7 },
        { name: "Category", value: "PAYMENT", confidence: 0.9 }
      ]
    });
  }
  
  const groceryPattern = /(?:grocery|food|market|whole\s+foods)/i;
  if (groceryPattern.test(text)) {
    mockTransactions.push({
      name: "Transaction",
      fields: [
        { name: "TransactionDate", value: "2025-03-19", confidence: 0.7 },
        { name: "Description", value: "WHOLE FOODS MARKET #117", confidence: 0.8 },
        { name: "Amount", value: "78.45", confidence: 0.7 },
        { name: "Category", value: "GROCERY", confidence: 0.9 }
      ]
    });
  }
  
  const returnPattern = /(?:return|refund|credit)/i;
  if (returnPattern.test(text)) {
    mockTransactions.push({
      name: "Transaction",
      fields: [
        { name: "TransactionDate", value: "2025-04-14", confidence: 0.7 },
        { name: "Description", value: "RETURN: ONLINE RETAILER INC", confidence: 0.8 },
        { name: "Amount", value: "-25.99", confidence: 0.7 },
        { name: "Category", value: "MERCHANDISE", confidence: 0.9 }
      ]
    });
  }
  
  // If we didn't find any specific transactions, add some generic ones
  if (mockTransactions.length === 0) {
    mockTransactions.push(
      {
        name: "Transaction",
        fields: [
          { name: "TransactionDate", value: "2025-03-20", confidence: 0.6 },
          { name: "Description", value: "AMAZON MARKETPLACE", confidence: 0.6 },
          { name: "Amount", value: "145.32", confidence: 0.6 },
          { name: "Category", value: "SHOPPING", confidence: 0.6 }
        ]
      },
      {
        name: "Transaction",
        fields: [
          { name: "TransactionDate", value: "2025-03-22", confidence: 0.6 },
          { name: "Description", value: "NETFLIX SUBSCRIPTION", confidence: 0.6 },
          { name: "Amount", value: "14.99", confidence: 0.6 },
          { name: "Category", value: "ENTERTAINMENT", confidence: 0.6 }
        ]
      }
    );
  }
  
  // Return composite transactions section
  return {
    name: "Transactions",
    fields: [],
    tables: [
      {
        name: "TransactionsTable",
        columns: ["TransactionDate", "Description", "Amount", "Category"],
        rows: mockTransactions.map(t => [
          t.fields.find(f => f.name === "TransactionDate")?.value, 
          t.fields.find(f => f.name === "Description")?.value,
          t.fields.find(f => f.name === "Amount")?.value,
          t.fields.find(f => f.name === "Category")?.value
        ]),
        pageNumbers: [1]
      }
    ]
  };
};

// Helper function to extract phone number
const extractPhone = (text: string): string | null => {
  const phoneMatch = text.match(/(\(?[0-9]{3}\)?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4})/);
  return phoneMatch ? phoneMatch[1] : null;
};

// Helper function to extract website
const extractWebsite = (text: string): string | null => {
  const websiteMatch = text.match(/(?:www\.[\w-]+\.[\w.-]+)|(?:https?:\/\/[\w-]+\.[\w.-]+)/i);
  return websiteMatch ? websiteMatch[0] : null;
};
