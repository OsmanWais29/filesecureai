
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TrusteeSupport = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Support functionality coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeSupport;
