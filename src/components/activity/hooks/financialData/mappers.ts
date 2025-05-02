import { IncomeExpenseData } from "../../types";

// Map database record to form data
export const mapRecordToFormData = (record: any): IncomeExpenseData => {
  return {
    // Client Information
    client_id: record.client_id || "",
    full_name: record.full_name || "",
    residential_address: record.residential_address || "",
    phone_home: record.phone_home || "",
    marital_status: record.marital_status || "single",
    employer_name: record.employer_name || "",
    work_phone: record.work_phone || "",
    occupation: record.occupation || "",
    spouse_name: record.spouse_name || "",
    household_size: record.household_size || "",
    submission_date: record.submission_date || new Date().toISOString().split('T')[0],
    date_of_filing: record.date_of_filing || "",
    
    // Income Information - Debtor
    employment_income: record.employment_income || "",
    pension_annuities: record.pension_annuities || "",
    child_spousal_support: record.child_spousal_support || "",
    self_employment_income: record.self_employment_income || "",
    government_benefits: record.government_benefits || "",
    rental_income: record.rental_income || "",
    other_income: record.other_income || "",
    other_income_description: record.other_income_description || "",
    total_monthly_income: record.total_monthly_income || "",
    
    // Income Information - Spouse
    spouse_employment_income: record.spouse_employment_income || "",
    spouse_pension_annuities: record.spouse_pension_annuities || "",
    spouse_child_spousal_support: record.spouse_child_spousal_support || "",
    spouse_self_employment_income: record.spouse_self_employment_income || "",
    spouse_government_benefits: record.spouse_government_benefits || "",
    spouse_rental_income: record.spouse_rental_income || "",
    spouse_other_income: record.spouse_other_income || "",
    spouse_total_monthly_income: record.spouse_total_monthly_income || "",
    
    // Other Household Income
    other_household_income: record.other_household_income || "",
    total_household_income: record.total_household_income || "",
    
    // Non-Discretionary Expenses
    child_support_payments: record.child_support_payments || "",
    medical_expenses: record.medical_expenses || "",
    fines_penalties: record.fines_penalties || "",
    other_mandatory_deductions: record.other_mandatory_deductions || "",
    total_non_discretionary: record.total_non_discretionary || "",
    
    // Essential Expenses
    mortgage_rent: record.mortgage_rent || "",
    utilities: record.utilities || "",
    groceries: record.groceries || "",
    child_care: record.child_care || "",
    medical_dental: record.medical_dental || "",
    transportation: record.transportation || "",
    education_tuition: record.education_tuition || "",
    debt_repayments: record.debt_repayments || "",
    misc_essential_expenses: record.misc_essential_expenses || "",
    total_essential_expenses: record.total_essential_expenses || "",
    
    // Discretionary Expenses
    dining_out: record.dining_out || "",
    alcohol: record.alcohol || "",
    tobacco: record.tobacco || "",
    entertainment: record.entertainment || "",
    gym_memberships: record.gym_memberships || "",
    gifts_donations: record.gifts_donations || "",
    subscriptions: record.subscriptions || "",
    clothing: record.clothing || "",
    pet_care: record.pet_care || "",
    leisure_travel: record.leisure_travel || "",
    telephone_internet: record.telephone_internet || "",
    insurance: record.insurance || "",
    other_discretionary: record.other_discretionary || "",
    other_discretionary_description: record.other_discretionary_description || "",
    total_discretionary_expenses: record.total_discretionary_expenses || "",
    
    // Savings & Investments
    emergency_savings: record.emergency_savings || "",
    retirement_savings: record.retirement_savings || "",
    education_savings: record.education_savings || "",
    investment_contributions: record.investment_contributions || "",
    total_savings: record.total_savings || "",
    
    // Insurance Expenses
    vehicle_insurance: record.vehicle_insurance || "",
    health_insurance: record.health_insurance || "",
    life_insurance: record.life_insurance || "",
    home_insurance: record.home_insurance || "",
    other_insurance: record.other_insurance || "",
    other_insurance_description: record.other_insurance_description || "",
    total_insurance: record.total_insurance || "",
    
    // Surplus Income Calculation
    net_income: record.net_income || "",
    applicable_threshold: record.applicable_threshold || "",
    surplus_amount: record.surplus_amount || "",
    
    // Signature & Consent
    electronic_signature: record.electronic_signature || "",
    verification_date: record.verification_date || "",
    consent_data_use: record.consent_data_use || "",
    consent_date: record.consent_date || "",
    
    // Trustee Declaration
    trustee_comments: record.trustee_comments || "",
    
    // Frequency settings
    income_frequency: record.income_frequency || "monthly",
    expense_frequency: record.expense_frequency || "monthly",
    notes: record.notes || "",
  };
};

// Map form data to database record
export const mapFormDataToRecord = (formData: IncomeExpenseData, clientId: string) => {
  return {
    client_id: clientId,
    ...formData,
    updated_at: new Date().toISOString(),
  };
};

// Format currency for display
export const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return "$0.00";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(numValue);
};
