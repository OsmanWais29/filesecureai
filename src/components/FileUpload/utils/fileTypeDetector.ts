
export const detectDocumentType = (file: File) => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  
  return {
    isForm76: fileName.includes('form 76') || fileName.includes('form76'),
    isForm47: fileName.includes('form 47') || fileName.includes('form47') || fileName.includes('consumer proposal'),
    isForm31: fileName.includes('form 31') || fileName.includes('form31'),
    isExcel: fileType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls'),
    isPDF: fileType.includes('pdf') || fileName.endsWith('.pdf')
  };
};

export const getDocumentFormType = (fileName: string): string | null => {
  const lowerName = fileName.toLowerCase();
  
  // Form number patterns
  const formPatterns = [
    { pattern: /form\s*(\d+)/i, prefix: 'form-' },
    { pattern: /(\d+)\s*form/i, prefix: 'form-' }
  ];
  
  for (const { pattern, prefix } of formPatterns) {
    const match = lowerName.match(pattern);
    if (match) {
      return `${prefix}${match[1]}`;
    }
  }
  
  // Special case patterns
  if (lowerName.includes('consumer proposal')) return 'form-47';
  if (lowerName.includes('assignment') && lowerName.includes('bankruptcy')) return 'form-76';
  if (lowerName.includes('proof') && lowerName.includes('income')) return 'form-31';
  
  return null;
};
