import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Star,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Edit,
  History,
  MessageSquare,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";
import { Creditor, Claim, CreditorNotice, AIFlag } from "@/types/creditor";

interface CreditorProfileProps {
  creditor: Creditor;
  claim?: Claim;
  notices: CreditorNotice[];
  onBack: () => void;
  onSendNotice: () => void;
  onEditCreditor: () => void;
}

export function CreditorProfile({
  creditor,
  claim,
  notices,
  onBack,
  onSendNotice,
  onEditCreditor,
}: CreditorProfileProps) {
  const [activeTab, setActiveTab] = useState("info");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const getFlagSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{creditor.name}</h1>
            <p className="text-muted-foreground capitalize">{creditor.creditor_type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEditCreditor}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button onClick={onSendNotice}>
            <Send className="h-4 w-4 mr-2" />
            Send Notice
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
          <TabsTrigger value="correspondence">Correspondence</TabsTrigger>
          <TabsTrigger value="ai-flags">AI Flags</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {creditor.address}<br />
                      {creditor.city}, {creditor.province} {creditor.postal_code}<br />
                      {creditor.country}
                    </p>
                  </div>
                </div>
                {creditor.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{creditor.email}</p>
                    </div>
                  </div>
                )}
                {creditor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{creditor.phone}</p>
                    </div>
                  </div>
                )}
                {creditor.contact_person && (
                  <div>
                    <p className="text-sm font-medium">Contact Person</p>
                    <p className="text-sm text-muted-foreground">{creditor.contact_person}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Account Number</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {creditor.account_number || 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Creditor Type</p>
                  <Badge variant="outline" className="capitalize mt-1">
                    {creditor.creditor_type}
                  </Badge>
                </div>
                {claim && (
                  <div>
                    <p className="text-sm font-medium">Claim Priority</p>
                    <Badge variant="outline" className="mt-1">
                      {getPriorityIcon(claim.priority)}
                      <span className="ml-1 capitalize">{claim.priority}</span>
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-4">
          {claim ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Proof of Claim</CardTitle>
                    <CardDescription>Filed on {formatDate(claim.filing_date)}</CardDescription>
                  </div>
                  <Badge variant={claim.osb_compliant ? "default" : "destructive"}>
                    {claim.osb_compliant ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        OSB Compliant
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review Required
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Total Claim</p>
                    <p className="text-xl font-bold font-mono">{formatCurrency(claim.claim_amount)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10">
                    <p className="text-xs text-blue-600">Secured</p>
                    <p className="text-xl font-bold font-mono text-blue-600">
                      {formatCurrency(claim.secured_amount)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10">
                    <p className="text-xs text-amber-600">Preferred</p>
                    <p className="text-xl font-bold font-mono text-amber-600">
                      {formatCurrency(claim.preferred_amount)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Unsecured</p>
                    <p className="text-xl font-bold font-mono">{formatCurrency(claim.unsecured_amount)}</p>
                  </div>
                </div>

                {claim.collateral_description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Collateral</h4>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm">{claim.collateral_description}</p>
                      {claim.collateral_value && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Estimated Value: {formatCurrency(claim.collateral_value)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Supporting Documents</h4>
                  <div className="space-y-2">
                    {claim.supporting_documents.length > 0 ? (
                      claim.supporting_documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No documents uploaded</p>
                    )}
                  </div>
                </div>

                {claim.is_late_filing && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">
                      This claim was filed after the deadline
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No claim filed yet</p>
                <Button className="mt-4">Add Proof of Claim</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Correspondence Tab */}
        <TabsContent value="correspondence" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Correspondence Log
                </CardTitle>
                <Button size="sm" onClick={onSendNotice}>
                  <Send className="h-4 w-4 mr-2" />
                  New Notice
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {notices.length > 0 ? (
                  <div className="space-y-4">
                    {notices.map((notice) => (
                      <div
                        key={notice.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{notice.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sent via {notice.sent_via} on {formatDate(notice.sent_at)}
                            </p>
                          </div>
                          <Badge
                            variant={notice.delivery_status === 'read' ? 'default' : 'outline'}
                            className="capitalize"
                          >
                            {notice.delivery_status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {notice.content}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No correspondence yet</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Flags Tab */}
        <TabsContent value="ai-flags" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                AI Analysis & Flags
              </CardTitle>
              <CardDescription>
                SAFA-powered compliance checks and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {claim?.ai_flags && claim.ai_flags.length > 0 ? (
                <div className="space-y-4">
                  {claim.ai_flags.map((flag) => (
                    <div
                      key={flag.id}
                      className={`p-4 rounded-lg border ${
                        flag.resolved ? 'bg-muted/30 border-border' : 'bg-card border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <AlertTriangle
                            className={`h-5 w-5 mt-0.5 ${
                              flag.resolved ? 'text-muted-foreground' : 
                              flag.severity === 'critical' ? 'text-red-500' :
                              flag.severity === 'high' ? 'text-orange-500' :
                              'text-yellow-500'
                            }`}
                          />
                          <div>
                            <p className={`font-medium ${flag.resolved ? 'line-through text-muted-foreground' : ''}`}>
                              {flag.message}
                            </p>
                            {flag.suggestion && (
                              <p className="text-sm text-muted-foreground mt-1">
                                💡 {flag.suggestion}
                              </p>
                            )}
                            {flag.bia_reference && (
                              <Badge variant="outline" className="mt-2 text-xs">
                                {flag.bia_reference}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className={getFlagSeverityColor(flag.severity)}>
                          {flag.severity}
                        </Badge>
                      </div>
                      {flag.resolved && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Resolved on {formatDate(flag.resolved_at!)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No issues detected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All AI compliance checks passed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
