
export const validateFile = (file: File): string | null => {
  // Check file size (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return "File size exceeds 10MB limit";
  }
  
  // Check file type with more specific types included
  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Images
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    // Text
    'text/plain',
    'text/csv'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return "File type not supported. Please upload PDF, Word, Excel, image, or text files";
  }
  
  return null;
};
