
import { ProcessedDocument } from "./pdfProcessing";

export const convertToXml = (document: ProcessedDocument): string => {
  // Simple XML conversion for the document
  const xmlParts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<document>',
    `  <id>${document.id}</id>`,
    `  <title>${escapeXml(document.title)}</title>`,
    '  <metadata>',
    `    <author>${escapeXml(document.metadata.author || '')}</author>`,
    `    <createdDate>${document.metadata.createdDate || ''}</createdDate>`,
    `    <pageCount>${document.metadata.pageCount || 0}</pageCount>`,
    '    <keywords>',
    ...(document.metadata.keywords || []).map(keyword => 
      `      <keyword>${escapeXml(keyword)}</keyword>`
    ),
    '    </keywords>',
    '  </metadata>',
    '  <sections>',
  ];

  // Add sections
  document.sections.forEach(section => {
    xmlParts.push(`    <section id="${section.id}" type="${section.type}">`);
    xmlParts.push(`      <title>${escapeXml(section.title)}</title>`);
    xmlParts.push(`      <content>${escapeXml(section.content)}</content>`);
    xmlParts.push('    </section>');
  });

  xmlParts.push('  </sections>');
  
  // Add tables
  if (document.tables && document.tables.length > 0) {
    xmlParts.push('  <tables>');
    document.tables.forEach(table => {
      xmlParts.push(`    <table id="${table.id}">`);
      if (table.caption) {
        xmlParts.push(`      <caption>${escapeXml(table.caption)}</caption>`);
      }
      
      // Table headers
      xmlParts.push('      <headers>');
      table.headers.forEach(header => {
        xmlParts.push(`        <header>${escapeXml(header)}</header>`);
      });
      xmlParts.push('      </headers>');
      
      // Table rows
      xmlParts.push('      <rows>');
      table.rows.forEach(row => {
        xmlParts.push('        <row>');
        row.forEach(cell => {
          xmlParts.push(`          <cell>${escapeXml(cell)}</cell>`);
        });
        xmlParts.push('        </row>');
      });
      xmlParts.push('      </rows>');
      
      xmlParts.push('    </table>');
    });
    xmlParts.push('  </tables>');
  }

  // Add full extracted text
  xmlParts.push('  <extractedText>');
  xmlParts.push(`    <![CDATA[${document.extractedText}]]>`);
  xmlParts.push('  </extractedText>');

  // Add processing information
  xmlParts.push('  <processingInfo>');
  xmlParts.push(`    <ocr>${document.ocr}</ocr>`);
  xmlParts.push(`    <confidence>${document.confidence}</confidence>`);
  xmlParts.push('  </processingInfo>');

  xmlParts.push('</document>');

  return xmlParts.join('\n');
};

// Helper function to escape XML special characters
const escapeXml = (unsafe: string): string => {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
