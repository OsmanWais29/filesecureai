
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ActivityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Button onClick={() => navigate("/activities/new")}>New Activity</Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your most recent income and expense submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No recent activities found</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>Overview of your financial situation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Income:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t">
                <span>Net Amount:</span>
                <span>$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityPage;
