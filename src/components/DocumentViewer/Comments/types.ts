
// Import from DocumentViewer types
import { DocumentDetails } from '../types';

// User Profile type
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

// Comment type
export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  document_id: string;
  is_resolved?: boolean;
  parent_id?: string;
  mentions?: string[];
  updated_at?: string;
}

// CommentInputProps type
export interface CommentInputProps {
  currentUser: any;
  userProfile: Profile;
  onSubmit: (content: string, parentId?: string, mentions?: string[]) => Promise<void>;
  isSubmitting: boolean;
  parentId?: string;
  onCancel?: () => void;
  placeholder?: string;
}

// CommentItemProps type
export interface CommentItemProps {
  comment: Comment;
  currentUser: any;
  userProfile: Profile;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

// ThreadedCommentProps type (already defined in another file)
export interface ThreadedCommentProps {
  comment: Comment;
  allComments: Comment[];
  replies: Comment[];
  currentUser: any;
  userProfile: Profile;
  onReply?: (parentId: string) => void;
  onEdit?: (id: string, content: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onResolve?: (id: string, resolved: boolean) => Promise<void>;
  isSubmitting: boolean;
  onSubmit?: (content: string, parentId?: string, mentions?: string[]) => Promise<void>;
}

// CommentsProps type
export interface CommentsProps {
  documentId: string;
  comments?: Comment[];
  onCommentAdded: () => void;
}

// MentionData type
export interface MentionData {
  id: string;
  display: string;
  avatar?: string;
}
