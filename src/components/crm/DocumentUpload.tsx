
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/utils/storage";
import { useState } from "react";

export const DocumentUpload = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      // Use our enhanced upload utility
      await uploadFile(file, 'secure_documents', filePath);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: documentData, error: dbError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          file_path: filePath,
          status: 'pending',
          user_id: user?.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Create notification for document upload
      await supabase.functions.invoke('handle-notifications', {
        body: {
          action: 'create',
          userId: user?.id,
          notification: {
            title: 'Document Uploaded',
            message: `"${file.name}" has been uploaded successfully`,
            type: 'info',
            category: 'file_activity',
            priority: 'normal',
            action_url: `/documents/${documentData.id}`,
            metadata: {
              documentId: documentData.id,
              fileName: file.name,
              fileSize: file.size,
              uploadedAt: new Date().toISOString()
            }
          }
        }
      });

      toast({
        title: "Success",
        description: "Document uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload document"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <Button className="gap-2" disabled={isUploading}>
        <Upload className="h-4 w-4" />
        <label className="cursor-pointer">
          {isUploading ? "Uploading..." : "Upload Document"}
          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            disabled={isUploading}
          />
        </label>
      </Button>
    </div>
  );
};
