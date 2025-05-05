
import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SupportHeader } from "@/components/support/SupportHeader";
import { SupportCategorySidebar } from "@/components/support/SupportCategorySidebar";
import { SupportDashboard } from "@/components/support/SupportDashboard";
import { SupportTicketsList } from "@/components/support/SupportTicketsList";
import { SupportChatbot } from "@/components/support/SupportChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "sonner";

const Support = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <MainLayout>
      <div className="flex flex-col h-screen overflow-hidden">
        <SupportHeader 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          setShowChatbot={setShowChatbot}
        />
        
        <div className="flex-1 flex overflow-hidden">
          <SupportCategorySidebar 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          
          <div className="flex-1 overflow-auto py-6">
            <Tabs defaultValue="discussions" className="w-full">
              <div className="px-6 mb-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="discussions">Discussions</TabsTrigger>
                  <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="discussions" className="mt-0">
                <SupportDashboard 
                  selectedCategory={selectedCategory}
                  searchQuery={searchQuery}
                />
              </TabsContent>
              
              <TabsContent value="tickets" className="px-6 mt-0">
                <SupportTicketsList />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {showChatbot && (
          <SupportChatbot onClose={() => setShowChatbot(false)} />
        )}
        
        <Toaster position="bottom-right" />
      </div>
    </MainLayout>
  );
};

export default Support;
