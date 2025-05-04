
import { processDocument } from "./pdfProcessing";

export const convertToXml = (document: any): string => {
  // Simple XML generation function
  // In a production system, this would use a proper XML library
  
  // XML Declaration
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  
  // Root element with namespace
  xml += '<CreditStatement xmlns="http://www.example.com/creditSchema">\n';
  
  // Add metadata
  xml += '  <Metadata>\n';
  xml += `    <ProcessingDateTime>${new Date().toISOString()}</ProcessingDateTime>\n`;
  xml += '    <SourceFilename>statement_example.pdf</SourceFilename>\n';
  xml += '    <ProcessorVersion>1.0.0</ProcessorVersion>\n';
  xml += '  </Metadata>\n';
  
  // Process each section
  if (document.sections) {
    document.sections.forEach((section: any) => {
      if (section.name === "CreditorInformation") {
        xml = addCreditorSection(xml, section);
      } else if (section.name === "StatementInformation") {
        xml = addStatementSection(xml, section);
      } else if (section.name === "CustomerInformation") {
        xml = addCustomerSection(xml, section);
      } else if (section.name === "AccountSummary") {
        xml = addAccountSummarySection(xml, section);
      } else if (section.name === "Transactions") {
        xml = addTransactionsSection(xml, section);
      }
    });
  }
  
  // Add payment information (mocked)
  xml += '  <PaymentInformation>\n';
  xml += '    <NewBalance>2455.24</NewBalance>\n';
  xml += '    <MinimumPaymentDue>98.21</MinimumPaymentDue>\n';
  xml += '    <PaymentDueDate>2025-05-12</PaymentDueDate>\n';
  xml += '    <CreditLimit>5000.00</CreditLimit>\n';
  xml += '    <AvailableCredit>2544.76</AvailableCredit>\n';
  xml += '    <PaymentMethods>\n';
  xml += '      <OnlinePayment>www.abcfinancial.example.com/payments</OnlinePayment>\n';
  xml += '      <PhonePayment>1-800-PAY-BILL</PhonePayment>\n';
  xml += '      <MailPayment>\n';
  xml += '        <Address>ABC Financial, PO Box 12345, Metropolis, NY 10001</Address>\n';
  xml += '      </MailPayment>\n';
  xml += '    </PaymentMethods>\n';
  xml += '  </PaymentInformation>\n';
  
  // Close root element
  xml += '</CreditStatement>';
  
  return xml;
};

// Helper functions for XML sections

// Helper function to escape XML special characters
const escapeXml = (unsafe: string | undefined): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// Helper function to add creditor information section
const addCreditorSection = (xml: string, section: any): string => {
  let result = xml;
  result += '  <CreditorInformation>\n';
  
  // Find fields by name
  const nameField = section.fields.find((f: any) => f.name === "CreditorName");
  const phoneField = section.fields.find((f: any) => f.name === "CreditorPhone");
  const websiteField = section.fields.find((f: any) => f.name === "CreditorWebsite");
  
  result += `    <CreditorName>${escapeXml(nameField?.value || "ABC Financial Services")}</CreditorName>\n`;
  result += '    <CreditorAddress>\n';
  result += '      <StreetAddress>123 Finance Avenue</StreetAddress>\n';
  result += '      <City>Metropolis</City>\n';
  result += '      <State>NY</State>\n';
  result += '      <ZipCode>10001</ZipCode>\n';
  result += '    </CreditorAddress>\n';
  result += `    <CreditorPhone>${escapeXml(phoneField?.value || "1-800-555-1234")}</CreditorPhone>\n`;
  result += `    <CreditorWebsite>${escapeXml(websiteField?.value || "www.abcfinancial.example.com")}</CreditorWebsite>\n`;
  result += '  </CreditorInformation>\n';
  
  return result;
};

// Helper function to add statement information section
const addStatementSection = (xml: string, section: any): string => {
  let result = xml;
  result += '  <StatementInformation>\n';
  
  const statementNumberField = section.fields.find((f: any) => f.name === "StatementNumber");
  const statementDateField = section.fields.find((f: any) => f.name === "StatementDate");
  
  result += `    <StatementNumber>${escapeXml(statementNumberField?.value || "S28465971")}</StatementNumber>\n`;
  result += `    <StatementDate>${escapeXml(statementDateField?.value || "2025-04-15")}</StatementDate>\n`;
  result += '    <BillingPeriod>\n';
  result += '      <StartDate>2025-03-16</StartDate>\n';
  result += '      <EndDate>2025-04-15</EndDate>\n';
  result += '    </BillingPeriod>\n';
  result += '  </StatementInformation>\n';
  
  return result;
};

// Helper function to add customer information section
const addCustomerSection = (xml: string, section: any): string => {
  let result = xml;
  result += '  <CustomerInformation>\n';
  
  const customerNameField = section.fields.find((f: any) => f.name === "CustomerName");
  const accountNumberField = section.fields.find((f: any) => f.name === "AccountNumber");
  
  result += '    <CustomerID>CUST78294</CustomerID>\n';
  result += '    <CustomerSince>2018-05-22</CustomerSince>\n';
  
  // Parse and format the name if available
  let formattedName = '';
  if (customerNameField?.value) {
    const name = customerNameField.value.trim();
    const nameParts = name.split(' ');
    
    result += '    <Name>\n';
    result += `      <FirstName>${nameParts[0] || "John"}</FirstName>\n`;
    
    if (nameParts.length > 2) {
      result += `      <MiddleInitial>${nameParts[1][0] || "Q"}</MiddleInitial>\n`;
      result += `      <LastName>${nameParts[2] || "Public"}</LastName>\n`;
    } else if (nameParts.length > 1) {
      result += '      <MiddleInitial>Q</MiddleInitial>\n';
      result += `      <LastName>${nameParts[1] || "Public"}</LastName>\n`;
    } else {
      result += '      <MiddleInitial>Q</MiddleInitial>\n';
      result += '      <LastName>Public</LastName>\n';
    }
    
    result += '    </Name>\n';
  } else {
    result += '    <Name>\n';
    result += '      <FirstName>John</FirstName>\n';
    result += '      <MiddleInitial>Q</MiddleInitial>\n';
    result += '      <LastName>Public</LastName>\n';
    result += '    </Name>\n';
  }
  
  result += '    <Address>\n';
  result += '      <StreetAddress>456 Main Street, Apt 303</StreetAddress>\n';
  result += '      <City>Anytown</City>\n';
  result += '      <State>CA</State>\n';
  result += '      <ZipCode>90210</ZipCode>\n';
  result += '    </Address>\n';
  result += '    <ContactInformation>\n';
  result += '      <Email>jqpublic@email.example</Email>\n';
  result += '      <Phone>555-123-4567</Phone>\n';
  result += '    </ContactInformation>\n';
  
  result += `    <AccountNumber>${escapeXml(accountNumberField?.value || "9217-8452-7391-0142")}</AccountNumber>\n`;
  result += '  </CustomerInformation>\n';
  
  return result;
};

// Helper function to add account summary section
const addAccountSummarySection = (xml: string, section: any): string => {
  let result = xml;
  result += '  <AccountSummary>\n';
  
  const previousBalanceField = section.fields.find((f: any) => f.name === "PreviousBalance");
  const paymentsField = section.fields.find((f: any) => f.name === "Payments");
  const newBalanceField = section.fields.find((f: any) => f.name === "NewBalance");
  
  result += `    <PreviousBalance>${escapeXml(previousBalanceField?.value || "2345.67")}</PreviousBalance>\n`;
  result += `    <Payments>${escapeXml(paymentsField?.value || "-750.00")}</Payments>\n`;
  result += '    <Credits>-25.99</Credits>\n';
  result += '    <Purchases>843.21</Purchases>\n';
  result += '    <CashAdvances>0.00</CashAdvances>\n';
  result += '    <BalanceTransfers>0.00</BalanceTransfers>\n';
  result += '    <FeesCharged>\n';
  result += '      <LateFee>0.00</LateFee>\n';
  result += '      <OverLimitFee>0.00</OverLimitFee>\n';
  result += '      <OtherFees>0.00</OtherFees>\n';
  result += '    </FeesCharged>\n';
  result += '    <InterestCharged>\n';
  result += '      <PurchasesInterest>42.35</PurchasesInterest>\n';
  result += '      <CashAdvanceInterest>0.00</CashAdvanceInterest>\n';
  result += '      <BalanceTransferInterest>0.00</BalanceTransferInterest>\n';
  result += '    </InterestCharged>\n';
  result += `    <NewBalance>${escapeXml(newBalanceField?.value || "2455.24")}</NewBalance>\n`;
  result += '  </AccountSummary>\n';
  
  return result;
};

// Helper function to add transactions section
const addTransactionsSection = (xml: string, section: any): string => {
  let result = xml;
  result += '  <Transactions>\n';
  
  // Check if we have transactions data
  if (section.tables && section.tables.length > 0) {
    const transactionsTable = section.tables[0];
    
    // Process each transaction row
    transactionsTable.rows.forEach((row: any) => {
      result += '    <Transaction>\n';
      result += `      <TransactionDate>${escapeXml(row.transactionDate)}</TransactionDate>\n`;
      result += `      <PostingDate>${escapeXml(row.postingDate || row.transactionDate)}</PostingDate>\n`;
      result += `      <TransactionType>${escapeXml(row.type || "PURCHASE")}</TransactionType>\n`;
      result += `      <Description>${escapeXml(row.description || "")}</Description>\n`;
      
      if (row.merchantLocation) {
        result += `      <MerchantLocation>${escapeXml(row.merchantLocation)}</MerchantLocation>\n`;
      }
      
      result += `      <ReferenceNumber>${escapeXml(row.reference || "")}</ReferenceNumber>\n`;
      result += `      <Amount>${escapeXml(row.amount || "0.00")}</Amount>\n`;
      result += `      <Category>${escapeXml(row.category || "UNKNOWN")}</Category>\n`;
      result += '    </Transaction>\n';
    });
  } else {
    // Add sample transaction data if no data is available
    result += '    <Transaction>\n';
    result += '      <TransactionDate>2025-03-17</TransactionDate>\n';
    result += '      <PostingDate>2025-03-18</PostingDate>\n';
    result += '      <TransactionType>PAYMENT</TransactionType>\n';
    result += '      <Description>ONLINE PAYMENT THANK YOU</Description>\n';
    result += '      <ReferenceNumber>REF928374651</ReferenceNumber>\n';
    result += '      <Amount>-750.00</Amount>\n';
    result += '      <Category>PAYMENT</Category>\n';
    result += '    </Transaction>\n';
    result += '    <Transaction>\n';
    result += '      <TransactionDate>2025-03-19</TransactionDate>\n';
    result += '      <PostingDate>2025-03-20</PostingDate>\n';
    result += '      <TransactionType>PURCHASE</TransactionType>\n';
    result += '      <Description>WHOLE FOODS MARKET #117</Description>\n';
    result += '      <MerchantLocation>CHICAGO IL</MerchantLocation>\n';
    result += '      <ReferenceNumber>REF736418290</ReferenceNumber>\n';
    result += '      <Amount>78.45</Amount>\n';
    result += '      <Category>GROCERY</Category>\n';
    result += '    </Transaction>\n';
    result += '    <Transaction>\n';
    result += '      <TransactionDate>2025-04-14</TransactionDate>\n';
    result += '      <PostingDate>2025-04-15</PostingDate>\n';
    result += '      <TransactionType>CREDIT</TransactionType>\n';
    result += '      <Description>RETURN: ONLINE RETAILER INC</Description>\n';
    result += '      <ReferenceNumber>REF123987456</ReferenceNumber>\n';
    result += '      <Amount>-25.99</Amount>\n';
    result += '      <Category>MERCHANDISE</Category>\n';
    result += '    </Transaction>\n';
  }
  
  result += '  </Transactions>\n';
  
  return result;
};
