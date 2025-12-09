import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Star,
  DollarSign,
  AlertTriangle,
  FileWarning,
  CalendarClock,
} from "lucide-react";
import { CreditorStats } from "@/types/creditor";

interface CreditorDashboardCardsProps {
  stats: CreditorStats;
  onFilterClick?: (filter: string) => void;
}

export function CreditorDashboardCards({ stats, onFilterClick }: CreditorDashboardCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Creditors */}
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => onFilterClick?.('all')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Creditors</p>
              <p className="text-3xl font-bold mt-1">{stats.total_creditors}</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claims Status */}
      <Card className="cursor-pointer hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Claims Status</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className="bg-green-500/10 text-green-600 border-green-500/20 cursor-pointer hover:bg-green-500/20"
              onClick={() => onFilterClick?.('accepted')}
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {stats.claims_accepted}
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-red-500/10 text-red-600 border-red-500/20 cursor-pointer hover:bg-red-500/20"
              onClick={() => onFilterClick?.('rejected')}
            >
              <XCircle className="h-3 w-3 mr-1" />
              {stats.claims_rejected}
            </Badge>
            <Badge 
              variant="outline" 
              className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 cursor-pointer hover:bg-yellow-500/20"
              onClick={() => onFilterClick?.('pending')}
            >
              <Clock className="h-3 w-3 mr-1" />
              {stats.claims_pending}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.claims_filed} filed of {stats.total_creditors}
          </p>
        </CardContent>
      </Card>

      {/* Claims by Priority */}
      <Card className="cursor-pointer hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">By Priority</p>
          </div>
          <div className="space-y-2">
            <div 
              className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
              onClick={() => onFilterClick?.('secured')}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-blue-500" />
                <span>Secured</span>
              </div>
              <span className="font-mono text-xs">{formatCurrency(stats.total_secured)}</span>
            </div>
            <div 
              className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
              onClick={() => onFilterClick?.('preferred')}
            >
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                <span>Preferred</span>
              </div>
              <span className="font-mono text-xs">{formatCurrency(stats.total_preferred)}</span>
            </div>
            <div 
              className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1"
              onClick={() => onFilterClick?.('unsecured')}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Unsecured</span>
              </div>
              <span className="font-mono text-xs">{formatCurrency(stats.total_unsecured)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Required */}
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors border-destructive/20"
        onClick={() => onFilterClick?.('action_required')}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Action Required</p>
            {stats.critical_flags > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5">
                {stats.critical_flags + stats.missing_docs_count + stats.late_filings}
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Critical Flags</span>
              </div>
              <span className="font-medium">{stats.critical_flags}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-amber-600">
                <FileWarning className="h-3.5 w-3.5" />
                <span>Missing Docs</span>
              </div>
              <span className="font-medium">{stats.missing_docs_count}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-orange-600">
                <CalendarClock className="h-3.5 w-3.5" />
                <span>Late Filings</span>
              </div>
              <span className="font-medium">{stats.late_filings}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
