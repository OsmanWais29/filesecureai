import { useEffect, useState } from "react";
import { ClientList } from "@/components/documents/ClientList";
import { DocumentTree } from "@/components/documents/DocumentTree";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/MainLayout";

// Define a proper DocumentStatus type to match what DocumentTree expects
type DocumentStatus = "needs-review" | "complete" | "needs-signature" | undefined;

// Define FolderType to match what DocumentTree expects
type FolderType = 'client' | 'estate' | 'form' | 'financials' | 'default';

// Updated type definition for TreeNode that matches DocumentTree expectations
interface TreeNode {
  id: string;
  name: string;
  type: "folder" | "file";
  folderType?: FolderType;
  status?: DocumentStatus;
  children?: TreeNode[];
  filePath?: string;
}

// Hardcoded demo data for clients
const DEMO_CLIENTS = [
  {
    id: "josh-hart",
    name: "Josh Hart",
    status: "active" as const,
    location: "Ontario",
    lastActivity: "2024-06-01",
    needsAttention: true
  },
  {
    id: "jane-smith",
    name: "Jane Smith",
    status: "active" as const,
    location: "British Columbia",
    lastActivity: "2024-05-28",
    needsAttention: false
  },
  {
    id: "robert-johnson",
    name: "Robert Johnson",
    status: "pending" as const,
    location: "Alberta",
    lastActivity: "2024-05-25",
    needsAttention: false
  },
  {
    id: "maria-garcia",
    name: "Maria Garcia",
    status: "flagged" as const,
    location: "Quebec",
    lastActivity: "2024-05-20",
    needsAttention: true
  }
];

// Document tree structure for all clients - fixed status to match DocumentStatus type
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
      },
      {
        id: "employment-folder",
        name: "Employment",
        type: "folder",
        folderType: "form",
        children: [
          {
            id: "employment-verification",
            name: "EmploymentVerification.pdf",
            type: "file",
            status: "complete",
            filePath: "/documents/employment.pdf"
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
      },
      {
        id: "bank-statement-folder",
        name: "Bank Statements",
        type: "folder",
        folderType: "financials",
        children: [
          {
            id: "q1-statements",
            name: "Q1_2024_Statements.pdf",
            type: "file",
            status: "complete",
            filePath: "/documents/q1statements.pdf"
          }
        ]
      },
      {
        id: "credit-report",
        name: "CreditReport.pdf",
        type: "file",
        status: "complete",
        filePath: "/documents/creditreport.pdf"
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
          },
          {
            id: "creditor-list",
            name: "CreditorList.xlsx",
            type: "file",
            status: "needs-review",
            filePath: "/documents/creditors.xlsx"
          }
        ]
      },
      {
        id: "income-statement",
        name: "IncomeExpenseStatement.pdf",
        type: "file",
        status: "needs-review",
        filePath: "/documents/incomestatement.pdf"
      }
    ]
  }
];

const DocumentsPage = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  useEffect(() => {
    // Show a toast when the page loads
    toast.success("Documents loaded", {
      description: "Document tree is now visible"
    });
  }, []);
  
  const handleNodeSelect = (node: any) => {
    console.log("Selected node:", node);
  };

  const handleClientSelect = (clientId: string) => {
    console.log("DocumentsPage: Selected client:", clientId);
    setSelectedClient(clientId);
    // Navigate to the client viewer page
    navigate(`/client-viewer/${clientId}`);
  };

  const handleFileOpen = (node: any) => {
    console.log("Opening file:", node);
    // If the node is a file and its name or id references Form 47, navigate to the proper viewer route
    if (node?.type === "file") {
      // Check for Form 47 or Consumer Proposal files
      const lowerName = (node.name || "").toLowerCase();
      if (
        lowerName.includes("form 47") ||
        lowerName.includes("consumer proposal") ||
        node.id === "form47-file"
      ) {
        navigate("/document-viewer/form47");
        return;
      }
      // General fallback for other files (could be extended in future)
      // Optionally: navigate(`/document-viewer/${node.id}`);
    }
  };

  // Filter documents based on selected client
  const filteredDocuments = selectedClient 
    ? CLIENT_DOCUMENTS.filter(doc => doc.id.startsWith(selectedClient))
    : CLIENT_DOCUMENTS;

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left Panel: Client List */}
        <div className="w-72 flex-shrink-0">
          <ClientList 
            clients={DEMO_CLIENTS}
            selectedClientId={selectedClient}
            onClientSelect={handleClientSelect}
          />
        </div>
        
        {/* Right Panel: Document Tree */}
        <div className="flex-1 border-l p-4">
          <h2 className="text-xl font-semibold mb-4">
            {selectedClient 
              ? `${DEMO_CLIENTS.find(c => c.id === selectedClient)?.name}'s Documents` 
              : "All Documents"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {selectedClient 
              ? "Client-specific documents and folders" 
              : "System-wide view of all document activity. Click a client on the left to view their dedicated page."}
          </p>
          
          <div className="border rounded-lg shadow-sm overflow-hidden">
            <DocumentTree 
              rootNodes={filteredDocuments}
              onNodeSelect={handleNodeSelect}
              onFileOpen={handleFileOpen}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentsPage;
