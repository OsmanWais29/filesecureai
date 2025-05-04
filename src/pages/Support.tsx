
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LifeBuoy, FileQuestion, AlertTriangle, MessageCircle, FileText } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-muted-foreground mb-6">
          Get help with SecureFiles AI and resolve any issues you're experiencing
        </p>
        
        <Tabs defaultValue="help" className="space-y-6">
          <TabsList>
            <TabsTrigger value="help">Help & Resources</TabsTrigger>
            <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="help" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileQuestion className="mr-2 h-5 w-5" />
                    Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Explore our comprehensive documentation to learn how to use all features of SecureFiles AI.
                  </p>
                  <Button className="w-full">View Documentation</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Known Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Check our list of known issues and workarounds for common problems.
                  </p>
                  <Button variant="outline" className="w-full">View Known Issues</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Follow step-by-step tutorials to master SecureFiles AI features.
                  </p>
                  <Button variant="outline" className="w-full">View Tutorials</Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Connect with our support team via live chat for immediate assistance.
                  </p>
                  <Button className="w-full">Start Chat</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Your Support Tickets</CardTitle>
                  <Button onClick={() => navigate('/new-support-ticket')}>
                    Create New Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LifeBuoy className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Active Tickets</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    You don't have any active support tickets. Create a new ticket if you're experiencing issues.
                  </p>
                  <Button onClick={() => navigate('/new-support-ticket')}>
                    Create Your First Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faq" className="space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">How do I upload documents?</h3>
                    <p className="text-muted-foreground">
                      Navigate to the Documents section, click on "Upload Document" button, 
                      and select the files you want to upload from your computer.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">How do I share documents with clients?</h3>
                    <p className="text-muted-foreground">
                      Open the document you want to share, click on the "Share" button, 
                      and enter the email address of the client you want to share with.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">How do I organize my documents?</h3>
                    <p className="text-muted-foreground">
                      Documents can be organized using folders. To create a folder, go to the Documents section, 
                      click "New Folder", name the folder, and drag documents into it.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">What file types are supported?</h3>
                    <p className="text-muted-foreground">
                      SecureFiles AI supports PDF, Word (.docx, .doc), Excel (.xlsx, .xls), 
                      PowerPoint (.pptx, .ppt), images (.jpg, .png), and text files (.txt).
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">How secure are my documents?</h3>
                    <p className="text-muted-foreground">
                      All documents are encrypted at rest and during transmission. We use bank-level 
                      security measures to protect your data and comply with industry standards.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Support;
