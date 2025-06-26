
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, FileText, Folder, Eye, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface DocumentNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: DocumentNode[];
  status?: 'complete' | 'pending' | 'needs-review';
  lastModified?: string;
  size?: string;
}

interface ClientDocumentTreeProps {
  clientId: string;
  clientName: string;
}

export const ClientDocumentTree = ({ clientId, clientName }: ClientDocumentTreeProps) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [documentTree, setDocumentTree] = useState<DocumentNode[]>([]);

  // Mock data - in real implementation, this would fetch from API
  useEffect(() => {
    const mockTree: DocumentNode[] = [
      {
        id: 'root',
        name: clientName,
        type: 'folder',
        children: [
          {
            id: 'forms',
            name: 'Forms',
            type: 'folder',
            children: [
              {
                id: 'form47',
                name: 'Form 47 - Consumer Proposal',
                type: 'folder',
                children: [
                  {
                    id: 'form47-draft',
                    name: 'Form47_Draft_v1.pdf',
                    type: 'file',
                    status: 'needs-review',
                    lastModified: '2024-06-25',
                    size: '2.4 MB'
                  }
                ]
              }
            ]
          },
          {
            id: 'financial',
            name: 'Financial Documents',
            type: 'folder',
            children: [
              {
                id: 'bank-statements',
                name: 'Bank Statements',
                type: 'folder',
                children: [
                  {
                    id: 'bank-jan',
                    name: 'Bank_Statement_Jan_2024.pdf',
                    type: 'file',
                    status: 'complete',
                    lastModified: '2024-06-20',
                    size: '1.2 MB'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];
    setDocumentTree(mockTree);
  }, [clientName]);

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'needs-review':
        return <Badge className="bg-red-100 text-red-800">Needs Review</Badge>;
      default:
        return null;
    }
  };

  const renderNode = (node: DocumentNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="space-y-1">
        <div 
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {node.type === 'folder' ? (
            <Folder className="h-4 w-4 text-blue-600" />
          ) : (
            <FileText className="h-4 w-4 text-gray-600" />
          )}
          
          <span className="flex-1 font-medium">{node.name}</span>
          
          {node.status && getStatusBadge(node.status)}
          
          {node.type === 'file' && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Download className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children?.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {documentTree.map(node => renderNode(node))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
