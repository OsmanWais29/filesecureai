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

import { useEstateList } from "@/data/estateStore";
import type { EstateSummary } from "@/data/estateWorkspace";

type Estate = EstateSummary;
interface EstateSwitcherProps {
  selectedEstate?: Estate;
  onEstateChange?: (estate: Estate) => void;
}

export const EstateSwitcher = ({ selectedEstate, onEstateChange }: EstateSwitcherProps) => {
  const [search, setSearch] = useState("");
  const { estates, isLoading } = useEstateList();
  const currentEstate = selectedEstate;
  const filteredEstates = estates.filter(estate => estate.debtorName.toLowerCase().includes(search.toLowerCase()) || estate.estateNumber.includes(search));

  const handleSelectEstate = (estate: Estate) => {
    onEstateChange?.(estate);
  };

  const getStatusColor = (_status: string) => "bg-muted text-muted-foreground border-border";
  const getTypeLabel = (type: string) => type === "Bankruptcy" ? "BK" : type === "Consumer Proposal" ? "CP" : type;

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
                <span className="font-medium text-sm">{currentEstate?.debtorName ?? (isLoading ? "Loading estates…" : "Select estate")}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {getTypeLabel(currentEstate?.proceeding ?? "")} #{currentEstate?.estateNumber ?? ""}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Trustee: {currentEstate?.trustee ?? "—"}
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
                  currentEstate?.id === estate.id && "bg-accent"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {estate.proceeding === "ccaa" ? (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{estate.debtorName}</div>
                  <div className="text-xs text-muted-foreground">
                    {getTypeLabel(estate.proceeding)} #{estate.estateNumber}
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
      <Badge variant="outline" className={cn("ml-auto", getStatusColor((currentEstate?.status ?? "No estate selected")))}>
        {(currentEstate?.status ?? "No estate selected").replace("_", " ").toUpperCase()}
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
