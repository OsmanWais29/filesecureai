
import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";

const TrusteeClientViewerPage = () => {
  const { clientId } = useParams();

  return (
    <MainLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Viewing client: {clientId}</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrusteeClientViewerPage;
