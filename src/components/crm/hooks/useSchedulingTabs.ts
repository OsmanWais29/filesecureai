
import { useState } from 'react';

export function useSchedulingTabs() {
  const [activeTab, setActiveTab] = useState("calendar");
  
  return {
    activeTab,
    setActiveTab
  };
}
