export interface Client {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  last_activity: string;
}

export interface IncomeExpenseData {
  // Basic Form Data
  id?: string;
  full_name?: string;
  date_of_birth?: string;
  social_insurance_number?: string;
  marital_status?: string;
  dependents?: string;
  residential_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  mailing_address?: string;
  home_phone?: string;
  cell_phone?: string;
  email?: string;
  
  // Income Fields
  employment_income?: string;
  self_employment_income?: string;
  pension_income?: string;
  support_payments_received?: string;
  investment_income?: string;
  other_income?: string;
  total_monthly_income?: string;
  
  // Expense Fields - Non-discretionary
  child_support_payments?: string;
  spousal_support_payments?: string;
  child_care_expenses?: string;
  medical_expenses?: string;
  
  // Expense Fields - Essential
  housing_expenses?: string;
  utilities?: string;
  food_expenses?: string;
  transportation_expenses?: string;
  clothing_expenses?: string;
  personal_hygiene?: string;
  
  // Expense Fields - Discretionary
  dining_out?: string;
  recreational_activities?: string;
  gifts_and_donations?: string;
  other_expenses?: string;
  total_monthly_expenses?: string;
  
  // Savings and Insurance
  emergency_fund_contributions?: string;
  rrsp_contributions?: string;
  resp_contributions?: string;
  tfsa_contributions?: string;
  life_insurance_premiums?: string;
  
  // Surplus Income
  surplus_income?: string;
  surplus_income_percentage?: string;
  
  // Signature and Verification
  electronic_signature?: string;
  verification_date?: string;
  trustee_comments?: string;
  consent_data_use?: string;
  consent_date?: string;
}

export interface PeriodData {
  current: IncomeExpenseData;
  previous: IncomeExpenseData;
}

export interface HistoricalData {
  currentPeriod: IncomeExpenseData;
  previousPeriod: IncomeExpenseData;
}

// Add these interfaces for the section components
export interface ClientProfileSectionProps {
  formData: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onMaritalStatusChange: (value: string) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
  isNewClientMode?: boolean;
  newClient?: any;
}

export interface EnhancedIncomeSectionProps {
  formData: IncomeExpenseData;
  previousMonthData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFrequencyChange: (value: string) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export interface NonDiscretionaryExpensesSectionProps {
  formData: IncomeExpenseData;
  previousMonthData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export interface EssentialExpensesSectionProps {
  formData: IncomeExpenseData;
  previousMonthData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export interface DiscretionaryExpensesSectionProps {
  formData: IncomeExpenseData;
  previousMonthData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export interface SavingsInsuranceSectionProps {
  formData: IncomeExpenseData;
  previousMonthData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}

export interface SurplusIncomeSectionProps {
  formData: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isViewMode?: boolean;
  isFieldEditable?: (fieldName: string) => boolean;
  onToggleFieldEdit?: (fieldName: string) => void;
}
