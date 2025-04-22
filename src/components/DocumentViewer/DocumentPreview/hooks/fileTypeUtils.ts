
export function detectFileType(fileName: string): string {
  if (fileName.toLowerCase().endsWith('.pdf')) return "pdf";
  if (/\.(jpe?g|png|gif|bmp|webp|svg)$/i.test(fileName)) return "image";
  if (/\.(xlsx?|csv)$/i.test(fileName)) return "excel";
  if (/\.(docx?|txt|rtf)$/i.test(fileName)) return "document";
  return "other";
}

export function isExcelFile(fileName: string): boolean {
  return /\.(xlsx|xls|csv)$/i.test(fileName);
}
