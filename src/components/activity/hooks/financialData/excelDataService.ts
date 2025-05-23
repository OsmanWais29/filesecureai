import { supabase } from "@/lib/supabase";
import { IncomeExpenseData } from "../../types";
import { toString, toNumber, safeObjectCast } from '@/utils/typeSafetyUtils';

export interface ProcessedFinancialData {
  id: string;
  client_name: string;
  monthly_income: number;
  monthly_expenses: number;
  surplus_income: number;
  submission_date: string;
  period_type: string;
  status: string;
  metadata: {
    source: string;
    row_index: number;
    original_data: Record<string, unknown>;
  };
}

export const fetchLatestExcelData = async (clientId: string): Promise<IncomeExpenseData | null> => {
  try {
    // Fetch the latest Excel data from the database
    const { data, error } = await supabase
      .from("financial_documents")
      .select("*")
      .eq("client_id", clientId)
      .eq("type", "excel")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("Error fetching Excel data:", error);
      return null;
    }

    // Map the Excel data to IncomeExpenseData structure
    const metadata = safeObjectCast(data.metadata);
    return {
      // Map Excel data to form fields
      full_name: toString(metadata.client_name) || "",
      // Initialize all other fields with empty values
      residential_address: "",
      phone_home: "",
      marital_status: "single",
      employer_name: "",
      work_phone: "",
      occupation: "",
      spouse_name: "",
      household_size: "",
      submission_date: new Date().toISOString().split('T')[0],
      date_of_filing: "",
      
      // Income Information - Debtor
      employment_income: "",
      pension_annuities: "",
      child_spousal_support: "",
      self_employment_income: "",
      government_benefits: "",
      rental_income: "",
      other_income: "",
      other_income_description: "",
      total_monthly_income: "",
      
      // Income Information - Spouse
      spouse_employment_income: "",
      spouse_pension_annuities: "",
      spouse_child_spousal_support: "",
      spouse_self_employment_income: "",
      spouse_government_benefits: "",
      spouse_rental_income: "",
      spouse_other_income: "",
      spouse_total_monthly_income: "",
      
      // Other Household Income
      other_household_income: "",
      total_household_income: "",
      
      // Non-Discretionary Expenses
      child_support_payments: "",
      medical_expenses: "",
      fines_penalties: "",
      other_mandatory_deductions: "",
      total_non_discretionary: "",
      
      // Essential Expenses
      mortgage_rent: "",
      utilities: "",
      groceries: "",
      child_care: "",
      medical_dental: "",
      transportation: "",
      education_tuition: "",
      debt_repayments: "",
      misc_essential_expenses: "",
      total_essential_expenses: "",
      
      // Discretionary Expenses
      dining_out: "",
      alcohol: "",
      tobacco: "",
      entertainment: "",
      gym_memberships: "",
      gifts_donations: "",
      subscriptions: "",
      clothing: "",
      pet_care: "",
      leisure_travel: "",
      telephone_internet: "",
      insurance: "",
      other_discretionary: "",
      other_discretionary_description: "",
      total_discretionary_expenses: "",
      
      // Savings & Investments
      emergency_savings: "",
      retirement_savings: "",
      education_savings: "",
      investment_contributions: "",
      total_savings: "",
      
      // Insurance Expenses
      vehicle_insurance: "",
      health_insurance: "",
      life_insurance: "",
      home_insurance: "",
      other_insurance: "",
      other_insurance_description: "",
      total_insurance: "",
      
      // Surplus Income Calculation
      net_income: "",
      applicable_threshold: "",
      surplus_amount: "",
      
      // Signature & Consent
      electronic_signature: "",
      verification_date: "",
      consent_data_use: "",
      consent_date: "",
      
      // Trustee Declaration
      trustee_comments: "",
      
      // Frequency settings
      income_frequency: "monthly",
      expense_frequency: "monthly",
      notes: "",
    };
  } catch (error) {
    console.error("Error in fetchLatestExcelData:", error);
    return null;
  }
};

export const processExcelData = (data: unknown[]): ProcessedFinancialData[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((row, index) => {
    const rowData = safeObjectCast(row);
    
    return {
      id: `row-${index}`,
      client_name: toString(rowData.client_name || rowData.name || rowData.Client || rowData.Name),
      monthly_income: toNumber(rowData.monthly_income || rowData.income || 0),
      monthly_expenses: toNumber(rowData.monthly_expenses || rowData.expenses || 0),
      surplus_income: toNumber(rowData.surplus_income || rowData.surplus || 0),
      submission_date: toString(rowData.submission_date || new Date().toISOString()),
      period_type: toString(rowData.period_type || 'current'),
      status: toString(rowData.status || 'pending_review'),
      metadata: {
        source: 'excel_import',
        row_index: index,
        original_data: rowData
      }
    };
  });
};
