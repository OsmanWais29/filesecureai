import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileCheck, 
  FileX, 
  Clock, 
  Shield, 
  Star, 
  DollarSign,
  AlertTriangle,
  TrendingUp
} from "lucide-react";
import { CreditorStats } from "@/types/creditor";

interface CreditorStatsCardsProps {
  stats: CreditorStats;
}

export function CreditorStatsCards({ stats }: CreditorStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Creditors */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Creditors
          </CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{stats.total_creditors}</div>
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {stats.claims_filed} Claims
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Claims Status */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Claims Status
          </CardTitle>
          <FileCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-500">{stats.claims_accepted}</span>
            <span className="text-muted-foreground">Accepted</span>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="destructive" className="text-xs">
              <FileX className="h-3 w-3 mr-1" />
              {stats.claims_rejected} Rejected
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {stats.claims_pending} Pending
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Claim Amounts by Priority */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Claims by Priority
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(stats.total_claim_amount)}
          </div>
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <Shield className="h-3 w-3 text-blue-500" />
                Secured
              </span>
              <span className="font-medium">{formatCurrency(stats.total_secured)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                Preferred
              </span>
              <span className="font-medium">{formatCurrency(stats.total_preferred)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                Unsecured
              </span>
              <span className="font-medium">{formatCurrency(stats.total_unsecured)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Flags */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Action Required
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{stats.critical_flags}</div>
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Missing Docs</span>
              <Badge variant="outline" className="text-xs">{stats.missing_docs_count}</Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Late Filings</span>
              <Badge variant="outline" className="text-xs">{stats.late_filings}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
