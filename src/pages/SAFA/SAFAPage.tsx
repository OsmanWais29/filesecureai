
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatInterface } from "./components/ChatInterface";

const SAFAPage = () => {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <ChatInterface />
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
