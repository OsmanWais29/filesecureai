import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Search, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Estate {
  id: string;
  clientName: string;
  estateNumber: string;
  type: "bankruptcy" | "proposal" | "ccaa";
  status: "open" | "in_realization" | "in_distribution" | "closed";
  trustee: string;
}

// Mock estates for demo
const mockEstates: Estate[] = [
  { id: "1", clientName: "John Smith", estateNumber: "31-2847593", type: "proposal", status: "open", trustee: "Sarah Johnson" },
  { id: "2", clientName: "ABC Corp Ltd.", estateNumber: "31-2847594", type: "bankruptcy", status: "in_realization", trustee: "Sarah Johnson" },
  { id: "3", clientName: "Jane Doe", estateNumber: "31-2847595", type: "proposal", status: "in_distribution", trustee: "Michael Brown" },
  { id: "4", clientName: "XYZ Holdings Inc.", estateNumber: "31-2847596", type: "ccaa", status: "open", trustee: "Sarah Johnson" },
];

interface EstateSwitcherProps {
  selectedEstate?: Estate;
  onEstateChange?: (estate: Estate) => void;
}

export const EstateSwitcher = ({ selectedEstate, onEstateChange }: EstateSwitcherProps) => {
  const [search, setSearch] = useState("");
  const [currentEstate, setCurrentEstate] = useState<Estate>(selectedEstate || mockEstates[0]);

  const filteredEstates = mockEstates.filter(
    (estate) =>
      estate.clientName.toLowerCase().includes(search.toLowerCase()) ||
      estate.estateNumber.includes(search)
  );

  const handleSelectEstate = (estate: Estate) => {
    setCurrentEstate(estate);
    onEstateChange?.(estate);
  };

  const getStatusColor = (status: Estate["status"]) => {
    switch (status) {
      case "open": return "bg-green-500/10 text-green-600 border-green-200";
      case "in_realization": return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "in_distribution": return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "closed": return "bg-gray-500/10 text-gray-600 border-gray-200";
    }
  };

  const getTypeLabel = (type: Estate["type"]) => {
    switch (type) {
      case "bankruptcy": return "BK";
      case "proposal": return "CP";
      case "ccaa": return "CCAA";
    }
  };

  return (
    <div className="h-14 border-b bg-card flex items-center px-4 gap-4">
      {/* Estate Switcher Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-3 gap-2 hover:bg-accent">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{currentEstate.clientName}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {getTypeLabel(currentEstate.type)} #{currentEstate.estateNumber}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Trustee: {currentEstate.trustee}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients or estate #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {filteredEstates.map((estate) => (
              <DropdownMenuItem
                key={estate.id}
                onClick={() => handleSelectEstate(estate)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer",
                  currentEstate.id === estate.id && "bg-accent"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {estate.type === "ccaa" ? (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{estate.clientName}</div>
                  <div className="text-xs text-muted-foreground">
                    {getTypeLabel(estate.type)} #{estate.estateNumber}
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-[10px] shrink-0", getStatusColor(estate.status))}>
                  {estate.status.replace("_", " ")}
                </Badge>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Badge */}
      <Badge variant="outline" className={cn("ml-auto", getStatusColor(currentEstate.status))}>
        {currentEstate.status.replace("_", " ").toUpperCase()}
      </Badge>

      {/* Global Search */}
      <div className="relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Global search..."
          className="pl-8 h-9 bg-muted/50"
        />
      </div>
    </div>
  );
};
