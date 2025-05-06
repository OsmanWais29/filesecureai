
import { Button } from "@/components/ui/button";
import { SearchBar } from "../SearchBar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Filter, Folder, Home, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  groupedByClient: Record<string, {
    documents: any[];
    lastUpdated: Date | null;
    types: Set<string>;
  }>;
  selectedFolder: string | null;
  setSelectedFolder: (value: string | null) => void;
}

export const Sidebar = ({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  searchQuery,
  setSearchQuery,
  groupedByClient,
  selectedFolder,
  setSelectedFolder
}: SidebarProps) => {
  
  // Trigger resize event when sidebar collapses/expands
  useEffect(() => {
    // Small delay to let the transition complete
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isSidebarCollapsed]);

  return (
    <aside className={cn(
      "border-r bg-background transition-all duration-300 ease-in-out relative h-full",
      isSidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Home Section */}
      <div className="p-4 border-b">
        {isSidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full"
                onClick={() => setSelectedFolder(null)}
              >
                <Home className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Document Management</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setSelectedFolder(null)}
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Document Management</span>
          </Button>
        )}
      </div>

      {/* Search Section */}
      <div className="p-4 border-b">
        {!isSidebarCollapsed && (
          <SearchBar 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </div>

      {/* Folders Section */}
      <div className="p-4 border-b flex items-center justify-between">
        {!isSidebarCollapsed && (
          <h2 className="font-semibold">Folders</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn("ml-auto", isSidebarCollapsed && "w-full")}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="overflow-y-auto h-full p-4">
        <div className="space-y-2">
          {Object.entries(groupedByClient).map(([clientName, folderData]) => (
            isSidebarCollapsed ? (
              <Tooltip key={clientName}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "w-full justify-start",
                      selectedFolder === clientName && "bg-accent"
                    )}
                    onClick={() => setSelectedFolder(clientName)}
                  >
                    <Folder className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {folderData.documents.length} documents
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                key={clientName}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  selectedFolder === clientName && "bg-accent"
                )}
                onClick={() => setSelectedFolder(clientName)}
              >
                <Folder className="h-4 w-4 mr-2" />
                <span className="truncate">{clientName}</span>
              </Button>
            )
          ))}
        </div>
      </div>
    </aside>
  );
};
