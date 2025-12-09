import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Star,
  DollarSign,
  MoreHorizontal,
  Eye,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Sparkles,
  Split,
} from "lucide-react";
import { Claim, Creditor } from "@/types/creditor";

interface ClaimWithCreditor extends Claim {
  creditor_name: string;
}

interface ClaimsTableProps {
  claims: ClaimWithCreditor[];
  onViewClaim: (claim: ClaimWithCreditor) => void;
  onValidateClaim: (claim: ClaimWithCreditor) => void;
  onSplitClaim: (claim: ClaimWithCreditor) => void;
  onViewEvidence: (claim: ClaimWithCreditor) => void;
}

export function ClaimsTable({
  claims,
  onViewClaim,
  onValidateClaim,
  onSplitClaim,
  onViewEvidence,
}: ClaimsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-CA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      secured: { 
        icon: <Shield className="h-3 w-3" />, 
        className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
      },
      preferred: { 
        icon: <Star className="h-3 w-3" />, 
        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
      },
      unsecured: { 
        icon: <DollarSign className="h-3 w-3" />, 
        className: 'bg-muted text-muted-foreground border-border' 
      },
    };
    const { icon, className } = config[priority] || config.unsecured;
    return (
      <Badge variant="outline" className={className}>
        {icon}
        <span className="ml-1 capitalize">{priority}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      pending: { 
        icon: <Clock className="h-3 w-3" />, 
        className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' 
      },
      accepted: { 
        icon: <CheckCircle2 className="h-3 w-3" />, 
        className: 'bg-green-500/10 text-green-600 border-green-500/20' 
      },
      rejected: { 
        icon: <XCircle className="h-3 w-3" />, 
        className: 'bg-red-500/10 text-red-600 border-red-500/20' 
      },
      disputed: { 
        icon: <AlertTriangle className="h-3 w-3" />, 
        className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' 
      },
    };
    const { icon, className } = config[status] || config.pending;
    return (
      <Badge variant="outline" className={className}>
        {icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const filteredClaims = claims.filter(claim =>
    claim.creditor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedClaims.length === filteredClaims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(filteredClaims.map(c => c.id));
    }
  };

  const toggleSelectClaim = (claimId: string) => {
    setSelectedClaims(prev =>
      prev.includes(claimId)
        ? prev.filter(id => id !== claimId)
        : [...prev, claimId]
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search claims..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {selectedClaims.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedClaims.length} selected
            </span>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Batch Validate
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedClaims.length === filteredClaims.length && filteredClaims.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold">Claim ID</TableHead>
              <TableHead className="font-semibold">Creditor</TableHead>
              <TableHead className="font-semibold text-right">Total Amount</TableHead>
              <TableHead className="font-semibold text-right">Secured</TableHead>
              <TableHead className="font-semibold text-right">Unsecured</TableHead>
              <TableHead className="font-semibold">Filed</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Evidence</TableHead>
              <TableHead className="font-semibold">AI Score</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClaims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
                  No claims found
                </TableCell>
              </TableRow>
            ) : (
              filteredClaims.map((claim) => (
                <TableRow 
                  key={claim.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewClaim(claim)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedClaims.includes(claim.id)}
                      onCheckedChange={() => toggleSelectClaim(claim.id)}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {claim.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{claim.creditor_name}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(claim.claim_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-blue-600">
                    {claim.secured_amount > 0 ? formatCurrency(claim.secured_amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(claim.unsecured_amount)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(claim.filing_date)}
                    {claim.is_late_filing && (
                      <Badge variant="outline" className="ml-2 text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                        Late
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getPriorityBadge(claim.priority)}</TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); onViewEvidence(claim); }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      {claim.supporting_documents.length}
                    </Button>
                  </TableCell>
                  <TableCell>
                    {claim.osb_compliant ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        92%
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewClaim(claim); }}>
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onValidateClaim(claim); }}>
                          <Sparkles className="h-4 w-4 mr-2" /> AI Validate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSplitClaim(claim); }}>
                          <Split className="h-4 w-4 mr-2" /> Split Claim
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
