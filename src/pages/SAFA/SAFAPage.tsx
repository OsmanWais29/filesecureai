
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatInterface } from "./components/ChatInterface";

const SAFAPage = () => {
  return (
    <MainLayout>
      <div className="h-full flex flex-col bg-white">
        <ChatInterface />
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
