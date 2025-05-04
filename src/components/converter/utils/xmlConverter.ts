
interface ProcessedSection {
  title: string;
  content: string;
}

interface ProcessedDocument {
  confidence: number;
  sections: ProcessedSection[];
}

// Function to convert processed document to XML
export const convertToXml = (document: ProcessedDocument): string => {
  // Create XML declaration
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  
  // Add root element with namespace
  xml += '<CreditStatement xmlns="http://www.example.com/creditSchema">\n';
  
  // Add metadata
  xml += '  <Metadata>\n';
  xml += `    <ProcessingDateTime>${new Date().toISOString()}</ProcessingDateTime>\n`;
  xml += '    <ProcessorVersion>1.0.0</ProcessorVersion>\n';
  xml += `    <ConfidenceLevel>${document.confidence}</ConfidenceLevel>\n`;
  xml += '  </Metadata>\n\n';
  
  // Process each section
  document.sections.forEach(section => {
    const safeSectionName = section.title
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^\d+/, ''); // Remove leading digits
    
    const sectionName = safeSectionName || 'Section';
    
    xml += `  <${sectionName}>\n`;
    
    // Process content based on section name
    if (section.title.includes('CUSTOMER') || section.title.includes('CLIENT')) {
      // Special handling for customer information
      const lines = section.content.split('\n');
      xml += '    <CustomerInformation>\n';
      
      lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
          const key = parts[0].trim()
            .replace(/[^a-zA-Z0-9]/g, '')
            .replace(/^\d+/, '');
          const value = parts[1].trim();
          
          if (key && value) {
            xml += `      <${key}>${escapeXml(value)}</${key}>\n`;
          }
        }
      });
      
      xml += '    </CustomerInformation>\n';
    } else if (section.title.includes('TRANSACTION') || section.title.includes('ACTIVITY')) {
      // Special handling for transactions
      xml += '    <Transactions>\n';
      
      // Simple transaction parsing
      const lines = section.content.split('\n');
      let currentTransaction = '';
      
      lines.forEach(line => {
        if (line.match(/\d{2}\/\d{2}\/\d{4}/) || line.match(/\d{4}-\d{2}-\d{2}/)) {
          // This looks like the start of a transaction
          if (currentTransaction) {
            xml += '      <Transaction>\n';
            xml += `        <Details>${escapeXml(currentTransaction)}</Details>\n`;
            xml += '      </Transaction>\n';
          }
          currentTransaction = line;
        } else if (line.trim()) {
          currentTransaction += ' ' + line;
        }
      });
      
      // Add the last transaction
      if (currentTransaction) {
        xml += '      <Transaction>\n';
        xml += `        <Details>${escapeXml(currentTransaction)}</Details>\n`;
        xml += '      </Transaction>\n';
      }
      
      xml += '    </Transactions>\n';
    } else {
      // Generic content handling
      xml += `    <Content><![CDATA[${section.content}]]></Content>\n`;
    }
    
    xml += `  </${sectionName}>\n\n`;
  });
  
  // Close root element
  xml += '</CreditStatement>';
  
  return xml;
};

// Helper function to escape XML special characters
const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
