
export interface Document {
  id: string;
  title: string;
  created_at: string;
  size?: number;
  type?: string;
  storage_path?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  type: string;
}
