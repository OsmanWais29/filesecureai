
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Plus, User } from "lucide-react";
import { IncomeExpenseModal } from "@/components/activity/form/IncomeExpenseModal";

const ActivityPage = () => {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  const clients = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Robert Johnson" },
  ];

  const tabs = [
    { id: "form", label: "Income & Expense Form" },
    { id: "dashboard", label: "Dashboard" },
    { id: "analysis", label: "Predictive Analysis" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Smart Income & Expense Management
        </h1>
      </div>

      {/* Client Information Card */}
      <Card className="mb-6 max-w-6xl mx-auto">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Client Information
          </CardTitle>
          <p className="text-gray-600 text-sm">
            Select a client or create a new form
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-12 px-6 bg-teal-700 hover:bg-teal-800 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              Create Income & Expense Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg border transition-colors ${
                activeTab === tab.id
                  ? "bg-white border-gray-300 shadow-sm font-medium"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="max-w-6xl mx-auto min-h-[500px]">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto text-gray-400">
              <User className="w-full h-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Client Selected
            </h3>
            <p className="text-gray-600 max-w-md">
              Please select a client above to begin entering financial data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Income & Expense Modal */}
      <IncomeExpenseModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
};

export default ActivityPage;
