
import React, { useState, useEffect } from "react";
import { Client } from "./types";
import { useIncomeExpenseForm } from "./hooks/useIncomeExpenseForm";
import { usePredictiveData } from "./hooks/usePredictiveData";
import { useDashboardData } from "./dashboard/useDashboardData";
import { RealTimeAnalyticsPanel } from "./components/RealTimeAnalyticsPanel";
import { NoClientSelected } from "./components/NoClientSelected";
import { LoadingState } from "./components/LoadingState";
import { ExcelDocumentsAlert } from "./components/ExcelDocumentsAlert";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { FinancialAnalysisCard } from "./dashboard/FinancialAnalysisCard";
import { FinancialChartCard } from "./dashboard/FinancialChartCard";
import { FinancialSnapshotCard } from "./dashboard/FinancialSnapshotCard";
import { PredictiveAnalysisCard } from "./dashboard/PredictiveAnalysisCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ActivityDashboardProps {
  selectedClient: Client | null;
}

export const ActivityDashboard = ({ selectedClient }: ActivityDashboardProps) => {
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("metrics");
  const [showPredictiveAnalysis, setShowPredictiveAnalysis] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const {
    formData,
    isSubmitting,
    historicalData,
    isDataLoading,
    previousMonthData,
    handleSubmit,
  } = useIncomeExpenseForm(selectedClient);

  const {
    processedData,
    metrics: predictiveMetrics,
    categoryAnalysis,
    advancedRiskMetrics,
    isLoading: isPredictiveLoading,
    lastRefreshed,
    refetch: refreshPredictiveData
  } = usePredictiveData(selectedClient);

  const {
    metrics,
    mockChartData,
    mockExcelDocuments,
    seasonalityScore,
    expenseBreakdown
  } = useDashboardData(selectedClient, formData, historicalData);

  const handleRefresh = () => {
    refreshPredictiveData();
    setRefreshTrigger(prev => prev + 1);
  };

  // Listen for financial data updates
  useEffect(() => {
    const handleDataUpdate = (event: any) => {
      if (event.detail?.clientId === selectedClient?.id) {
        console.log("Detected financial data update, refreshing dashboard");
        setRefreshTrigger(prev => prev + 1);
      }
    };

    window.addEventListener('financial-data-updated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('financial-data-updated', handleDataUpdate);
    };
  }, [selectedClient]);

  if (!selectedClient) {
    return <NoClientSelected />;
  }

  if (isDataLoading) {
    return <LoadingState clientName={selectedClient.name} />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        selectedClient={selectedClient}
        formData={formData}
        isSubmitting={isSubmitting}
        handleSubmit={handleSubmit}
      />

      <RealTimeAnalyticsPanel 
        formData={formData} 
        previousMonthData={previousMonthData}
        historicalData={historicalData}
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Current Financial Analysis</h3>
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => setShowPredictiveAnalysis(!showPredictiveAnalysis)}
          className="text-sm font-medium flex items-center gap-1"
        >
          {showPredictiveAnalysis ? (
            <>Hide Predictive Analysis <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show Predictive Analysis <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>

      {showPredictiveAnalysis && (
        <PredictiveAnalysisCard
          clientName={selectedClient.name}
          lastRefreshed={lastRefreshed}
          processedData={processedData}
          categoryAnalysis={categoryAnalysis}
          advancedRiskMetrics={advancedRiskMetrics}
          isLoading={isPredictiveLoading}
          onRefresh={handleRefresh}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FinancialAnalysisCard
            activeAnalysisTab={activeAnalysisTab}
            setActiveAnalysisTab={setActiveAnalysisTab}
            metrics={metrics}
            currentPeriod={historicalData.currentPeriod}
            previousPeriod={historicalData.previousPeriod}
            seasonalityScore={seasonalityScore}
          />

          <FinancialChartCard
            chartData={mockChartData}
            expenseBreakdown={expenseBreakdown}
            clientName={selectedClient.name}
          />
        </div>

        <div className="space-y-6">
          <ExcelDocumentsAlert
            documents={mockExcelDocuments}
            clientName={selectedClient.name}
          />
          
          <FinancialSnapshotCard
            formData={formData}
            currentSurplus={metrics?.currentSurplus || "0"}
          />
        </div>
      </div>
    </div>
  );
};
