
import { useState, useEffect, useMemo, useCallback } from "react";
import { AuditTrailHeader } from "./AuditTrailHeader";
import { Timeline } from "./Timeline";
import { DetailPanel } from "./DetailPanel";
import { FilterPanel } from "./FilterPanel";
import { FilterOptions } from "./types/filterTypes";
import { AuditEntry } from "./TimelineEntry";
import { isWithinTimeframe } from "@/utils/validation";

const generateMockData = (): AuditEntry[] => {
  const users = [
    { 
      name: "John Smith", 
      role: "Administrator", 
      ip: "192.168.1.105", 
      location: "Toronto, CA" 
    },
    { 
      name: "Emily Chen", 
      role: "Bankruptcy Specialist", 
      ip: "192.168.1.112", 
      location: "Vancouver, CA" 
    },
    { 
      name: "Michael Rodriguez", 
      role: "Auditor", 
      ip: "192.168.1.118", 
      location: "Montreal, CA" 
    }
  ];

  const documents = [
    { name: "Form 76 - Consumer Proposal", type: "Legal Document" },
    { name: "Form 65 - Assignment", type: "Bankruptcy Document" },
    { name: "Client 1423 Affidavit", type: "Legal Document" },
    { name: "Financial Statement 2023", type: "Financial Record" },
    { name: "Tax Assessment Report", type: "Financial Record" }
  ];

  const actionDetails = {
    upload: "Document was uploaded to the system. Hash verified and stored.",
    view: "Document was accessed and viewed. No changes were made.",
    edit: "Document content was modified. Changes recorded in version history.",
    delete: "Document was marked for deletion. Stored in deletion queue for 30 days.",
    risk_assessment: "Automated risk assessment was performed. Results stored in metadata."
  };

  const mockEntries: AuditEntry[] = [];
  
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const document = documents[Math.floor(Math.random() * documents.length)];
    const actionType = ['upload', 'view', 'edit', 'delete', 'risk_assessment'][Math.floor(Math.random() * 5)] as keyof typeof actionDetails;
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 7));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    mockEntries.push({
      id: `entry-${i}`,
      timestamp: date,
      user,
      actionType,
      documentName: document.name,
      documentType: document.type,
      details: actionDetails[actionType],
      metadata: actionType === 'risk_assessment' ? {
        riskScore: Math.floor(Math.random() * 100),
        issues: Math.random() > 0.7 ? ["Missing signature", "Incomplete fields"] : [],
        complianceStatus: Math.random() > 0.3 ? "compliant" : "non-compliant"
      } : undefined
    });
  }
  
  return mockEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const AuditTrailDashboard = () => {
  const [allEntries, setAllEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [currentClientId, setCurrentClientId] = useState(1);
  const [filters, setFilters] = useState<FilterOptions>({
    actionTypes: new Set<string>(),
    timeframe: 'all',
    users: new Set<string>()
  });
  
  const fetchAuditData = useCallback(() => {
    return generateMockData();
  }, [currentClientId]);
  
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const idleCallback = window.requestIdleCallback(() => {
        const mockData = fetchAuditData();
        setAllEntries(mockData);
        setFilteredEntries(mockData);
        setSelectedEntry(null);
      });
      
      return () => {
        if (typeof window.cancelIdleCallback === 'function') {
          window.cancelIdleCallback(idleCallback);
        }
      };
    } else {
      const mockData = fetchAuditData();
      setAllEntries(mockData);
      setFilteredEntries(mockData);
      setSelectedEntry(null);
    }
  }, [currentClientId, fetchAuditData]);
  
  const applyFilters = useCallback(() => {
    const filteredData = allEntries.filter(entry => {
      if (filters.actionTypes.size > 0 && !filters.actionTypes.has(entry.actionType)) {
        return false;
      }
      
      if (filters.users.size > 0 && !filters.users.has(entry.user.name)) {
        return false;
      }
      
      if (filters.timeframe !== 'all' && !isWithinTimeframe(entry.timestamp, filters.timeframe)) {
        return false;
      }
      
      return true;
    });
    
    setFilteredEntries(filteredData);
    
    if (selectedEntry && !filteredData.find(e => e.id === selectedEntry.id)) {
      setSelectedEntry(null);
    }
  }, [filters, allEntries, selectedEntry]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [filters, applyFilters]);
  
  const handleClientChange = useCallback((clientId: number) => {
    setCurrentClientId(clientId);
  }, []);
  
  const handleEntrySelect = useCallback((entry: AuditEntry) => {
    setSelectedEntry(entry);
  }, []);
  
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);
  
  return (
    <div className="flex flex-col h-full">
      <AuditTrailHeader onClientChange={handleClientChange} />
      
      <div className="flex flex-1 gap-6">
        <div className="w-1/4 min-w-0">
          <FilterPanel 
            entries={allEntries} 
            onFilterChange={handleFilterChange} 
          />
        </div>
        
        <div className="w-1/2 min-w-0">
          <Timeline
            entries={filteredEntries}
            onEntrySelect={handleEntrySelect}
            selectedEntryId={selectedEntry?.id}
          />
        </div>
        
        <div className="w-1/4 min-w-0">
          <DetailPanel entry={selectedEntry} />
        </div>
      </div>
    </div>
  );
};
