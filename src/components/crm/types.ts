export interface ClientInsightData {
  id?: string;
  clientProfile?: {
    name?: string;
    email: string; // Make email required to match the other interface
    phone: string; // Make phone required to match the other interface
    company?: string;
    role?: string;
    website?: string;
    avatarUrl?: string;
    tags?: string[];
    assignedAgent?: string;
    leadDescription?: string;
    leadSource?: string;
    accountStatus?: string;
  };
  financialData?: {
    income?: number;
    expenses?: number;
    assets?: number;
    liabilities?: number;
    creditScore?: number;
  };
  interactions?: {
    date: string;
    type: string;
    description: string;
  }[];
  riskLevel: "high" | "medium" | "low"; // Required field
  riskScore: number; // Required field
  complianceStatus: 'compliant' | 'issues' | 'critical'; // Required field with specific union type
  caseProgress: number; // Required field
  assignedTrustee?: string;
  pendingTasks: { // Required field
    id: string;
    title: string;
    priority: "high" | "medium" | "low";
  }[];
  missingDocuments: string[]; // String array type
  recentActivities: { // Required field
    id: string;
    type: string;
    description?: string;
    action: string; 
    timestamp: string;
    date?: string;
  }[];
  aiSuggestions: { // Required field
    id: string;
    text?: string;
    message: string; // Make message required
    type: "info" | "warning" | "urgent"; // Restrict type to these specific values
    action?: string;
  }[];
  upcomingDeadlines: { // Required field
    id: string;
    title: string;
    date: string;
    priority: "high" | "medium" | "low"; // Make priority required
  }[];
  lastContactDate?: string;
  nextFollowUp?: string;
  caseStatus?: string;
  clientNotes?: {
    title: string;
    content: string;
    timestamp: string;
    attachments?: string[];
  }[];
  milestones?: {
    name: string;
    completed: boolean;
  }[];
}

export interface ClientInfo {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  tags?: string[];
}

// Keep existing FormData interface
export interface FormData {
  fullName: string;
  email: string;
  phone: string;
  mobilePhone: string;
  companyName: string;
  businessType: string;
  notes: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  dateOfBirth: string;
  sin: string;
  maritalStatus: string;
  leadSource: string;
  otherLeadSourceDetails: string;
  leadDescription: string;
  accountStatus: string;
  preferredContactMethod: string;
  preferredLanguage: string;
  employmentType?: string;
  employer?: string;
  occupation?: string;
  employerAddress?: string;
  employerCity?: string;
  employerProvince?: string;
  employerPostalCode?: string;
  monthlyIncome?: string;
  incomeFrequency?: string;
  businessName?: string;
  annualRevenue?: string;
  unsecuredDebt?: string;
  securedDebt?: string;
  taxDebt?: string;
  realEstate?: string;
  vehicles?: string;
  bankAccounts?: string;
  [key: string]: string | undefined;
}
