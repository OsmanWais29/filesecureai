
import { IncomeExpenseData } from "../types";

// Calculate total income for debtor
export const calculateTotalDebtor = (formData: IncomeExpenseData): number => {
  const employment = parseFloat(formData.employment_income || '0') || 0;
  const pension = parseFloat(formData.pension_annuities || '0') || 0;
  const childSupport = parseFloat(formData.child_spousal_support || '0') || 0;
  const selfEmployment = parseFloat(formData.self_employment_income || '0') || 0;
  const govtBenefits = parseFloat(formData.government_benefits || '0') || 0;
  const rental = parseFloat(formData.rental_income || '0') || 0;
  const other = parseFloat(formData.other_income || '0') || 0;
  
  return employment + pension + childSupport + selfEmployment + govtBenefits + rental + other;
};

// Calculate total income for spouse
export const calculateTotalSpouse = (formData: IncomeExpenseData): number => {
  const employment = parseFloat(formData.spouse_employment_income || '0') || 0;
  const pension = parseFloat(formData.spouse_pension_annuities || '0') || 0;
  const childSupport = parseFloat(formData.spouse_child_spousal_support || '0') || 0;
  const selfEmployment = parseFloat(formData.spouse_self_employment_income || '0') || 0;
  const govtBenefits = parseFloat(formData.spouse_government_benefits || '0') || 0;
  const rental = parseFloat(formData.spouse_rental_income || '0') || 0;
  const other = parseFloat(formData.spouse_other_income || '0') || 0;
  
  return employment + pension + childSupport + selfEmployment + govtBenefits + rental + other;
};

// Calculate total household income
export const calculateTotalHousehold = (formData: IncomeExpenseData): number => {
  const debtorIncome = parseFloat(formData.total_monthly_income || '0') || 0;
  const spouseIncome = parseFloat(formData.spouse_total_monthly_income || '0') || 0;
  const otherHouseholdIncome = parseFloat(formData.other_household_income || '0') || 0;
  
  return debtorIncome + spouseIncome + otherHouseholdIncome;
};

// Calculate total expenses
export const calculateTotalExpenses = (formData: IncomeExpenseData): number => {
  const essentialExpenses = parseFloat(formData.total_essential_expenses || '0') || 0;
  const discretionaryExpenses = parseFloat(formData.total_discretionary_expenses || '0') || 0;
  const savingsInvestments = parseFloat(formData.total_savings || '0') || 0;
  const insuranceExpenses = parseFloat(formData.total_insurance || '0') || 0;
  const nonDiscretionary = parseFloat(formData.total_non_discretionary || '0') || 0;
  
  return essentialExpenses + discretionaryExpenses + savingsInvestments + insuranceExpenses + nonDiscretionary;
};

// Calculate net income after expenses
export const calculateNetIncome = (formData: IncomeExpenseData): number => {
  const totalIncome = calculateTotalHousehold(formData);
  const totalExpenses = calculateTotalExpenses(formData);
  
  return Math.max(0, totalIncome - totalExpenses);
};

// Calculate surplus income
export const calculateSurplusIncome = (formData: IncomeExpenseData): number => {
  const netIncome = parseFloat(formData.net_income || '0') || 0;
  const threshold = parseFloat(formData.applicable_threshold || '0') || 0;
  
  return Math.max(0, netIncome - threshold);
};
