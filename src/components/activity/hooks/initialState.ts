
import { IncomeExpenseData } from "../types";
import { HistoricalData } from "./types";

export const initialFormData: IncomeExpenseData = {
  full_name: "",
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

export const initialHistoricalData: HistoricalData = {
  currentPeriod: {
    totalIncome: 0,
    totalExpenses: 0,
    surplusIncome: 0,
  },
  previousPeriod: {
    totalIncome: 0,
    totalExpenses: 0,
    surplusIncome: 0,
  },
};
