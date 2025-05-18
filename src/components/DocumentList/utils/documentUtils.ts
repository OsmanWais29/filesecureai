
import { Document } from "../types";

export const determineFileType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'PDF Document';
    case 'doc':
    case 'docx':
      return 'Word Document';
    case 'xls':
    case 'xlsx':
      return 'Excel Spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'PowerPoint Presentation';
    case 'txt':
      return 'Text Document';
    default:
      return 'Other';
  }
};

export interface DocumentTree {
  [key: string]: {
    folder: Document;
    documents: Document[];
  }
}

export const organizeDocumentsIntoTree = (docs: Document[]): Document[] => {
  // First, group by client (from metadata or folder structure)
  const clientGroups: DocumentTree = docs.reduce((acc, doc) => {
    if (doc.is_folder && doc.folder_type === 'client') {
      // This is a client folder
      if (!acc[doc.title || '']) {
        acc[doc.title || ''] = {
          folder: doc,
          documents: []
        };
      }
    } else if (doc.parent_folder_id) {
      // This is a document with a parent folder
      const parentDoc = docs.find(d => d.id === doc.parent_folder_id);
      if (parentDoc && parentDoc.title) {
        if (!acc[parentDoc.title]) {
          acc[parentDoc.title] = {
            folder: parentDoc,
            documents: []
          };
        }
        acc[parentDoc.title].documents.push(doc);
      }
    } else {
      // Uncategorized documents
      if (!acc['Uncategorized']) {
        acc['Uncategorized'] = {
          folder: {
            id: 'uncategorized',
            title: 'Uncategorized',
            type: 'folder',
            is_folder: true,
            folder_type: 'uncategorized',
            storage_path: '',
            created_at: new Date().toISOString(),
            size: 0
          },
          documents: []
        };
      }
      acc['Uncategorized'].documents.push(doc);
    }
    return acc;
  }, {} as DocumentTree);

  // Now convert to a tree structure
  const result: Document[] = [];

  // Add client folders first
  Object.values(clientGroups).forEach(({ folder, documents }) => {
    result.push(folder);
    
    // Add documents under each client
    documents.forEach(doc => {
      result.push(doc);
    });
  });

  return result;
};
