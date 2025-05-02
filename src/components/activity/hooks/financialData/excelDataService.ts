import { IncomeExpenseData } from "../../types";

// Mock function to simulate loading data from Excel
export const loadClientDataFromExcel = async (clientId: string): Promise<IncomeExpenseData | null> => {
  console.log(`Loading data for client ${clientId} from Excel`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return createDefaultClientData(clientId);
};

// Mock function to simulate loading previous month data
export const loadPreviousMonthData = async (clientId: string): Promise<IncomeExpenseData | null> => {
  console.log(`Loading previous month data for client ${clientId}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return mock data with slightly different values
  return createPreviousMonthData(clientId);
};

// Create default client data
const createDefaultClientData = (clientId: string): IncomeExpenseData => {
  return {
    client_id: clientId,
    full_name: "John Doe",
    residential_address: "123 Main St, Anytown, CA 90210",
    phone_home: "555-123-4567",
    marital_status: "married",
    employer_name: "Acme Corporation",
    work_phone: "555-987-6543",
    occupation: "Software Developer",
    spouse_name: "Jane Doe",
    household_size: "4",
    submission_date: new Date().toISOString().split('T')[0],
    date_of_filing: "2023-12-15",
    
    // Income Information - Debtor
    employment_income: "5000",
    pension_annuities: "500",
    child_spousal_support: "0",
    self_employment_income: "1000",
    government_benefits: "0",
    rental_income: "1200",
    other_income: "300",
    other_income_description: "Freelance work",
    total_monthly_income: "8000",
    
    // Income Information - Spouse
    spouse_employment_income: "4000",
    spouse_pension_annuities: "0",
    spouse_child_spousal_support: "0",
    spouse_self_employment_income: "0",
    spouse_government_benefits: "0",
    spouse_rental_income: "0",
    spouse_other_income: "200",
    spouse_total_monthly_income: "4200",
    
    // Other Household Income
    other_household_income: "0",
    total_household_income: "12200",
    
    // Non-Discretionary Expenses
    child_support_payments: "0",
    medical_expenses: "300",
    fines_penalties: "0",
    other_mandatory_deductions: "200",
    total_non_discretionary: "500",
    
    // Essential Expenses
    mortgage_rent: "2500",
    utilities: "400",
    groceries: "800",
    child_care: "600",
    medical_dental: "200",
    transportation: "350",
    education_tuition: "300",
    debt_repayments: "500",
    misc_essential_expenses: "200",
    total_essential_expenses: "5850",
    
    // Discretionary Expenses
    dining_out: "400",
    alcohol: "100",
    tobacco: "0",
    entertainment: "200",
    gym_memberships: "80",
    gifts_donations: "150",
    subscriptions: "50",
    clothing: "200",
    pet_care: "100",
    leisure_travel: "300",
    telephone_internet: "150",
    insurance: "300",
    other_discretionary: "100",
    other_discretionary_description: "Hobbies",
    total_discretionary_expenses: "2130",
    
    // Savings & Investments
    emergency_savings: "500",
    retirement_savings: "1000",
    education_savings: "300",
    investment_contributions: "200",
    total_savings: "2000",
    
    // Insurance Expenses
    vehicle_insurance: "150",
    health_insurance: "400",
    life_insurance: "100",
    home_insurance: "120",
    other_insurance: "50",
    other_insurance_description: "Pet insurance",
    total_insurance: "820",
    
    // Surplus Income Calculation
    net_income: "3000",
    applicable_threshold: "2000",
    surplus_amount: "1000",
    
    // Signature & Consent
    electronic_signature: "John Doe",
    verification_date: new Date().toISOString().split('T')[0],
    consent_data_use: "true",
    consent_date: new Date().toISOString().split('T')[0],
    
    // Trustee Declaration
    trustee_comments: "Client appears to have stable income and reasonable expenses.",
    
    // Frequency settings
    income_frequency: "monthly",
    expense_frequency: "monthly",
    notes: "Client has been cooperative and provided all requested documentation.",
  };
};

// Create previous month data with slight variations
const createPreviousMonthData = (clientId: string): IncomeExpenseData => {
  return {
    client_id: clientId,
    full_name: "John Doe",
    residential_address: "123 Main St, Anytown, CA 90210",
    phone_home: "555-123-4567",
    marital_status: "married",
    employer_name: "Acme Corporation",
    work_phone: "555-987-6543",
    occupation: "Software Developer",
    spouse_name: "Jane Doe",
    household_size: "4",
    submission_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_of_filing: "2023-12-15",
    
    // Income Information - Debtor
    employment_income: "4800",
    pension_annuities: "500",
    child_spousal_support: "0",
    self_employment_income: "800",
    government_benefits: "0",
    rental_income: "1200",
    other_income: "200",
    other_income_description: "Freelance work",
    total_monthly_income: "7500",
    
    // Income Information - Spouse
    spouse_employment_income: "4000",
    spouse_pension_annuities: "0",
    spouse_child_spousal_support: "0",
    spouse_self_employment_income: "0",
    spouse_government_benefits: "0",
    spouse_rental_income: "0",
    spouse_other_income: "150",
    spouse_total_monthly_income: "4150",
    
    // Other Household Income
    other_household_income: "0",
    total_household_income: "11650",
    
    // Non-Discretionary Expenses
    child_support_payments: "0",
    medical_expenses: "250",
    fines_penalties: "0",
    other_mandatory_deductions: "200",
    total_non_discretionary: "450",
    
    // Essential Expenses
    mortgage_rent: "2500",
    utilities: "380",
    groceries: "750",
    child_care: "600",
    medical_dental: "180",
    transportation: "320",
    education_tuition: "300",
    debt_repayments: "500",
    misc_essential_expenses: "180",
    total_essential_expenses: "5710",
    
    // Discretionary Expenses
    dining_out: "350",
    alcohol: "80",
    tobacco: "0",
    entertainment: "180",
    gym_memberships: "80",
    gifts_donations: "100",
    subscriptions: "50",
    clothing: "150",
    pet_care: "100",
    leisure_travel: "200",
    telephone_internet: "150",
    insurance: "300",
    other_discretionary: "80",
    other_discretionary_description: "Hobbies",
    total_discretionary_expenses: "1820",
    
    // Savings & Investments
    emergency_savings: "400",
    retirement_savings: "1000",
    education_savings: "300",
    investment_contributions: "200",
    total_savings: "1900",
    
    // Insurance Expenses
    vehicle_insurance: "150",
    health_insurance: "400",
    life_insurance: "100",
    home_insurance: "120",
    other_insurance: "50",
    other_insurance_description: "Pet insurance",
    total_insurance: "820",
    
    // Surplus Income Calculation
    net_income: "2850",
    applicable_threshold: "2000",
    surplus_amount: "850",
    
    // Signature & Consent
    electronic_signature: "John Doe",
    verification_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    consent_data_use: "true",
    consent_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Trustee Declaration
    trustee_comments: "Client's income has slightly decreased from previous month.",
    
    // Frequency settings
    income_frequency: "monthly",
    expense_frequency: "monthly",
    notes: "Client has been cooperative and provided all requested documentation.",
  };
};

// Mock function to simulate saving data to Excel
export const saveClientDataToExcel = async (data: IncomeExpenseData): Promise<string> => {
  console.log("Saving client data to Excel:", data);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock record ID
  return `record_${Date.now()}`;
};
