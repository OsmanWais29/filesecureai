
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ForumLayout } from "@/components/support/ForumLayout";
import { ForumList } from "@/components/support/ForumList";
import { AIAssistantModal } from "@/components/support/AIAssistantModal";

const Support = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <ForumLayout
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowChatbot={setShowChatbot}
        >
          <ForumList />
        </ForumLayout>
        
        <AIAssistantModal
          open={showChatbot}
          onOpenChange={setShowChatbot}
        />
      </div>
    </MainLayout>
  );
};

export default Support;
