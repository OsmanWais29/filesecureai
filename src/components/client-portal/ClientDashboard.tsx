
import { useState, useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";
import { FileText, Upload, Download, Check } from "lucide-react";

export const ClientDashboard = () => {
  const { user } = useAuthState();
  const [showUpload, setShowUpload] = useState(false);
  const [recentDocuments, setRecentDocuments] = useState([
    { id: "doc1", title: "Form 47 - Statement of Affairs", date: "2023-10-15", status: "Approved" },
    { id: "doc2", title: "Financial Statement", date: "2023-09-30", status: "Pending Review" },
    { id: "doc3", title: "Monthly Income Report", date: "2023-09-28", status: "Pending Signature" },
  ]);

  const fullName = user?.user_metadata?.full_name || "Client";
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Welcome, {fullName}</h1>
        <p className="text-muted-foreground">
          View your documents, upload new files, and track your progress.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Submit new documents securely to your trustee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showUpload ? (
              <FileUpload
                onUploadComplete={() => setShowUpload(false)}
                allowedFileTypes={["application/pdf", "image/*"]}
                maxFileSize={10}
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 p-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/30">
                <Upload className="h-10 w-10 text-gray-400" />
                <p className="text-center text-sm text-gray-500">
                  Click the button below to upload your documents
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!showUpload && (
              <Button onClick={() => setShowUpload(true)} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Upload Documents
              </Button>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              View your recently uploaded and shared documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-4">
              {recentDocuments.map((doc) => (
                <div key={doc.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.status === "Approved" && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View All Documents
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              Documents that need your attention.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-amber-50 border-amber-200">
                <p className="text-sm font-medium text-amber-800">Form 31 - Certificate of Discharge</p>
                <p className="text-xs text-amber-700">Signature required</p>
              </div>
              <div className="p-3 border rounded-lg bg-blue-50 border-blue-200">
                <p className="text-sm font-medium text-blue-800">Monthly Income Statement</p>
                <p className="text-xs text-blue-700">Due by Oct 30, 2023</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full">
              View Required Documents
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
