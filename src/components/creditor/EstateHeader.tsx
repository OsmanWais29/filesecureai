import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Calendar,
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  User,
} from "lucide-react";
import { Estate } from "@/types/estate";

interface EstateHeaderProps {
  estate: Estate;
  onChangeEstate?: () => void;
}

export function EstateHeader({ estate, onChangeEstate }: EstateHeaderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'in_realization':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'in_distribution':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'closed':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getEstateTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      bankruptcy: 'Bankruptcy',
      consumer_proposal: 'Consumer Proposal',
      ccaa: 'CCAA',
      division_i_proposal: 'Division I Proposal',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Primary Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{estate.debtor_name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="font-mono">File #{estate.file_number}</span>
                <Separator orientation="vertical" className="h-4" />
                <Badge variant="outline" className="text-xs">
                  {getEstateTypeBadge(estate.estate_type)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={getStatusColor(estate.status)}>
              {estate.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {onChangeEstate && (
              <Button variant="outline" size="sm" onClick={onChangeEstate}>
                Change Estate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Row - Key Metrics */}
      <div className="px-6 py-3 flex flex-wrap items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Trustee:</span>
          <span className="font-medium">{estate.trustee_name}</span>
        </div>
        
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Trust Balance:</span>
          <span className="font-medium font-mono">{formatCurrency(estate.trust_balance)}</span>
        </div>
        
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Creditors:</span>
          <span className="font-medium">{estate.total_creditors}</span>
        </div>
        
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Total Claims:</span>
          <span className="font-medium font-mono">{formatCurrency(estate.total_claims)}</span>
        </div>

        {estate.next_deadline && (
          <>
            <Separator orientation="vertical" className="h-5 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">Next Deadline:</span>
              <span className="font-medium text-amber-600">
                {new Date(estate.next_deadline).toLocaleDateString('en-CA', {
                  month: 'short',
                  day: 'numeric',
                })}
                {estate.next_deadline_description && ` - ${estate.next_deadline_description}`}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
