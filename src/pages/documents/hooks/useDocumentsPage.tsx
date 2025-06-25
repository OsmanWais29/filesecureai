import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

interface Client {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending" | "flagged";
  location?: string;
  lastActivity?: string;
  needsAttention?: boolean;
}

// Demo data for clients
const DEMO_CLIENTS: Client[] = [
  {
    id: "josh-hart",
    name: "Josh Hart",
    status: "active",
    location: "Ontario",
    lastActivity: "2024-06-01",
    needsAttention: true
  },
  {
    id: "jane-smith",
    name: "Jane Smith",
    status: "active",
    location: "British Columbia",
    lastActivity: "2024-05-28",
    needsAttention: false
  },
  {
    id: "robert-johnson",
    name: "Robert Johnson",
    status: "pending",
    location: "Alberta",
    lastActivity: "2024-05-25",
    needsAttention: false
  },
  {
    id: "maria-garcia",
    name: "Maria Garcia",
    status: "flagged",
    location: "Quebec",
    lastActivity: "2024-05-20",
    needsAttention: true
  }
];

// Document tree structure for all clients
const CLIENT_DOCUMENTS: TreeNode[] = [
  // Josh Hart's documents
  {
    id: "josh-hart-root",
    name: "Josh Hart",
    type: "folder",
    folderType: "client",
    status: "needs-review",
    children: [
      {
        id: "estate-folder",
        name: "Estate 2025-47",
        type: "folder",
        folderType: "estate",
        children: [
          {
            id: "form47-folder",
            name: "Form 47 - Consumer Proposal",
            type: "folder",
            folderType: "form",
            children: [
              {
                id: "form47-file",
                name: "Form47_Draft1.pdf",
                type: "file",
                status: "needs-review",
                filePath: "/documents/form47.pdf"
              }
            ]
          },
          {
            id: "financials-folder",
            name: "Financials",
            type: "folder",
            folderType: "financials",
            children: [
              {
                id: "budget-file",
                name: "Budget_2025.xlsx",
                type: "file",
                status: "needs-review",
                filePath: "/documents/budget.xlsx"
              }
            ]
          }
        ]
      }
    ]
  },
  // Jane Smith's documents
  {
    id: "jane-smith-root",
    name: "Jane Smith",
    type: "folder",
    folderType: "client",
    children: [
      {
        id: "tax-folder",
        name: "Tax Documents",
        type: "folder",
        folderType: "financials",
        children: [
          {
            id: "tax-return-file",
            name: "TaxReturn2023.pdf",
            type: "file",
            status: "complete",
            filePath: "/documents/taxreturn.pdf"
          }
        ]
      }
    ]
  },
  // Robert Johnson's documents
  {
    id: "robert-johnson-root",
    name: "Robert Johnson",
    type: "folder",
    folderType: "client",
    children: [
      {
        id: "form32-folder",
        name: "Form 32 - Debt Restructuring",
        type: "folder",
        folderType: "form",
        children: [
          {
            id: "form32-file",
            name: "Form32_Draft2.pdf",
            type: "file",
            status: "needs-review",
            filePath: "/documents/form32.pdf"
          }
        ]
      }
    ]
  },
  // Maria Garcia's documents
  {
    id: "maria-garcia-root",
    name: "Maria Garcia",
    type: "folder",
    folderType: "client",
    children: [
      {
        id: "proposal-folder",
        name: "Consumer Proposal",
        type: "folder",
        folderType: "form",
        children: [
          {
            id: "form43-file",
            name: "Form43_ConsumerProposal.pdf",
            type: "file",
            status: "needs-signature",
            filePath: "/documents/form43.pdf"
          }
        ]
      }
    ]
  }
];

export const useDocumentsPage = () => {
  const navigate = useNavigate();
  const [clients] = useState<Client[]>(DEMO_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  const handleClientSelect = (clientId: string) => {
    console.log("useDocumentsPage: Selected client:", clientId);
    
    // Update selected client state
    setSelectedClient(clientId);
    
    // Show toast notification
    const clientName = clients.find(c => c.id === clientId)?.name || clientId;
    toast.info(`Opening ${clientName}'s profile`, {
      description: "Navigating to client viewer..."
    });
    
    // Navigate to client viewer page
    setTimeout(() => {
      navigate(`/client-viewer/${clientId}`);
    }, 300); // Small delay for smooth UX
  };

  // Filter documents based on selected client
  const filteredDocuments = selectedClient 
    ? CLIENT_DOCUMENTS.filter(doc => doc.id.startsWith(selectedClient))
    : CLIENT_DOCUMENTS;

  return {
    clients,
    selectedClient,
    filteredDocuments,
    handleClientSelect
  };
};
