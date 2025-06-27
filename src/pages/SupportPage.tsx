
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SupportDashboard } from '@/components/support/SupportDashboard';
import { ForumLayout } from '@/components/support/ForumLayout';

const SupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <ForumLayout
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowChatbot={() => {}} // Empty function since we removed the chatbot
        >
          <SupportDashboard 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery}
            setSelectedCategory={setSelectedCategory}
          />
        </ForumLayout>
      </div>
    </MainLayout>
  );
};

export default SupportPage;
