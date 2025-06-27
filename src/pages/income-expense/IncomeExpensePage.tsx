
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Plus, User, TrendingUp, Calculator, Database } from "lucide-react";
import { IncomeExpenseModal } from "@/components/activity/form/IncomeExpenseModal";
import { IncomeExpenseForm } from "@/components/activity/IncomeExpenseForm";
import { PredictiveAnalysis } from "@/components/activity/PredictiveAnalysis";
import { DocumentUploadSection } from "@/components/activity/DocumentUploadSection";
import { Client } from "@/components/activity/types";
import { MainLayout } from "@/components/layout/MainLayout";

const IncomeExpensePage = () => {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");

  // Mock clients - properly typed with Client interface
  const clients: Client[] = [
    { id: "1", name: "John Doe", status: "active" as const, last_activity: "2024-03-15" },
    { id: "2", name: "Jane Smith", status: "active" as const, last_activity: "2024-03-14" },
    { id: "3", name: "Robert Johnson", status: "pending" as const, last_activity: "2024-03-13" },
    { id: "4", name: "Sarah Williams", status: "active" as const, last_activity: "2024-03-12" },
    { id: "5", name: "Michael Brown", status: "active" as const, last_activity: "2024-03-11" },
  ];

  const tabs = [
    { id: "form", label: "Income & Expense Form", icon: FileText },
    { id: "dashboard", label: "Dashboard", icon: Database },
    { id: "analysis", label: "Predictive Analysis", icon: TrendingUp },
  ];

  const selectedClientData = selectedClient ? clients.find(c => c.id === selectedClient) : null;

  const renderTabContent = () => {
    if (!selectedClient) {
      return (
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
      );
    }

    switch (activeTab) {
      case "form":
        return (
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Income & Expense Form - {selectedClientData?.name}
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Enter monthly income and expense data for comprehensive financial tracking
              </p>
            </CardHeader>
            <CardContent>
              <IncomeExpenseForm selectedClient={selectedClientData} />
            </CardContent>
          </Card>
        );
      
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Client Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Monthly Income</p>
                      <p className="text-2xl font-bold text-green-600">$4,250</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Monthly Expenses</p>
                      <p className="text-2xl font-bold text-red-600">$3,890</p>
                    </div>
                    <Calculator className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Net Surplus</p>
                      <p className="text-2xl font-bold text-blue-600">$360</p>
                    </div>
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Upload Section */}
            <DocumentUploadSection />
          </div>
        );
        
      case "analysis":
        return <PredictiveAnalysis selectedClient={selectedClientData} />;
        
      default:
        return null;
    }
  };

  return (
    <MainLayout>
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
                        <div className="flex items-center gap-2">
                          <span>{client.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {client.status}
                          </span>
                        </div>
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        {renderTabContent()}

        {/* Income & Expense Modal */}
        <IncomeExpenseModal 
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onClientCreated={(clientId, clientName) => {
            setSelectedClient(clientId);
            setActiveTab("form");
          }}
        />
      </div>
    </MainLayout>
  );
};

export default IncomeExpensePage;
