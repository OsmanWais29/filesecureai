import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { CommentItem } from "./CommentItem";
import { CommentInput } from "./CommentInput";
import { CommentsProps } from "./types";
import { useToast } from "@/hooks/use-toast";

const Comments: React.FC<CommentsProps> = ({ documentId, comments = [], onCommentAdded }) => {
  const { user } = useAuth();
  const [userComments, setUserComments] = useState(comments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    setUserComments(comments);
  }, [comments]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleComment = async (content: string) => {
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    
    try {
      const { data: commentData, error: commentError } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          content,
          user_id: user?.id as string, // Explicit cast to string
        })
        .select();
        
      if (commentError) throw commentError;

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (id: string, content: string) => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('document_comments')
        .update({ content })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully",
      });

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('document_comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      });

      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Comments</h3>
      
      <CommentInput 
        currentUser={user}
        userProfile={userProfile}
        onSubmit={handleComment}
        isSubmitting={isSubmitting}
      />
      
      <div className="space-y-4 mt-6">
        {userComments.length > 0 ? (
          userComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={user}
              userProfile={userProfile}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              isSubmitting={isSubmitting}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default Comments;
