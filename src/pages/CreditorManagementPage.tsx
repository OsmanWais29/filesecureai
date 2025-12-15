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
          <div className="p-6">
            <CreditorDashboardCards 
              stats={stats} 
              onFilterClick={(filter) => toast.info(`Filter: ${filter}`)}
            />
            <div className="mt-6 text-center py-12 text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">Estate Overview</h3>
              <p>Summary dashboard coming soon</p>
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
