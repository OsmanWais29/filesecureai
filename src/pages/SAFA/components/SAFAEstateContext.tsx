
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Estate {
  id: string;
  name: string;
  estateNumber: string;
  trustee: string;
  status: "active" | "closed" | "pending";
  riskScore: number;
  type: string;
}

interface SAFAEstateContextProps {
  currentEstate: Estate | null;
  estates: Estate[];
  onEstateChange: (estate: Estate) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const mockEstates: Estate[] = [
  { id: "1", name: "John Smith", estateNumber: "CP #31-2847593", trustee: "David Miller", status: "active", riskScore: 72, type: "Consumer Proposal" },
  { id: "2", name: "Sarah Johnson", estateNumber: "BK #31-1928374", trustee: "David Miller", status: "active", riskScore: 45, type: "Bankruptcy" },
  { id: "3", name: "ABC Corporation", estateNumber: "D1 #31-8472615", trustee: "Lisa Chen", status: "pending", riskScore: 88, type: "Division I Proposal" },
  { id: "4", name: "Robert Williams", estateNumber: "BK #31-7462951", trustee: "David Miller", status: "closed", riskScore: 12, type: "Bankruptcy" },
];

export const SAFAEstateContext: React.FC<SAFAEstateContextProps> = ({
  currentEstate,
  estates = mockEstates,
  onEstateChange,
  searchQuery,
  onSearchChange,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "closed":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="border-b bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Estate Switcher */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[280px] justify-between">
                {currentEstate ? (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentEstate.status)}
                    <span className="font-medium">{currentEstate.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({currentEstate.estateNumber})
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select Estate...</span>
                )}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[320px]" align="start">
              <div className="p-2 border-b">
                <Input
                  placeholder="Search estates..."
                  className="h-8"
                />
              </div>
              {estates.map((estate) => (
                <DropdownMenuItem
                  key={estate.id}
                  onClick={() => onEstateChange(estate)}
                  className="flex items-center gap-2 py-2"
                >
                  {getStatusIcon(estate.status)}
                  <div className="flex-1">
                    <div className="font-medium">{estate.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {estate.estateNumber} • {estate.type}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Estate Details */}
          {currentEstate && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Trustee:</span>
                <span className="font-medium">{currentEstate.trustee}</span>
              </div>
              <Badge 
                variant={currentEstate.status === "active" ? "default" : "secondary"}
                className="capitalize"
              >
                {currentEstate.status}
              </Badge>
              <div className="flex items-center gap-1">
                <AlertTriangle className={`h-4 w-4 ${getRiskColor(currentEstate.riskScore)}`} />
                <span className={`font-medium ${getRiskColor(currentEstate.riskScore)}`}>
                  Risk: {currentEstate.riskScore}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Global Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
    </div>
  );
};
