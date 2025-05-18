
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
