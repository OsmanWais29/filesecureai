
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import SAFAContent from "./components/SAFAContent";

const SAFAPage = () => {
  return (
    <MainLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <SAFAContent />
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
