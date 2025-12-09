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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Star,
  DollarSign,
  MoreHorizontal,
  Eye,
  FileText,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Upload,
  Plus,
} from "lucide-react";
import { Creditor, Claim, ClaimPriority, ClaimStatus } from "@/types/creditor";

interface CreditorWithClaim extends Creditor {
  claim?: Claim;
}

interface CreditorTableProps {
  creditors: CreditorWithClaim[];
  onViewCreditor: (creditor: CreditorWithClaim) => void;
  onSendNotice: (creditor: CreditorWithClaim) => void;
  onViewDocuments: (creditor: CreditorWithClaim) => void;
}

export function CreditorTable({
  creditors,
  onViewCreditor,
  onSendNotice,
  onViewDocuments,
}: CreditorTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<ClaimPriority | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | "all">("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getPriorityIcon = (priority: ClaimPriority) => {
    switch (priority) {
      case 'secured':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'preferred':
        return <Star className="h-4 w-4 text-amber-500" />;
      case 'unsecured':
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: ClaimPriority) => {
    const variants: Record<ClaimPriority, string> = {
      secured: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      preferred: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      unsecured: 'bg-muted text-muted-foreground border-border',
    };
    return (
      <Badge variant="outline" className={variants[priority]}>
        {getPriorityIcon(priority)}
        <span className="ml-1 capitalize">{priority}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: ClaimStatus) => {
    const config: Record<ClaimStatus, { icon: React.ReactNode; className: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      accepted: { icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
      rejected: { icon: <XCircle className="h-3 w-3" />, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
      disputed: { icon: <AlertTriangle className="h-3 w-3" />, className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
      withdrawn: { icon: <XCircle className="h-3 w-3" />, className: 'bg-muted text-muted-foreground border-border' },
    };
    const { icon, className } = config[status];
    return (
      <Badge variant="outline" className={className}>
        {icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  const filteredCreditors = creditors.filter((creditor) => {
    const matchesSearch = creditor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creditor.account_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || creditor.claim?.priority === priorityFilter;
    const matchesStatus = statusFilter === "all" || creditor.claim?.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creditors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setPriorityFilter("all")}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("secured")}>
                <Shield className="h-4 w-4 mr-2 text-blue-500" /> Secured
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("preferred")}>
                <Star className="h-4 w-4 mr-2 text-amber-500" /> Preferred
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPriorityFilter("unsecured")}>
                <DollarSign className="h-4 w-4 mr-2" /> Unsecured
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Creditor
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Creditor Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Claim Amount</TableHead>
              <TableHead className="font-semibold">Priority</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Docs</TableHead>
              <TableHead className="font-semibold">AI Flags</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCreditors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No creditors found
                </TableCell>
              </TableRow>
            ) : (
              filteredCreditors.map((creditor) => (
                <TableRow
                  key={creditor.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewCreditor(creditor)}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{creditor.name}</p>
                      <p className="text-xs text-muted-foreground">{creditor.account_number || 'No account #'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-sm">{creditor.creditor_type}</span>
                  </TableCell>
                  <TableCell className="font-mono">
                    {creditor.claim ? formatCurrency(creditor.claim.claim_amount) : '-'}
                  </TableCell>
                  <TableCell>
                    {creditor.claim ? getPriorityBadge(creditor.claim.priority) : '-'}
                  </TableCell>
                  <TableCell>
                    {creditor.claim ? getStatusBadge(creditor.claim.status) : '-'}
                  </TableCell>
                  <TableCell>
                    {creditor.claim?.supporting_documents.length || 0} files
                  </TableCell>
                  <TableCell>
                    {creditor.claim?.ai_flags.filter(f => !f.resolved).length ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {creditor.claim.ai_flags.filter(f => !f.resolved).length}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Clear
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
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewCreditor(creditor); }}>
                          <Eye className="h-4 w-4 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDocuments(creditor); }}>
                          <FileText className="h-4 w-4 mr-2" /> View Documents
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSendNotice(creditor); }}>
                          <Mail className="h-4 w-4 mr-2" /> Send Notice
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
