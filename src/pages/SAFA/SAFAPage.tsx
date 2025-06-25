
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { SAFAInterface } from "./components/SAFAInterface";

const SAFAPage = () => {
  return (
    <MainLayout>
      <div className="h-full">
        <SAFAInterface />
      </div>
    </MainLayout>
  );
};

export default SAFAPage;
