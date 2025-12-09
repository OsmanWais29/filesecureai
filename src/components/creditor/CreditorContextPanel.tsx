import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Mail,
  Phone,
  FileText,
  Send,
  Plus,
  Shield,
  Star,
  DollarSign,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { Creditor, Claim } from "@/types/creditor";

interface CreditorContextPanelProps {
  creditor: Creditor & { claim?: Claim };
  onClose: () => void;
  onViewProfile: () => void;
  onSendNotice: () => void;
  onAddClaim: () => void;
  onRequestDocs: () => void;
}

export function CreditorContextPanel({
  creditor,
  onClose,
  onViewProfile,
  onSendNotice,
  onAddClaim,
  onRequestDocs,
}: CreditorContextPanelProps) {
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'secured':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'preferred':
        return <Star className="h-4 w-4 text-amber-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Creditor Snapshot</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="pt-0 space-y-4">
          {/* Creditor Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{creditor.name}</p>
                <Badge variant="outline" className="text-xs capitalize mt-0.5">
                  {creditor.creditor_type}
                </Badge>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {creditor.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{creditor.email}</span>
                </div>
              )}
              {creditor.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{creditor.phone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Claim Summary */}
          {creditor.claim ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Claim Details</span>
                <Badge 
                  variant="outline" 
                  className={
                    creditor.claim.status === 'accepted' 
                      ? 'bg-green-500/10 text-green-600 border-green-500/20'
                      : creditor.claim.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                      : 'bg-red-500/10 text-red-600 border-red-500/20'
                  }
                >
                  {creditor.claim.status === 'accepted' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {creditor.claim.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  <span className="capitalize">{creditor.claim.status}</span>
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Claim</span>
                  <span className="font-mono font-medium">{formatCurrency(creditor.claim.claim_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(creditor.claim.priority)}
                    <span className="capitalize">{creditor.claim.priority}</span>
                  </div>
                  <span className="font-mono text-xs">
                    {creditor.claim.priority === 'secured' && formatCurrency(creditor.claim.secured_amount)}
                    {creditor.claim.priority === 'preferred' && formatCurrency(creditor.claim.preferred_amount)}
                    {creditor.claim.priority === 'unsecured' && formatCurrency(creditor.claim.unsecured_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Filed</span>
                  <span>{formatDate(creditor.claim.filing_date)}</span>
                </div>
              </div>

              {/* AI Flags */}
              {creditor.claim.ai_flags.filter(f => !f.resolved).length > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>AI Flags</span>
                  </div>
                  <ul className="space-y-1">
                    {creditor.claim.ai_flags.filter(f => !f.resolved).slice(0, 3).map((flag) => (
                      <li key={flag.id} className="text-xs text-muted-foreground">
                        • {flag.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Collateral */}
              {creditor.claim.collateral_description && (
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-1">
                    <Shield className="h-4 w-4" />
                    <span>Collateral</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {creditor.claim.collateral_description}
                  </p>
                  {creditor.claim.collateral_value && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Value: {formatCurrency(creditor.claim.collateral_value)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No claim filed</p>
            </div>
          )}

          <Separator />

          {/* Quick Actions */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={onViewProfile} className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                View Profile
              </Button>
              <Button variant="outline" size="sm" onClick={onSendNotice} className="text-xs">
                <Send className="h-3 w-3 mr-1" />
                Send Notice
              </Button>
              <Button variant="outline" size="sm" onClick={onRequestDocs} className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Request Docs
              </Button>
              {!creditor.claim && (
                <Button variant="outline" size="sm" onClick={onAddClaim} className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Claim
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
