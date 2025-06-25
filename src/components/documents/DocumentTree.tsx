
import React, { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderIcon } from "./FolderIcon";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  onNodeSelect: (node: TreeNode) => void;
  onFileOpen: (node: TreeNode) => void;
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
}

const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  level,
  onNodeSelect,
  onFileOpen,
  expandedNodes,
  toggleNode
}) => {
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
          "flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-accent rounded-md transition-colors",
          "select-none"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={handleClick}
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
        
        <span className="flex-1 text-sm font-medium truncate">
          {node.name}
        </span>
        
        {node.status && (
          <Badge className={cn("text-xs", getStatusColor(node.status))}>
            {node.status.replace('-', ' ')}
          </Badge>
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
  onFileOpen
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
          />
        ))}
      </div>
    </ScrollArea>
  );
};
