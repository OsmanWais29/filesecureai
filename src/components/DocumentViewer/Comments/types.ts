
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  document_id: string;
  parent_id?: string;
  mentions?: string[];
  is_resolved?: boolean;
}

export interface Profile {
  id: string;
  email: string;
  avatar_url: string | null;
  full_name: string;
}

export interface CommentsProps {
  documentId: string;
  comments?: Comment[];
  onCommentAdded?: () => void;
}

export interface CommentItemProps {
  comment: Comment;
  currentUser: any;
  userProfile: Profile | null;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSubmitting: boolean;
}

export interface CommentInputProps {
  currentUser: any;
  userProfile: Profile | null;
  onSubmit: (content: string, parentId?: string, mentions?: string[]) => Promise<void>;
  isSubmitting: boolean;
  parentId?: string;
  onCancel?: () => void;
  initialValue?: string;
  placeholder?: string;
}

export interface ThreadedCommentProps {
  comment: Comment;
  allComments: Comment[];
  currentUser: any;
  userProfile: Profile | null;
  onEdit: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReply: (commentId: string) => void;
  onResolve: (id: string, resolved: boolean) => Promise<void>;
  onSubmit?: (content: string, parentId?: string, mentions?: string[]) => Promise<void>;
  isSubmitting: boolean;
}

export interface MentionData {
  id: string;
  display: string;
  avatar?: string;
}
