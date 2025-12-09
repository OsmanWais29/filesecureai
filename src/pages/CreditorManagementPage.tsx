import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  Gavel,
  Calculator,
  Upload,
  Plus,
  Settings,
  History,
  Sparkles,
} from "lucide-react";
import { CreditorStatsCards } from "@/components/creditor/CreditorStatsCards";
import { CreditorTable } from "@/components/creditor/CreditorTable";
import { CreditorProfile } from "@/components/creditor/CreditorProfile";
import { MeetingOfCreditors } from "@/components/creditor/MeetingOfCreditors";
import { DistributionEngine } from "@/components/creditor/DistributionEngine";
import { ProofOfClaimForm } from "@/components/creditor/ProofOfClaimForm";
import { 
  Creditor, 
  Claim, 
  CreditorStats, 
  CreditorNotice,
  MeetingOfCreditors as MeetingType,
  Distribution,
} from "@/types/creditor";
import { toast } from "sonner";

// Mock data for demonstration
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
  {
    id: 'n2',
    creditor_id: '1',
    notice_type: 'meeting',
    subject: 'Notice of First Meeting of Creditors',
    content: 'You are hereby notified of the first meeting of creditors...',
    sent_at: '2024-01-25',
    sent_via: 'email',
    delivery_status: 'delivered',
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

type ViewMode = 'list' | 'profile' | 'claim-form';

export default function CreditorManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCreditor, setSelectedCreditor] = useState<Creditor & { claim?: Claim } | null>(null);

  const handleViewCreditor = (creditor: Creditor & { claim?: Claim }) => {
    setSelectedCreditor(creditor);
    setViewMode('profile');
  };

  const handleSendNotice = (creditor: Creditor & { claim?: Claim }) => {
    toast.info(`Preparing notice for ${creditor.name}`);
  };

  const handleViewDocuments = (creditor: Creditor & { claim?: Claim }) => {
    toast.info(`Opening documents for ${creditor.name}`);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedCreditor(null);
  };

  const handleAddClaim = () => {
    if (selectedCreditor) {
      setViewMode('claim-form');
    }
  };

  const handleClaimSubmit = (data: any) => {
    toast.success('Proof of Claim submitted successfully');
    setViewMode('profile');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Creditor Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage creditors, claims, meetings, and distributions
            </p>
          </div>
          <div className="flex gap-2">
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
        </div>

        {/* Stats Cards */}
        <CreditorStatsCards stats={mockStats} />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Creditors</span>
            </TabsTrigger>
            <TabsTrigger value="claims" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Claims</span>
            </TabsTrigger>
            <TabsTrigger value="meeting" className="flex items-center gap-2">
              <Gavel className="h-4 w-4" />
              <span className="hidden sm:inline">Meeting</span>
            </TabsTrigger>
            <TabsTrigger value="distribution" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              <span className="hidden sm:inline">Distribution</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Creditors Tab */}
          <TabsContent value="overview" className="mt-6">
            {viewMode === 'list' && (
              <CreditorTable
                creditors={mockCreditors}
                onViewCreditor={handleViewCreditor}
                onSendNotice={handleSendNotice}
                onViewDocuments={handleViewDocuments}
              />
            )}
            {viewMode === 'profile' && selectedCreditor && (
              <CreditorProfile
                creditor={selectedCreditor}
                claim={selectedCreditor.claim}
                notices={mockNotices.filter(n => n.creditor_id === selectedCreditor.id)}
                onBack={handleBackToList}
                onSendNotice={() => handleSendNotice(selectedCreditor)}
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
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims" className="mt-6">
            <CreditorTable
              creditors={mockCreditors.filter(c => c.claim)}
              onViewCreditor={handleViewCreditor}
              onSendNotice={handleSendNotice}
              onViewDocuments={handleViewDocuments}
            />
          </TabsContent>

          {/* Meeting Tab */}
          <TabsContent value="meeting" className="mt-6">
            <MeetingOfCreditors
              meeting={mockMeeting}
              onScheduleMeeting={() => toast.info('Schedule meeting')}
              onStartMeeting={() => toast.info('Start meeting')}
              onRecordVote={(id, vote) => toast.info(`Vote recorded: ${vote}`)}
              onEndMeeting={() => toast.info('End meeting')}
              onGenerateMinutes={() => toast.info('Generate minutes')}
            />
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="mt-6">
            <DistributionEngine
              distribution={mockDistribution}
              onCalculateDistribution={() => toast.info('Calculate distribution')}
              onApproveDistribution={() => toast.success('Distribution approved')}
              onGenerateForm12={() => toast.info('Generate Form 12')}
              onExportReport={() => toast.info('Export report')}
            />
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Audit Trail</h3>
              <p>View complete audit history of all creditor actions</p>
              <Button variant="outline" className="mt-4">
                View Full Audit Trail
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
