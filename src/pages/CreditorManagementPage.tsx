import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  Upload,
  Plus,
  Sparkles,
  Settings,
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
import { Estate } from "@/types/estate";
import { 
  Creditor, 
  Claim, 
  CreditorStats, 
  CreditorNotice,
  MeetingOfCreditors as MeetingType,
  Distribution,
} from "@/types/creditor";
import { toast } from "sonner";

// Mock estate data
const mockEstate: Estate = {
  id: 'e1',
  client_id: 'c1',
  debtor_name: 'John Smith',
  file_number: '31-2847593',
  estate_type: 'consumer_proposal',
  status: 'open',
  trustee_id: 't1',
  trustee_name: 'Jane Wilson, LIT',
  assigned_date: '2024-01-15',
  trust_balance: 45750,
  total_creditors: 24,
  total_claims: 450000,
  next_deadline: '2024-03-15',
  next_deadline_description: 'First Meeting of Creditors',
  created_at: '2024-01-15',
  updated_at: '2024-02-01',
};

// Mock stats
const mockStats: CreditorStats = {
  total_creditors: 24,
  claims_filed: 21,
  claims_accepted: 18,
  claims_rejected: 2,
  claims_pending: 1,
  total_secured: 125000,
  total_preferred: 45000,
  total_unsecured: 280000,
  total_claim_amount: 450000,
  critical_flags: 3,
  missing_docs_count: 5,
  late_filings: 2,
};

// Mock creditors (keeping existing mock data structure)
const mockCreditors: (Creditor & { claim?: Claim })[] = [
  {
    id: '1',
    name: 'Toronto-Dominion Bank',
    address: '66 Wellington Street West',
    city: 'Toronto',
    province: 'ON',
    postal_code: 'M5K 1A2',
    country: 'Canada',
    email: 'collections@td.com',
    phone: '1-800-387-2828',
    creditor_type: 'bank',
    account_number: '****4521',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    claim: {
      id: 'c1',
      creditor_id: '1',
      estate_id: 'e1',
      claim_amount: 45000,
      secured_amount: 35000,
      preferred_amount: 0,
      unsecured_amount: 10000,
      priority: 'secured',
      status: 'accepted',
      filing_date: '2024-01-20',
      is_late_filing: false,
      collateral_description: '2019 Honda Civic - VIN: 1HGBH41JXMN109186',
      collateral_value: 18000,
      supporting_documents: ['loan_agreement.pdf', 'security_agreement.pdf'],
      osb_compliant: true,
      ai_flags: [],
      created_at: '2024-01-20',
      updated_at: '2024-01-20',
    },
  },
  {
    id: '2',
    name: 'Canada Revenue Agency',
    address: '875 Heron Road',
    city: 'Ottawa',
    province: 'ON',
    postal_code: 'K1A 1A2',
    country: 'Canada',
    email: 'collections@cra.gc.ca',
    phone: '1-800-959-8281',
    creditor_type: 'cra',
    account_number: 'SIN ***-***-123',
    created_at: '2024-01-10',
    updated_at: '2024-01-10',
    claim: {
      id: 'c2',
      creditor_id: '2',
      estate_id: 'e1',
      claim_amount: 28000,
      secured_amount: 0,
      preferred_amount: 12000,
      unsecured_amount: 16000,
      priority: 'preferred',
      status: 'accepted',
      filing_date: '2024-01-18',
      is_late_filing: false,
      supporting_documents: ['noa_2023.pdf', 'statement_account.pdf'],
      osb_compliant: true,
      ai_flags: [
        {
          id: 'f1',
          type: 'amount_discrepancy',
          severity: 'medium',
          message: 'Source deduction amount may require verification',
          suggestion: 'Request updated statement from CRA',
          bia_reference: 'BIA s.136(1)(d.1)',
          resolved: false,
        },
      ],
      created_at: '2024-01-18',
      updated_at: '2024-01-18',
    },
  },
  {
    id: '3',
    name: 'Capital One',
    address: '5650 Yonge Street',
    city: 'Toronto',
    province: 'ON',
    postal_code: 'M2M 4G3',
    country: 'Canada',
    email: 'collections@capitalone.ca',
    phone: '1-800-227-4825',
    creditor_type: 'bank',
    account_number: '****8876',
    created_at: '2024-01-12',
    updated_at: '2024-01-12',
    claim: {
      id: 'c3',
      creditor_id: '3',
      estate_id: 'e1',
      claim_amount: 15500,
      secured_amount: 0,
      preferred_amount: 0,
      unsecured_amount: 15500,
      priority: 'unsecured',
      status: 'pending',
      filing_date: '2024-02-01',
      is_late_filing: true,
      supporting_documents: ['credit_card_statement.pdf'],
      osb_compliant: false,
      ai_flags: [
        {
          id: 'f2',
          type: 'missing_docs',
          severity: 'high',
          message: 'Missing signed proof of claim form',
          suggestion: 'Request Form 31 from creditor',
          bia_reference: 'BIA s.124',
          resolved: false,
        },
      ],
      created_at: '2024-02-01',
      updated_at: '2024-02-01',
    },
  },
];

const mockNotices: CreditorNotice[] = [
  {
    id: 'n1',
    creditor_id: '1',
    notice_type: 'filing_acknowledgment',
    subject: 'Proof of Claim Received',
    content: 'Your proof of claim has been received and is under review.',
    sent_at: '2024-01-21',
    sent_via: 'email',
    delivery_status: 'read',
    read_at: '2024-01-21',
  },
];

const mockMeeting: MeetingType = {
  id: 'm1',
  estate_id: 'e1',
  meeting_date: '2024-02-15',
  meeting_time: '10:00',
  location: 'Virtual Meeting - Zoom',
  meeting_type: 'first',
  status: 'completed',
  quorum_met: true,
  total_eligible_voters: 24,
  total_votes_cast: 18,
  total_claim_amount_voting: 385000,
  votes: [
    { creditor_id: '1', creditor_name: 'TD Bank', claim_amount: 45000, vote: 'for', recorded_at: '2024-02-15T10:15:00' },
    { creditor_id: '2', creditor_name: 'CRA', claim_amount: 28000, vote: 'for', recorded_at: '2024-02-15T10:18:00' },
    { creditor_id: '3', creditor_name: 'Capital One', claim_amount: 15500, vote: 'against', recorded_at: '2024-02-15T10:22:00' },
  ],
  created_at: '2024-01-25',
};

const mockDistribution: Distribution = {
  id: 'd1',
  estate_id: 'e1',
  distribution_date: '2024-03-01',
  total_receipts: 125000,
  total_disbursements: 18500,
  trustee_fees: 12500,
  levy_amount: 3750,
  sales_tax: 2250,
  secured_distribution: 35000,
  preferred_distribution: 12000,
  unsecured_distribution: 59500,
  dividend_rate: 21.25,
  status: 'draft',
  distributions: [
    { creditor_id: '1', creditor_name: 'TD Bank', claim_amount: 45000, priority: 'secured', distribution_amount: 35000, dividend_percentage: 77.78 },
    { creditor_id: '2', creditor_name: 'CRA', claim_amount: 28000, priority: 'preferred', distribution_amount: 12000, dividend_percentage: 42.86 },
    { creditor_id: '3', creditor_name: 'Capital One', claim_amount: 15500, priority: 'unsecured', distribution_amount: 3294, dividend_percentage: 21.25 },
  ],
};

const mockAuditEvents = [
  { id: 'a1', estate_id: 'e1', user_id: 'u1', actor: 'user' as const, action_type: 'create_claim', payload_hash: 'abc123def456', description: 'Created claim for TD Bank', created_at: '2024-01-20T10:00:00' },
  { id: 'a2', estate_id: 'e1', user_id: 'u1', actor: 'system' as const, action_type: 'validate_claim', payload_hash: 'def456ghi789', previous_event_id: 'a1', description: 'AI validation completed for TD Bank claim', created_at: '2024-01-20T10:01:00' },
  { id: 'a3', estate_id: 'e1', user_id: 'u1', actor: 'user' as const, action_type: 'approve_claim', payload_hash: 'ghi789jkl012', previous_event_id: 'a2', description: 'Claim approved for TD Bank', created_at: '2024-01-20T10:05:00' },
];

type ViewMode = 'list' | 'profile' | 'claim-form';

export default function CreditorManagementPage() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('creditors');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCreditor, setSelectedCreditor] = useState<Creditor & { claim?: Claim } | null>(null);
  const [showContextPanel, setShowContextPanel] = useState(false);

  const handleViewCreditor = (creditor: Creditor & { claim?: Claim }) => {
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

  const handleClaimSubmit = () => {
    toast.success('Proof of Claim submitted successfully');
    setViewMode('profile');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="p-6">
            <CreditorDashboardCards 
              stats={mockStats} 
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
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Creditor
              </Button>
            </div>

            {/* Dashboard Cards */}
            <CreditorDashboardCards 
              stats={mockStats} 
              onFilterClick={(filter) => toast.info(`Filter: ${filter}`)}
            />

            {/* Creditor Content */}
            {viewMode === 'list' && (
              <div className="flex gap-6">
                <div className={showContextPanel ? 'flex-1' : 'w-full'}>
                  <CreditorTable
                    creditors={mockCreditors}
                    onViewCreditor={handleViewCreditor}
                    onSendNotice={(c) => toast.info(`Sending notice to ${c.name}`)}
                    onViewDocuments={(c) => toast.info(`Viewing docs for ${c.name}`)}
                  />
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
                notices={mockNotices.filter(n => n.creditor_id === selectedCreditor.id)}
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
              claims={mockCreditors.filter(c => c.claim).map(c => ({ ...c.claim!, creditor_name: c.name }))}
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
              meeting={mockMeeting}
              onScheduleMeeting={() => toast.info('Schedule meeting')}
              onStartMeeting={() => toast.info('Start meeting')}
              onRecordVote={(id, vote) => toast.info(`Vote: ${vote}`)}
              onEndMeeting={() => toast.info('End meeting')}
              onGenerateMinutes={() => toast.info('Generate minutes')}
            />
          </div>
        );
      case 'distribution':
        return (
          <div className="p-6">
            <DistributionEngine
              distribution={mockDistribution}
              onCalculateDistribution={() => toast.info('Calculate distribution')}
              onApproveDistribution={() => toast.success('Distribution approved')}
              onGenerateForm12={() => toast.info('Generate Form 12')}
              onExportReport={() => toast.info('Export report')}
            />
          </div>
        );
      case 'osb-forms':
        return (
          <div className="p-6">
            <OSBFormsTab
              estateId={mockEstate.id}
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
              estateId={mockEstate.id}
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
