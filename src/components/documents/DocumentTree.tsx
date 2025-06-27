
import React, { useState } from "react";
import { ChevronRight, ChevronDown, Edit, Merge, Trash2, RotateCcw, MoreHorizontal } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderIcon } from "./FolderIcon";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DocumentStatus = "needs-review" | "complete" | "needs-signature" | undefined;
type FolderType = 'client' | 'estate' | 'form' | 'financials' | 'default';

interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  folderType?: FolderType;
  status?: DocumentStatus;
  children?: TreeNode[];
  filePath?: string;
}

interface DocumentTreeProps {
  rootNodes: TreeNode[];
  onNodeSelect: (node: TreeNode) => void;
  onFileOpen: (node: TreeNode) => void;
  onEdit?: (nodeId: string, newName: string) => void;
  onMerge?: (nodeIds: string[]) => void;
  onDelete?: (nodeIds: string[]) => void;
  onRecover?: (nodeIds: string[]) => void;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  onNodeSelect: (node: TreeNode) => void;
  onFileOpen: (node: TreeNode) => void;
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
  onEdit?: (nodeId: string, newName: string) => void;
  onMerge?: (nodeIds: string[]) => void;
  onDelete?: (nodeIds: string[]) => void;
  onRecover?: (nodeIds: string[]) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  onNodeSelect,
  onFileOpen,
  expandedNodes,
  toggleNode,
  onEdit,
  onMerge,
  onDelete,
  onRecover
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [isHovered, setIsHovered] = useState(false);

  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);

  const handleClick = () => {
    if (hasChildren) {
      toggleNode(node.id);
    } else {
      onFileOpen(node);
    }
    onNodeSelect(node);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editName.trim() !== node.name) {
      onEdit(node.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(node.name);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleMerge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMerge) {
      onMerge([node.id]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete([node.id]);
    }
  };

  const handleRecover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRecover) {
      onRecover([node.id]);
    }
  };

  const handleDropdownEdit = () => {
    setIsEditing(true);
  };

  const handleDropdownMerge = () => {
    if (onMerge) {
      onMerge([node.id]);
    }
  };

  const handleDropdownDelete = () => {
    if (onDelete) {
      onDelete([node.id]);
    }
  };

  const handleDropdownRecover = () => {
    if (onRecover) {
      onRecover([node.id]);
    }
  };

  const getStatusColor = (status?: DocumentStatus) => {
    switch (status) {
      case "needs-review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "complete":
        return "bg-green-100 text-green-800 border-green-200";
      case "needs-signature":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div>
      <div 
        className={cn(
          "flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-accent rounded-md transition-colors group",
          "select-none"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {hasChildren && (
          <button className="flex items-center justify-center w-4 h-4">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
        
        <FolderIcon 
          type={node.folderType || 'default'} 
          isExpanded={isExpanded}
          fileName={node.type === 'file' ? node.name : undefined}
        />
        
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyPress}
            className="flex-1 text-sm font-medium px-2 py-1 border rounded"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate">
            {node.name}
          </span>
        )}
        
        {node.status && (
          <Badge className={cn("text-xs", getStatusColor(node.status))}>
            {node.status.replace('-', ' ')}
          </Badge>
        )}

        {/* Action buttons - visible on hover */}
        {(isHovered || isEditing) && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit();
              }}
              className="h-6 w-6 p-0"
              title="Edit name"
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            
            {onRecover && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRecover}
                className="h-6 w-6 p-0"
                title="Recover"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                  className="h-6 w-6 p-0"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDropdownEdit}>
                  <Edit className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                {onMerge && node.type === 'file' && (
                  <DropdownMenuItem onClick={handleDropdownMerge}>
                    <Merge className="h-3 w-3 mr-2" />
                    Merge
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={handleDropdownDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {onRecover && (
                  <DropdownMenuItem onClick={handleDropdownRecover}>
                    <RotateCcw className="h-3 w-3 mr-2" />
                    Recover
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onNodeSelect={onNodeSelect}
              onFileOpen={onFileOpen}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onEdit={onEdit}
              onMerge={onMerge}
              onDelete={onDelete}
              onRecover={onRecover}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentTree: React.FC<DocumentTreeProps> = ({
  rootNodes,
  onNodeSelect,
  onFileOpen,
  onEdit,
  onMerge,
  onDelete,
  onRecover
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  if (!rootNodes || rootNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No documents found</p>
          <p className="text-sm">Select a client from the left panel to view their documents</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        {rootNodes.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            level={0}
            onNodeSelect={onNodeSelect}
            onFileOpen={onFileOpen}
            expandedNodes={expandedNodes}
            toggleNode={toggleNode}
            onEdit={onEdit}
            onMerge={onMerge}
            onDelete={onDelete}
            onRecover={onRecover}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
