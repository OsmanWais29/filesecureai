import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Upload,
  Plus,
  Sparkles,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EstateSwitcher } from "@/components/layout/EstateSwitcher";
import { ModuleTabs, ModuleTab } from "@/components/layout/ModuleTabs";
import { CreditorDashboardCards } from "@/components/creditor/CreditorDashboardCards";
import { CreditorTable } from "@/components/creditor/CreditorTable";
import { CreditorContextPanel } from "@/components/creditor/CreditorContextPanel";
import { CreditorProfile } from "@/components/creditor/CreditorProfile";
import { ClaimsTable } from "@/components/creditor/ClaimsTable";
import { MeetingOfCreditors } from "@/components/creditor/MeetingOfCreditors";
import { DistributionEngine } from "@/components/creditor/DistributionEngine";
import { OSBFormsTab } from "@/components/creditor/OSBFormsTab";
import { AuditTab } from "@/components/creditor/AuditTab";
import { ProofOfClaimForm } from "@/components/creditor/ProofOfClaimForm";
import { 
  Creditor, 
  Claim, 
  CreditorStats, 
} from "@/types/creditor";
import { toast } from "sonner";
import { useCreditors, useCreditorStats, useCreateCreditor, useCreateClaim, CreditorWithClaim } from "@/hooks/useCreditors";
import { useDistributions, useCreateDistribution, useUpdateDistribution } from "@/hooks/useDistributions";
import { useCreditorMeetings, useCreateCreditorMeeting, useUpdateCreditorMeeting } from "@/hooks/useCreditorMeetings";

// Default stats when no data
const defaultStats: CreditorStats = {
  total_creditors: 0,
  claims_filed: 0,
  claims_accepted: 0,
  claims_rejected: 0,
  claims_pending: 0,
  total_secured: 0,
  total_preferred: 0,
  total_unsecured: 0,
  total_claim_amount: 0,
  critical_flags: 0,
  missing_docs_count: 0,
  late_filings: 0,
};

// Mock audit events (would come from a hook in production)
const mockAuditEvents = [
  { id: 'a1', estate_id: 'e1', user_id: 'u1', actor: 'user' as const, action_type: 'create_claim', payload_hash: 'abc123def456', description: 'Created claim for TD Bank', created_at: '2024-01-20T10:00:00' },
  { id: 'a2', estate_id: 'e1', user_id: 'u1', actor: 'system' as const, action_type: 'validate_claim', payload_hash: 'def456ghi789', previous_event_id: 'a1', description: 'AI validation completed for TD Bank claim', created_at: '2024-01-20T10:01:00' },
  { id: 'a3', estate_id: 'e1', user_id: 'u1', actor: 'user' as const, action_type: 'approve_claim', payload_hash: 'ghi789jkl012', previous_event_id: 'a2', description: 'Claim approved for TD Bank', created_at: '2024-01-20T10:05:00' },
];

type ViewMode = 'list' | 'profile' | 'claim-form';

export default function CreditorManagementPage() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('creditors');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCreditor, setSelectedCreditor] = useState<CreditorWithClaim | null>(null);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [currentEstateId, setCurrentEstateId] = useState<string | undefined>();

  // Hooks
  const { data: creditors = [], isLoading: creditorsLoading } = useCreditors(currentEstateId);
  const { data: stats = defaultStats, isLoading: statsLoading } = useCreditorStats(currentEstateId);
  const { data: distributions = [] } = useDistributions(currentEstateId);
  const { data: meetings = [] } = useCreditorMeetings(currentEstateId);
  
  const createCreditor = useCreateCreditor();
  const createClaim = useCreateClaim();
  const createDistribution = useCreateDistribution();
  const updateDistribution = useUpdateDistribution();
  const createMeeting = useCreateCreditorMeeting();
  const updateMeeting = useUpdateCreditorMeeting();

  const handleViewCreditor = (creditor: CreditorWithClaim) => {
    setSelectedCreditor(creditor);
    setShowContextPanel(true);
  };

  const handleViewProfile = () => {
    if (selectedCreditor) {
      setViewMode('profile');
      setShowContextPanel(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCreditor(null);
    setShowContextPanel(false);
  };

  const handleClaimSubmit = async (data: any) => {
    if (!selectedCreditor) return;
    
    try {
      await createClaim.mutateAsync({
        creditor_id: selectedCreditor.id,
        estate_id: currentEstateId,
        claim_amount: data.claim_amount,
        secured_amount: data.secured_amount,
        preferred_amount: data.preferred_amount,
        unsecured_amount: data.unsecured_amount,
        priority: data.priority,
        collateral_description: data.collateral_description,
        collateral_value: data.collateral_value,
        is_late_filing: data.is_late_filing,
        supporting_documents: [],
      });
      setViewMode('profile');
    } catch (error) {
      console.error('Failed to submit claim:', error);
    }
  };

  const handleScheduleMeeting = async () => {
    try {
      await createMeeting.mutateAsync({
        estate_id: currentEstateId,
        meeting_date: new Date().toISOString().split('T')[0],
        meeting_time: '10:00',
        meeting_type: 'first',
        status: 'scheduled',
        location: 'Virtual Meeting - Zoom',
      });
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    }
  };

  const handleCalculateDistribution = async () => {
    try {
      await createDistribution.mutateAsync({
        estate_id: currentEstateId,
        status: 'draft',
        total_receipts: 0,
        total_disbursements: 0,
      });
    } catch (error) {
      console.error('Failed to create distribution:', error);
    }
  };

  const currentDistribution = distributions[0];
  const currentMeeting = meetings[0];

  const isLoading = creditorsLoading || statsLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <CreditorDashboardCards 
              stats={stats} 
              onFilterClick={(filter) => toast.info(`Filter: ${filter}`)}
            />
            
            {/* Claims Distribution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Claims by Priority */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Claims by Priority</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Secured Claims</span>
                      <span className="font-medium">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', notation: 'compact' }).format(stats.total_secured)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all" 
                        style={{ width: `${stats.total_claim_amount > 0 ? (stats.total_secured / stats.total_claim_amount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Preferred Claims</span>
                      <span className="font-medium">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', notation: 'compact' }).format(stats.total_preferred)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all" 
                        style={{ width: `${stats.total_claim_amount > 0 ? (stats.total_preferred / stats.total_claim_amount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Unsecured Claims</span>
                      <span className="font-medium">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', notation: 'compact' }).format(stats.total_unsecured)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-muted-foreground rounded-full transition-all" 
                        style={{ width: `${stats.total_claim_amount > 0 ? (stats.total_unsecured / stats.total_claim_amount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Claims</span>
                    <span className="font-bold text-primary">{new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(stats.total_claim_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Claims Status Breakdown */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Claims Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-3xl font-bold text-green-500">{stats.claims_accepted}</div>
                    <div className="text-sm text-muted-foreground">Accepted</div>
                  </div>
                  <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="text-3xl font-bold text-amber-500">{stats.claims_pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="text-3xl font-bold text-destructive">{stats.claims_rejected}</div>
                    <div className="text-sm text-muted-foreground">Rejected</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg border border-border">
                    <div className="text-3xl font-bold">{stats.claims_filed}</div>
                    <div className="text-sm text-muted-foreground">Total Filed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Required Section */}
            {(stats.critical_flags > 0 || stats.missing_docs_count > 0 || stats.late_filings > 0) && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-destructive mb-4">Action Required</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {stats.critical_flags > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <span className="text-destructive font-bold">{stats.critical_flags}</span>
                      </div>
                      <div>
                        <div className="font-medium">Critical Flags</div>
                        <div className="text-sm text-muted-foreground">Require immediate attention</div>
                      </div>
                    </div>
                  )}
                  {stats.missing_docs_count > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-amber-500 font-bold">{stats.missing_docs_count}</span>
                      </div>
                      <div>
                        <div className="font-medium">Missing Documents</div>
                        <div className="text-sm text-muted-foreground">Documents needed</div>
                      </div>
                    </div>
                  )}
                  {stats.late_filings > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <span className="text-amber-500 font-bold">{stats.late_filings}</span>
                      </div>
                      <div>
                        <div className="font-medium">Late Filings</div>
                        <div className="text-sm text-muted-foreground">Past deadline</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.total_creditors}</div>
                <div className="text-sm text-muted-foreground">Total Creditors</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{distributions.length}</div>
                <div className="text-sm text-muted-foreground">Distributions</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold">{meetings.length}</div>
                <div className="text-sm text-muted-foreground">Meetings Scheduled</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {stats.claims_filed > 0 ? Math.round((stats.claims_accepted / stats.claims_filed) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Acceptance Rate</div>
              </div>
            </div>
          </div>
        );
      case 'creditors':
        return (
          <div className="p-6 space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Creditors
              </Button>
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Scan Documents
              </Button>
              <Button 
                size="sm"
                onClick={() => {
                  createCreditor.mutate({
                    name: 'New Creditor',
                    creditor_type: 'other',
                    estate_id: currentEstateId,
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Creditor
              </Button>
            </div>

            {/* Dashboard Cards */}
            <CreditorDashboardCards 
              stats={stats} 
              onFilterClick={(filter) => toast.info(`Filter: ${filter}`)}
            />

            {/* Creditor Content */}
            {viewMode === 'list' && (
              <div className="flex gap-6">
                <div className={showContextPanel ? 'flex-1' : 'w-full'}>
                  {creditors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium">No Creditors Yet</h3>
                      <p className="mb-4">Add your first creditor to get started</p>
                      <Button
                        onClick={() => {
                          createCreditor.mutate({
                            name: 'New Creditor',
                            creditor_type: 'other',
                            estate_id: currentEstateId,
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Creditor
                      </Button>
                    </div>
                  ) : (
                    <CreditorTable
                      creditors={creditors}
                      onViewCreditor={handleViewCreditor}
                      onSendNotice={(c) => toast.info(`Sending notice to ${c.name}`)}
                      onViewDocuments={(c) => toast.info(`Viewing docs for ${c.name}`)}
                    />
                  )}
                </div>
                {showContextPanel && selectedCreditor && (
                  <div className="w-80 flex-shrink-0">
                    <CreditorContextPanel
                      creditor={selectedCreditor}
                      onClose={() => setShowContextPanel(false)}
                      onViewProfile={handleViewProfile}
                      onSendNotice={() => toast.info('Sending notice')}
                      onAddClaim={() => setViewMode('claim-form')}
                      onRequestDocs={() => toast.info('Requesting docs')}
                    />
                  </div>
                )}
              </div>
            )}
            {viewMode === 'profile' && selectedCreditor && (
              <CreditorProfile
                creditor={selectedCreditor}
                claim={selectedCreditor.claim}
                notices={[]}
                onBack={handleBackToList}
                onSendNotice={() => toast.info('Sending notice')}
                onEditCreditor={() => toast.info('Edit creditor')}
              />
            )}
            {viewMode === 'claim-form' && selectedCreditor && (
              <ProofOfClaimForm
                creditorId={selectedCreditor.id}
                creditorName={selectedCreditor.name}
                onSubmit={handleClaimSubmit}
                onCancel={() => setViewMode('profile')}
              />
            )}
          </div>
        );
      case 'claims':
        return (
          <div className="p-6">
            <ClaimsTable
              claims={creditors.filter(c => c.claim).map(c => ({ ...c.claim!, creditor_name: c.name }))}
              onViewClaim={() => toast.info('View claim')}
              onValidateClaim={() => toast.info('Validating with AI')}
              onSplitClaim={() => toast.info('Split claim')}
              onViewEvidence={() => toast.info('View evidence')}
            />
          </div>
        );
      case 'meetings':
        return (
          <div className="p-6">
            <MeetingOfCreditors
              meeting={currentMeeting}
              onScheduleMeeting={handleScheduleMeeting}
              onStartMeeting={() => {
                if (currentMeeting) {
                  updateMeeting.mutate({ id: currentMeeting.id, status: 'in_progress' });
                }
              }}
              onRecordVote={(id, vote) => toast.info(`Vote: ${vote}`)}
              onEndMeeting={() => {
                if (currentMeeting) {
                  updateMeeting.mutate({ id: currentMeeting.id, status: 'completed' });
                }
              }}
              onGenerateMinutes={() => toast.info('Generate minutes')}
            />
          </div>
        );
      case 'distribution':
        return (
          <div className="p-6">
            <DistributionEngine
              distribution={currentDistribution}
              onCalculateDistribution={handleCalculateDistribution}
              onApproveDistribution={() => {
                if (currentDistribution) {
                  updateDistribution.mutate({ id: currentDistribution.id, status: 'approved' });
                }
              }}
              onGenerateForm12={() => toast.info('Generate Form 12')}
              onExportReport={() => toast.info('Export report')}
            />
          </div>
        );
      case 'osb-forms':
        return (
          <div className="p-6">
            <OSBFormsTab
              estateId={currentEstateId || ''}
              forms={[]}
              onGenerateForm={(type) => toast.info(`Generating Form ${type}`)}
              onExportXML={() => toast.info('Export XML')}
              onExportPDF={() => toast.info('Export PDF')}
              onSubmitForm={() => toast.success('Form submitted')}
            />
          </div>
        );
      case 'safa':
        return (
          <div className="p-6 text-center py-12 text-muted-foreground">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">SAFA AI Assistant</h3>
            <p>AI-powered analysis for this estate</p>
          </div>
        );
      case 'audit':
        return (
          <div className="p-6">
            <AuditTab
              estateId={currentEstateId || ''}
              events={mockAuditEvents}
              onExportAuditLog={() => toast.info('Exporting audit log')}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Estate Switcher Bar - Always visible at top */}
        <EstateSwitcher />
        
        {/* Module Tabs - Client context navigation */}
        <ModuleTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-muted/30">
          {renderContent()}
        </div>
      </div>
    </MainLayout>
  );
}
