import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertTriangle, Building2, FileText, Users, DollarSign } from "lucide-react";

export type OSBRiskCategory = 
  | "trust_account"
  | "estate_administration"
  | "aged_estates"
  | "disclosure_reporting"
  | "lit_practice";

export type RiskLevel = "critical" | "warning" | "normal";

interface OSBComplianceFiltersProps {
  selectedCategories: Set<OSBRiskCategory>;
  selectedRiskLevels: Set<RiskLevel>;
  onCategoryChange: (category: OSBRiskCategory) => void;
  onRiskLevelChange: (level: RiskLevel) => void;
  onEstateNumberChange: (value: string) => void;
  onDebtorNameChange: (value: string) => void;
}

const riskCategories = [
  {
    id: "trust_account" as OSBRiskCategory,
    label: "Trust Account Management",
    icon: DollarSign,
    description: "Bank balance, SDR entries, transfers, reconciliations"
  },
  {
    id: "estate_administration" as OSBRiskCategory,
    label: "Estate Administration",
    icon: Building2,
    description: "Asset ID, appraisals, surplus income, trustee fees"
  },
  {
    id: "aged_estates" as OSBRiskCategory,
    label: "Aged Estates Monitoring",
    icon: AlertTriangle,
    description: "Estates past 3/6-year thresholds"
  },
  {
    id: "disclosure_reporting" as OSBRiskCategory,
    label: "Disclosure & Reporting",
    icon: FileText,
    description: "Forms 1, 2, 6, 48, SDRs, notices, motions"
  },
  {
    id: "lit_practice" as OSBRiskCategory,
    label: "LIT Practice Requirements",
    icon: Users,
    description: "Advertising, related persons, advance fees"
  }
];

const riskLevels = [
  { id: "critical" as RiskLevel, label: "Critical", color: "bg-red-500" },
  { id: "warning" as RiskLevel, label: "Warning", color: "bg-orange-500" },
  { id: "normal" as RiskLevel, label: "Normal", color: "bg-green-500" }
];

export const OSBComplianceFilters = ({
  selectedCategories,
  selectedRiskLevels,
  onCategoryChange,
  onRiskLevelChange,
  onEstateNumberChange,
  onDebtorNameChange
}: OSBComplianceFiltersProps) => {
  return (
    <div className="space-y-4 h-full overflow-y-auto px-2">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">OSB Compliance Filters</h3>
        </div>
      </div>

      {/* Risk Categories */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">OSB Risk Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {riskCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="flex items-start space-x-3">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.has(category.id)}
                  onCheckedChange={() => onCategoryChange(category.id)}
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={category.id}
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Estate Filters */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Estate Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="estate-number" className="text-xs">Estate Number</Label>
            <Input
              id="estate-number"
              placeholder="e.g., 234-1234"
              onChange={(e) => onEstateNumberChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="debtor-name" className="text-xs">Debtor Name</Label>
            <Input
              id="debtor-name"
              placeholder="Search by name..."
              onChange={(e) => onDebtorNameChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="case-type" className="text-xs">Case Type</Label>
            <Select>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="bankruptcy">Bankruptcy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estate-stage" className="text-xs">Estate Stage</Label>
            <Select>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="assessment">Initial Assessment</SelectItem>
                <SelectItem value="moc">Meeting of Creditors</SelectItem>
                <SelectItem value="discharge">Discharge</SelectItem>
                <SelectItem value="closed">File Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Flags */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Risk Severity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {riskLevels.map((level) => (
            <div key={level.id} className="flex items-center space-x-3">
              <Checkbox
                id={level.id}
                checked={selectedRiskLevels.has(level.id)}
                onCheckedChange={() => onRiskLevelChange(level.id)}
              />
              <Label
                htmlFor={level.id}
                className="text-sm font-medium cursor-pointer flex items-center gap-2"
              >
                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                {level.label}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
