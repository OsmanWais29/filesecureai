import { IncomeExpenseData } from "../../types";

export const mapDatabaseRecordToIncomeExpenseData = (record: any): IncomeExpenseData => {
  // Map database record to IncomeExpenseData structure
  return {
    // Map all fields from record to formData structure
    ...record.data,
    // Add any missing fields with default values
    full_name: record.data.full_name || "",
    residential_address: record.data.residential_address || "",
    phone_home: record.data.phone_home || "",
    marital_status: record.data.marital_status || "single",
    employer_name: record.data.employer_name || "",
    work_phone: record.data.work_phone || "",
    occupation: record.data.occupation || "",
    spouse_name: record.data.spouse_name || "",
    household_size: record.data.household_size || "",
    submission_date: record.data.submission_date || new Date().toISOString().split('T')[0],
    date_of_filing: record.data.date_of_filing || "",
    
    // Income Information - Debtor
    employment_income: record.data.employment_income || "",
    pension_annuities: record.data.pension_annuities || "",
    child_spousal_support: record.data.child_spousal_support || "",
    self_employment_income: record.data.self_employment_income || "",
    government_benefits: record.data.government_benefits || "",
    rental_income: record.data.rental_income || "",
    other_income: record.data.other_income || "",
    other_income_description: record.data.other_income_description || "",
    total_monthly_income: record.data.total_monthly_income || "",
    
    // Income Information - Spouse
    spouse_employment_income: record.data.spouse_employment_income || "",
    spouse_pension_annuities: record.data.spouse_pension_annuities || "",
    spouse_child_spousal_support: record.data.spouse_child_spousal_support || "",
    spouse_self_employment_income: record.data.spouse_self_employment_income || "",
    spouse_government_benefits: record.data.spouse_government_benefits || "",
    spouse_rental_income: record.data.spouse_rental_income || "",
    spouse_other_income: record.data.spouse_other_income || "",
    spouse_total_monthly_income: record.data.spouse_total_monthly_income || "",
    
    // Other Household Income
    other_household_income: record.data.other_household_income || "",
    total_household_income: record.data.total_household_income || "",
    
    // Non-Discretionary Expenses
    child_support_payments: record.data.child_support_payments || "",
    medical_expenses: record.data.medical_expenses || "",
    fines_penalties: record.data.fines_penalties || "",
    other_mandatory_deductions: record.data.other_mandatory_deductions || "",
    total_non_discretionary: record.data.total_non_discretionary || "",
    
    // Essential Expenses
    mortgage_rent: record.data.mortgage_rent || "",
    utilities: record.data.utilities || "",
    groceries: record.data.groceries || "",
    child_care: record.data.child_care || "",
    medical_dental: record.data.medical_dental || "",
    transportation: record.data.transportation || "",
    education_tuition: record.data.education_tuition || "",
    debt_repayments: record.data.debt_repayments || "",
    misc_essential_expenses: record.data.misc_essential_expenses || "",
    total_essential_expenses: record.data.total_essential_expenses || "",
    
    // Discretionary Expenses
    dining_out: record.data.dining_out || "",
    alcohol: record.data.alcohol || "",
    tobacco: record.data.tobacco || "",
    entertainment: record.data.entertainment || "",
    gym_memberships: record.data.gym_memberships || "",
    gifts_donations: record.data.gifts_donations || "",
    subscriptions: record.data.subscriptions || "",
    clothing: record.data.clothing || "",
    pet_care: record.data.pet_care || "",
    leisure_travel: record.data.leisure_travel || "",
    telephone_internet: record.data.telephone_internet || "",
    insurance: record.data.insurance || "",
    other_discretionary: record.data.other_discretionary || "",
    other_discretionary_description: record.data.other_discretionary_description || "",
    total_discretionary_expenses: record.data.total_discretionary_expenses || "",
    
    // Savings & Investments
    emergency_savings: record.data.emergency_savings || "",
    retirement_savings: record.data.retirement_savings || "",
    education_savings: record.data.education_savings || "",
    investment_contributions: record.data.investment_contributions || "",
    total_savings: record.data.total_savings || "",
    
    // Insurance Expenses
    vehicle_insurance: record.data.vehicle_insurance || "",
    health_insurance: record.data.health_insurance || "",
    life_insurance: record.data.life_insurance || "",
    home_insurance: record.data.home_insurance || "",
    other_insurance: record.data.other_insurance || "",
    other_insurance_description: record.data.other_insurance_description || "",
    total_insurance: record.data.total_insurance || "",
    
    // Surplus Income Calculation
    net_income: record.data.net_income || "",
    applicable_threshold: record.data.applicable_threshold || "",
    surplus_amount: record.data.surplus_amount || "",
    
    // Signature & Consent
    electronic_signature: record.data.electronic_signature || "",
    verification_date: record.data.verification_date || "",
    consent_data_use: record.data.consent_data_use || "",
    consent_date: record.data.consent_date || "",
    
    // Trustee Declaration
    trustee_comments: record.data.trustee_comments || "",
    
    // Frequency settings
    income_frequency: record.data.income_frequency || "monthly",
    expense_frequency: record.data.expense_frequency || "monthly",
    notes: record.data.notes || "",
  };
};
