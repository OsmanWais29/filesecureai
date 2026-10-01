
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Comment, Profile } from '../types';

import { supabase } from "@/lib/supabase";
import { sfaiFunctions } from "@/lib/sfaiFunctions";
export interface UseCommentActionsProps {
  documentId: string;
  onCommentAdded: () => void;
}

export const useCommentActions = ({ documentId, onCommentAdded }: UseCommentActionsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  const handleAddComment = async (
    content: string, 
    parentId?: string, 
    mentions?: string[],
    currentUser?: any,
    userProfile?: Profile
  ) => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in to add comments",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newComment = {
        document_id: documentId,
        user_id: currentUser.id,
        content,
        parent_id: parentId || null,
        mentions: mentions || []
      };
      
      const { error } = await supabase
        .from('document_comments')
        .insert([newComment]);
        
      if (error) throw error;
      
      // If there are mentions, send notifications
      if (mentions && mentions.length > 0) {
        for (const userId of mentions) {
          // Call the handle-notifications function with correct structure
          await sfaiFunctions.invoke('handle-notifications', {
            body: {
              action: 'create',
              userId: userId,
              notification: {
                title: 'You were mentioned in a comment',
                message: `${userProfile?.full_name || 'Someone'} mentioned you in a comment`,
                type: 'info', // Required field for database
                priority: 'normal',
                action_url: `/documents/${documentId}`,
                category: 'task', // Will be stored in metadata
                metadata: {
                  type: 'mention',
                  document_id: documentId
                }
              }
            }
          });
        }
      }
      
      toast({
        title: "Success",
        description: "Comment added successfully"
      });
      
      onCommentAdded();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setReplyToId(undefined);
    }
  };

  const handleEditComment = async (id: string, content: string, currentUser?: any) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Comment updated successfully"
      });
      
      onCommentAdded();
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: `Failed to update comment: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string, currentUser?: any) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      // First, delete all child comments
      const { data: childComments } = await supabase
        .from('document_comments')
        .select('id')
        .eq('parent_id', id);
        
      if (childComments && childComments.length > 0) {
        const childIds = childComments.map(c => c.id);
        const { error: childDeleteError } = await supabase
          .from('document_comments')
          .delete()
          .in('id', childIds);
          
        if (childDeleteError) throw childDeleteError;
      }
      
      // Then delete the comment itself
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });
      
      onCommentAdded();
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: `Failed to delete comment: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveComment = async (id: string, resolved: boolean, currentUser?: any) => {
    if (!currentUser) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ is_resolved: resolved })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Comment ${resolved ? 'resolved' : 'reopened'} successfully`
      });
      
      onCommentAdded();
    } catch (error: any) {
      console.error('Error resolving comment:', error);
      toast({
        title: "Error",
        description: `Failed to ${resolved ? 'resolve' : 'reopen'} comment: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    replyToId,
    setReplyToId,
    handleAddComment,
    handleEditComment,
    handleDeleteComment,
    handleResolveComment
  };
};
