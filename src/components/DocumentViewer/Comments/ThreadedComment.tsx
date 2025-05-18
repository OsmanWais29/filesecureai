
import React, { useState } from 'react';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { ThreadedCommentProps } from './types';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export const ThreadedComment: React.FC<ThreadedCommentProps> = ({
  comment,
  allComments,
  replies,
  currentUser,
  userProfile,
  onEdit,
  onDelete,
  onReply,
  onResolve,
  isSubmitting,
  onSubmit
}) => {
  const [showReplies, setShowReplies] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  
  const handleReply = () => {
    setIsReplying(true);
    onReply && onReply(comment.id);
  };
  
  const handleCancelReply = () => {
    setIsReplying(false);
  };
  
  const handleSubmit = async (content: string, parentId?: string, mentions?: string[]) => {
    if (onSubmit) {
      await onSubmit(content, comment.id, mentions);
      setIsReplying(false);
    }
  };
  
  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };
  
  const handleResolve = async () => {
    if (onResolve) {
      await onResolve(comment.id, !comment.is_resolved);
    }
  };
  
  return (
    <div className="border-l-2 pl-3 border-border">
      <CommentItem
        comment={comment}
        currentUser={currentUser}
        userProfile={userProfile}
        onEdit={onEdit}
        onDelete={onDelete}
        isSubmitting={isSubmitting}
      />
      
      <div className="mt-1 flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs"
          onClick={handleReply}
        >
          <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
          Reply
        </Button>
        
        {comment.is_resolved !== undefined && (
          <Button 
            variant={comment.is_resolved ? "outline" : "ghost"} 
            size="sm" 
            className={`h-7 px-2 text-xs ${comment.is_resolved ? 'text-green-500' : ''}`}
            onClick={handleResolve}
          >
            {comment.is_resolved ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Resolved
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark as Resolved
              </>
            )}
          </Button>
        )}
        
        {replies && replies.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={handleToggleReplies}
          >
            {showReplies ? (
              <>
                <ChevronUp className="h-3.5 w-3.5 mr-1" />
                Hide Replies
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5 mr-1" />
                Show Replies ({replies.length})
              </>
            )}
          </Button>
        )}
      </div>
      
      {isReplying && (
        <div className="mt-2 pl-4">
          <CommentInput
            currentUser={currentUser}
            userProfile={userProfile}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            parentId={comment.id}
            onCancel={handleCancelReply}
            placeholder="Write a reply..."
          />
        </div>
      )}
      
      {showReplies && replies && replies.length > 0 && (
        <div className="ml-4 mt-2 space-y-4">
          {replies.map(reply => (
            <ThreadedComment
              key={reply.id}
              comment={reply}
              allComments={allComments}
              replies={allComments.filter(c => c.parent_id === reply.id)}
              currentUser={currentUser}
              userProfile={userProfile}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onResolve={onResolve}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
};
