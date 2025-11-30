import { useState, useEffect, useMemo, useCallback } from "react";
import { OSBComplianceFilters, type OSBRiskCategory, type RiskLevel } from "./OSBComplianceFilters";
import { OSBComplianceAssistant } from "./OSBComplianceAssistant";
import { OSBTimelineEntry, type OSBAuditEntry } from "./OSBTimelineEntry";
import { AuditTrailHeader } from "../AuditTrailHeader";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data generator
const generateOSBMockData = (): OSBAuditEntry[] => {
  const entries: OSBAuditEntry[] = [
    {
      id: "1",
      timestamp: new Date(2025, 8, 18, 10, 21),
      user: { name: "J. Smith", role: "LIT" },
      category: "estate_administration",
      eventType: "Estate Created",
      estateNumber: "234-1234",
      estateName: "John Doe",
      details: "Intake questionnaire completed. Debtor identified as wage earner.",
      directive: "Dir. 6R3",
      riskLevel: "normal"
    },
    {
      id: "2",
      timestamp: new Date(2025, 8, 18, 10, 29),
      user: { name: "Case Admin", role: "Administrator" },
      category: "disclosure_reporting",
      eventType: "Document Added - Form 48",
      estateNumber: "234-1234",
      details: "Form 48 uploaded. AI validation passed. Missing creditor address auto-resolved via OCR + lookup.",
      biaSection: "158",
      riskLevel: "normal"
    },
    {
      id: "3",
      timestamp: new Date(2025, 8, 22, 13, 22),
      user: { name: "System", role: "Automated" },
      category: "trust_account",
      eventType: "Bank Transaction Imported",
      estateNumber: "234-1234",
      details: "Trust account balance updated. AI check: No discrepancies detected.",
      directive: "Dir. 5R5",
      riskLevel: "normal"
    },
    {
      id: "4",
      timestamp: new Date(2025, 9, 4, 9, 2),
      user: { name: "J. Smith", role: "LIT" },
      category: "estate_administration",
      eventType: "Surplus Income Calculation Updated",
      estateNumber: "234-1234",
      details: "New paystub detected. Adjusted threshold calculation. Previous: $245/mo, New: $298/mo.",
      directive: "Dir. 11R2",
      riskLevel: "warning"
    },
    {
      id: "5",
      timestamp: new Date(2025, 10, 1),
      user: { name: "System", role: "Automated" },
      category: "aged_estates",
      eventType: "Aged Estate Warning",
      estateNumber: "189-5678",
      estateName: "Jane Smith",
      details: "Estate age: 3.1 years. OSB threshold: 20% summary estates exceeded. Action required: Review remaining assets.",
      biaSection: "34(2)",
      riskLevel: "critical"
    },
    {
      id: "6",
      timestamp: new Date(2025, 8, 25, 14, 15),
      user: { name: "M. Johnson", role: "Case Manager" },
      category: "disclosure_reporting",
      eventType: "Form 2 Report Filed",
      estateNumber: "234-1234",
      details: "Monthly administrator report submitted to OSB. All required sections completed.",
      biaSection: "102",
      riskLevel: "normal"
    },
    {
      id: "7",
      timestamp: new Date(2025, 9, 10, 11, 30),
      user: { name: "J. Smith", role: "LIT" },
      category: "trust_account",
      eventType: "Trust Account Reconciliation",
      estateNumber: "234-1234",
      details: "Monthly reconciliation completed. Balance verified against bank statement. Match confirmed.",
      directive: "Dir. 5R5",
      riskLevel: "normal"
    },
    {
      id: "8",
      timestamp: new Date(2025, 9, 15, 16, 45),
      user: { name: "System", role: "Automated" },
      category: "estate_administration",
      eventType: "Asset Appraisal Required",
      estateNumber: "345-9012",
      estateName: "Robert Lee",
      details: "Vehicle asset identified without appraisal. Directive 7 requires valuation within 30 days.",
      directive: "Dir. 7",
      riskLevel: "warning"
    },
    {
      id: "9",
      timestamp: new Date(2025, 9, 20, 9, 0),
      user: { name: "A. Thompson", role: "Trustee Assistant" },
      category: "lit_practice",
      eventType: "Advertising Review",
      estateNumber: "N/A",
      details: "Quarterly advertising compliance check completed. All materials conform to Directive 33 requirements.",
      directive: "Dir. 33",
      riskLevel: "normal"
    },
    {
      id: "10",
      timestamp: new Date(2025, 10, 5, 13, 20),
      user: { name: "System", role: "Automated" },
      category: "disclosure_reporting",
      eventType: "Missing Form Alert - Form 6",
      estateNumber: "234-1234",
      details: "Form 6 (Statement of Affairs) not filed within required timeframe. Critical compliance issue.",
      biaSection: "49",
      riskLevel: "critical"
    }
  ];

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const OSBAuditTrailDashboard = () => {
  const [allEntries, setAllEntries] = useState<OSBAuditEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<OSBAuditEntry | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<OSBRiskCategory>>(new Set());
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<Set<RiskLevel>>(new Set());
  const [estateNumberFilter, setEstateNumberFilter] = useState("");
  const [debtorNameFilter, setDebtorNameFilter] = useState("");

  useEffect(() => {
    const mockData = generateOSBMockData();
    setAllEntries(mockData);
  }, []);

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(entry.category)) {
        return false;
      }
      if (selectedRiskLevels.size > 0 && !selectedRiskLevels.has(entry.riskLevel)) {
        return false;
      }
      if (estateNumberFilter && !entry.estateNumber?.includes(estateNumberFilter)) {
        return false;
      }
      if (debtorNameFilter && !entry.estateName?.toLowerCase().includes(debtorNameFilter.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [allEntries, selectedCategories, selectedRiskLevels, estateNumberFilter, debtorNameFilter]);

  const handleCategoryChange = useCallback((category: OSBRiskCategory) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  const handleRiskLevelChange = useCallback((level: RiskLevel) => {
    setSelectedRiskLevels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      <AuditTrailHeader onClientChange={() => {}} />

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* LEFT - OSB Compliance Filters */}
        <div className="w-1/4 min-w-[280px] max-w-[350px]">
          <OSBComplianceFilters
            selectedCategories={selectedCategories}
            selectedRiskLevels={selectedRiskLevels}
            onCategoryChange={handleCategoryChange}
            onRiskLevelChange={handleRiskLevelChange}
            onEstateNumberChange={setEstateNumberFilter}
            onDebtorNameChange={setDebtorNameFilter}
          />
        </div>

        {/* CENTER - OSB Timeline */}
        <div className="flex-1 min-w-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">OSB Audit Timeline</h2>
                <p className="text-sm text-muted-foreground">
                  Chronological ledger of all OSB compliance activities
                </p>
              </div>
              {filteredEntries.length > 0 ? (
                <div className="space-y-0">
                  {filteredEntries.map((entry) => (
                    <OSBTimelineEntry
                      key={entry.id}
                      entry={entry}
                      isSelected={entry.id === selectedEntry?.id}
                      onSelect={setSelectedEntry}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No entries match the selected filters.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT - OSB Compliance Assistant */}
        <div className="w-1/4 min-w-[300px] max-w-[380px]">
          <OSBComplianceAssistant />
        </div>
      </div>
    </div>
  );
};
