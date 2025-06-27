
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SupportDashboard } from '@/components/support/SupportDashboard';
import { ForumLayout } from '@/components/support/ForumLayout';
import { AIAssistantModal } from '@/components/support/AIAssistantModal';
import { useState } from 'react';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showChatbot, setShowChatbot] = useState(false);

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <ForumLayout
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowChatbot={setShowChatbot}
        >
          <SupportDashboard 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery} 
          />
        </ForumLayout>
        
        <AIAssistantModal
          open={showChatbot}
          onOpenChange={setShowChatbot}
        />
      </div>
    </MainLayout>
  );
};

export default SupportPage;
