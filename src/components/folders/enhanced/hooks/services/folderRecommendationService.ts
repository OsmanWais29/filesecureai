
import { toast } from "sonner";
import { FolderRecommendation } from "../types/folderTypes";

import { supabase } from "@/lib/supabase";
import { sfaiFunctions } from "@/lib/sfaiFunctions";
// Create a notification for new client folder
export const suggestNewClientFolder = async (
  userId: string,
  documentId: string,
  clientName: string
) => {
  try {
    // Create notification suggesting new client folder
    await sfaiFunctions.invoke('handle-notifications', {
      body: {
        action: 'create',
        userId: userId,
        notification: {
          title: 'New Client Detected',
          message: `Consider creating a folder for client: ${clientName}`,
          type: 'suggestion',
          category: 'organization',
          priority: 'normal',
          action_url: `/documents`,
          metadata: {
            documentId: documentId,
            clientName: clientName,
            suggestedAction: 'create_client_folder'
          }
        }
      }
    });
    
    // Show toast notification
    toast.info(
      `New client detected: ${clientName}. Consider creating a folder.`,
      {
        duration: 5000,
        action: {
          label: "Create Folder",
          onClick: () => {
            toast.success(`Creating folder for ${clientName}...`);
          }
        }
      }
    );
  } catch (error) {
    console.error("Error suggesting new client folder:", error);
  }
};

// Create a notification for new subfolder
export const suggestNewSubfolder = (subfolderName: string, clientFolderName: string) => {
  toast.info(
    `Consider creating a "${subfolderName}" folder under ${clientFolderName}`,
    {
      duration: 5000,
      action: {
        label: "Create Folder",
        onClick: () => {
          toast.success(`Creating ${subfolderName} folder...`);
        }
      }
    }
  );
};

// Create a notification for folder recommendation
export const notifyFolderRecommendation = async (
  userId: string,
  documentId: string,
  documentTitle: string,
  targetFolderId: string,
  folderPath: string[]
) => {
  try {
    // Create recommendation notification
    await sfaiFunctions.invoke('handle-notifications', {
      body: {
        action: 'folderRecommendation',
        userId: userId,
        notification: {
          message: `AI suggests organizing "${documentTitle}" in folder: ${folderPath.join(' > ')}`,
          documentId: documentId,
          recommendedFolderId: targetFolderId,
          suggestedPath: folderPath
        }
      }
    });
    
    // Show toast with recommendation
    toast.info(
      `AI suggests organizing "${documentTitle}" in folder: ${folderPath.join(' > ')}`,
      {
        duration: 5000,
        action: {
          label: "Move File",
          onClick: () => {
            // This would need to be implemented separately
            console.log(`Moving file to ${folderPath.join(' > ')}`);
          }
        }
      }
    );
  } catch (error) {
    console.error("Error notifying folder recommendation:", error);
  }
};

// Notify about document type without client
export const notifyDocumentTypeNoClient = (folderType: string) => {
  toast.info(
    `Document detected as "${folderType}" but no client associated`,
    {
      duration: 5000
    }
  );
};

// Move document to a folder
export const moveDocumentToFolder = async (
  documentId: string, 
  folderId: string, 
  folderPath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('documents')
      .update({ parent_folder_id: folderId })
      .eq('id', documentId);
      
    if (error) throw error;
    
    toast.success(`Document moved to ${folderPath}`);
    return true;
  } catch (error) {
    console.error("Error moving document:", error);
    toast.error("Failed to move document");
    return false;
  }
};
