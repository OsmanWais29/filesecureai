
import React from "react";
import { Sidebar } from "@/components/ui/sidebar";

interface SAFASidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// This is a wrapper component that uses the existing Sidebar component
const SAFASidebar: React.FC<SAFASidebarProps> = ({ isCollapsed, onToggle }) => {
  return <Sidebar isCollapsed={isCollapsed} onToggle={onToggle} />;
};

export default SAFASidebar;
