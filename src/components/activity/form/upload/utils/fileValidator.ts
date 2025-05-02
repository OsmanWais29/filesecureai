
export const validateFile = (file: File): string | null => {
  // Check file size (10MB max)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    return "File size exceeds 10MB limit";
  }
  
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return "File type not supported. Please upload PDF, Word, Excel, or image files";
  }
  
  return null;
};
