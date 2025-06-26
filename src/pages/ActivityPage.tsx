
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Smart Income & Expense Management
        </h1>
        <p className="text-gray-600 text-sm">
          Manage and track client financial data with AI-powered insights
        </p>
      </div>

      {/* Client Information Card */}
      <Card className="mb-6 shadow-sm border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Client Information
          </CardTitle>
          <p className="text-gray-500 text-sm mt-1">
            Select a client or create a new form
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="h-11 bg-white border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 shadow-lg">
                  {clients.map((client) => (
                    <SelectItem 
                      key={client.id} 
                      value={client.id}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="h-11 px-6 bg-teal-600 hover:bg-teal-700 text-white flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <FileText className="h-4 w-4" />
              Create Income & Expense Form
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="shadow-sm border-gray-200 min-h-[400px]">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto text-gray-300 mb-2">
              <User className="w-full h-full" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">
              No Client Selected
            </h3>
            <p className="text-gray-500 max-w-md leading-relaxed">
              Please select a client above to begin entering financial data and accessing their dashboard.
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
