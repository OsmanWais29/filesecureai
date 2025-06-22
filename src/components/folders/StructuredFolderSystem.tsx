
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus,
  Search,
  MoreHorizontal,
  Users,
  FileX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderNode {
  id: string;
  title: string;
  type: 'folder' | 'document';
  children?: FolderNode[];
  metadata?: any;
  parent_folder_id?: string | null;
  document_count?: number;
}

interface StructuredFolderSystemProps {
  onDocumentSelect?: (documentId: string) => void;
  onFolderSelect?: (folderId: string) => void;
}

export const StructuredFolderSystem = ({
  onDocumentSelect,
  onFolderSelect
}: StructuredFolderSystemProps) => {
  const [folderTree, setFolderTree] = useState<FolderNode[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadFolderStructure();
  }, []);

  const loadFolderStructure = async () => {
    try {
      setLoading(true);
      
      // Get all documents and folders
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('title');

      if (error) throw error;

      // Build folder tree structure
      const tree = buildFolderTree(documents || []);
      setFolderTree(tree);

      // Auto-expand root folders
      const rootFolderIds = tree
        .filter(node => node.type === 'folder')
        .map(node => node.id);
      setExpandedFolders(new Set(rootFolderIds));

    } catch (error) {
      console.error('Error loading folder structure:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildFolderTree = (documents: any[]): FolderNode[] => {
    const nodes: FolderNode[] = [];
    const folderMap = new Map<string, FolderNode>();

    // Separate folders and documents
    const folders = documents.filter(doc => doc.is_folder);
    const files = documents.filter(doc => !doc.is_folder);

    // Create folder nodes
    folders.forEach(folder => {
      const node: FolderNode = {
        id: folder.id,
        title: folder.title,
        type: 'folder',
        children: [],
        parent_folder_id: folder.parent_folder_id,
        metadata: folder.metadata,
        document_count: 0
      };
      folderMap.set(folder.id, node);
    });

    // Create document nodes
    files.forEach(file => {
      const node: FolderNode = {
        id: file.id,
        title: file.title,
        type: 'document',
        metadata: file.metadata,
        parent_folder_id: file.parent_folder_id
      };

      // Add to appropriate folder or root
      if (file.parent_folder_id && folderMap.has(file.parent_folder_id)) {
        const parentFolder = folderMap.get(file.parent_folder_id)!;
        parentFolder.children = parentFolder.children || [];
        parentFolder.children.push(node);
        parentFolder.document_count = (parentFolder.document_count || 0) + 1;
      } else {
        // Add to "Uncategorized" folder or root
        let uncategorizedFolder = Array.from(folderMap.values())
          .find(f => f.title === 'Uncategorized');
        
        if (!uncategorizedFolder) {
          uncategorizedFolder = {
            id: 'uncategorized',
            title: 'Uncategorized',
            type: 'folder',
            children: [],
            document_count: 0
          };
          folderMap.set('uncategorized', uncategorizedFolder);
        }
        
        uncategorizedFolder.children = uncategorizedFolder.children || [];
        uncategorizedFolder.children.push(node);
        uncategorizedFolder.document_count = (uncategorizedFolder.document_count || 0) + 1;
      }
    });

    // Build hierarchy
    folderMap.forEach(folder => {
      if (!folder.parent_folder_id) {
        nodes.push(folder);
      } else if (folderMap.has(folder.parent_folder_id)) {
        const parent = folderMap.get(folder.parent_folder_id)!;
        parent.children = parent.children || [];
        parent.children.push(folder);
      }
    });

    // Ensure Uncategorized folder exists at root level
    if (!nodes.find(n => n.title === 'Uncategorized')) {
      const uncategorized = folderMap.get('uncategorized');
      if (uncategorized) {
        nodes.push(uncategorized);
      }
    }

    return nodes;
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (expandedFolders.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleNodeClick = (node: FolderNode) => {
    setSelectedId(node.id);
    
    if (node.type === 'folder') {
      toggleFolder(node.id);
      onFolderSelect?.(node.id);
    } else {
      onDocumentSelect?.(node.id);
    }
  };

  const createNewFolder = async (parentId?: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: 'New Folder',
          is_folder: true,
          parent_folder_id: parentId || null,
          folder_type: 'custom'
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadFolderStructure();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const filterNodes = (nodes: FolderNode[], term: string): FolderNode[] => {
    if (!term) return nodes;

    return nodes.reduce((filtered: FolderNode[], node) => {
      const matchesSearch = node.title.toLowerCase().includes(term.toLowerCase());
      const filteredChildren = node.children ? filterNodes(node.children, term) : [];

      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...node,
          children: filteredChildren
        });
      }

      return filtered;
    }, []);
  };

  const renderNode = (node: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isSelected = selectedId === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const indent = level * 20;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
            isSelected ? 'bg-primary/10 border-l-2 border-primary' : ''
          }`}
          style={{ paddingLeft: `${8 + indent}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )}
              <span className="flex-1 text-sm font-medium">{node.title}</span>
              {node.document_count !== undefined && node.document_count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {node.document_count}
                </Badge>
              )}
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="flex-1 text-sm">{node.title}</span>
              {node.metadata?.formType && (
                <Badge variant="outline" className="text-xs">
                  {node.metadata.formType}
                </Badge>
              )}
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {node.type === 'folder' && (
                <DropdownMenuItem onClick={() => createNewFolder(node.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Subfolder
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <FileX className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {node.type === 'folder' && isExpanded && hasChildren && (
          <div className="ml-2">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = filterNodes(folderTree, searchTerm);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">Loading folder structure...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Document Structure
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => createNewFolder()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-8"
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {filteredTree.length > 0 ? (
            filteredTree.map(node => renderNode(node))
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm ? 'No matching documents found' : 'No documents uploaded yet'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
