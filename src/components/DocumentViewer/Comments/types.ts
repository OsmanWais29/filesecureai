
import { Comment, Profile } from './types';

export interface ThreadedCommentProps {
  comment: Comment;
  allComments: Comment[];
  replies: Comment[];  // Add replies property to fix TypeScript errors
  currentUser: any;
  userProfile: Profile;
  onReply?: (parentId: string) => void;
  onEdit?: (id: string, content: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onResolve?: (id: string, resolved: boolean) => Promise<void>;
  isSubmitting: boolean;
  onSubmit?: (content: string, parentId?: string, mentions?: string[]) => Promise<void>;
}
