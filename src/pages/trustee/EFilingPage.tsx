
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TrusteeEFilingPage = () => {
  return (
    <MainLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>E-Filing</CardTitle>
          </CardHeader>
          <CardContent>
            <p>E-Filing functionality coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeEFilingPage;
