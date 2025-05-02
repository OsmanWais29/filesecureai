import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormGroup } from "./FormGroup";
import { IncomeExpenseData } from "../types";
import { NumberInput } from "./NumberInput";
import { DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { calculateTotalDebtor, calculateTotalHousehold, calculateTotalSpouse } from "../utils/calculationUtils";

interface EnhancedIncomeSectionProps {
  formData: IncomeExpenseData;
  previousMonthData?: IncomeExpenseData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFrequencyChange: (value: string) => void;
}

export const EnhancedIncomeSection = ({
  formData,
  previousMonthData,
  onChange,
  onFrequencyChange,
}: EnhancedIncomeSectionProps) => {
  // Calculate total income for debtor
  const handleDebtorIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    const total = calculateTotalDebtor(newFormData);
    
    const totalEvent = {
      target: {
        name: "total_monthly_income",
        value: total.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(totalEvent);
    
    // Also update household income
    updateHouseholdIncome(newFormData);
  };

  // Calculate total income for spouse
  const handleSpouseIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    const total = calculateTotalSpouse(newFormData);
    
    const totalEvent = {
      target: {
        name: "spouse_total_monthly_income",
        value: total.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(totalEvent);
    
    // Also update household income
    updateHouseholdIncome(newFormData);
  };
  
  // Calculate total household income
  const handleOtherHouseholdIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value,
    };
    
    updateHouseholdIncome(newFormData);
  };
  
  const updateHouseholdIncome = (data: IncomeExpenseData) => {
    const total = calculateTotalHousehold(data);
    
    const totalEvent = {
      target: {
        name: "total_household_income",
        value: total.toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(totalEvent);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Income Information
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="income-frequency">Income Frequency:</Label>
            <Select
              value={formData.income_frequency || "monthly"}
              onValueChange={onFrequencyChange}
            >
              <SelectTrigger id="income-frequency" className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="grid gap-6">
        {/* Debtor Income */}
        <FormGroup title="Debtor's Income">
          <div className="grid md:grid-cols-2 gap-4">
            <NumberInput
              id="employment_income"
              name="employment_income"
              label="Employment Income (Gross)"
              value={formData.employment_income || ""}
              onChange={handleDebtorIncomeChange}
              required
            />
            
            <NumberInput
              id="pension_annuities"
              name="pension_annuities"
              label="Pension/Annuities"
              value={formData.pension_annuities || ""}
              onChange={handleDebtorIncomeChange}
            />
            
            <NumberInput
              id="child_spousal_support"
              name="child_spousal_support"
              label="Child/Spousal Support"
              value={formData.child_spousal_support || ""}
              onChange={handleDebtorIncomeChange}
            />
            
            <NumberInput
              id="self_employment_income"
              name="self_employment_income"
              label="Self-Employment Income"
              value={formData.self_employment_income || ""}
              onChange={handleDebtorIncomeChange}
            />
            
            <NumberInput
              id="government_benefits"
              name="government_benefits"
              label="Government Benefits"
              value={formData.government_benefits || ""}
              onChange={handleDebtorIncomeChange}
            />
            
            <NumberInput
              id="rental_income"
              name="rental_income"
              label="Rental Income"
              value={formData.rental_income || ""}
              onChange={handleDebtorIncomeChange}
            />
            
            <div className="grid grid-cols-1 gap-2">
              <NumberInput
                id="other_income"
                name="other_income"
                label="Other Income"
                value={formData.other_income || ""}
                onChange={handleDebtorIncomeChange}
              />
              {formData.other_income && parseFloat(formData.other_income) > 0 && (
                <input
                  type="text"
                  id="other_income_description"
                  name="other_income_description"
                  placeholder="Description of other income"
                  className="border rounded p-2 text-sm"
                  value={formData.other_income_description || ""}
                  onChange={onChange}
                />
              )}
            </div>
            
            <NumberInput
              id="total_monthly_income"
              name="total_monthly_income"
              label="Total Monthly Income"
              value={formData.total_monthly_income || ""}
              onChange={onChange}
              required
              disabled
              className="font-bold"
            />
          </div>
        </FormGroup>
        
        {/* Spouse Income */}
        {formData.marital_status === "married" || formData.marital_status === "common_law" ? (
          <FormGroup title="Spouse's Income">
            <div className="grid md:grid-cols-2 gap-4">
              <NumberInput
                id="spouse_employment_income"
                name="spouse_employment_income"
                label="Employment Income (Gross)"
                value={formData.spouse_employment_income || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_pension_annuities"
                name="spouse_pension_annuities"
                label="Pension/Annuities"
                value={formData.spouse_pension_annuities || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_child_spousal_support"
                name="spouse_child_spousal_support"
                label="Child/Spousal Support"
                value={formData.spouse_child_spousal_support || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_self_employment_income"
                name="spouse_self_employment_income"
                label="Self-Employment Income"
                value={formData.spouse_self_employment_income || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_government_benefits"
                name="spouse_government_benefits"
                label="Government Benefits"
                value={formData.spouse_government_benefits || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_rental_income"
                name="spouse_rental_income"
                label="Rental Income"
                value={formData.spouse_rental_income || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_other_income"
                name="spouse_other_income"
                label="Other Income"
                value={formData.spouse_other_income || ""}
                onChange={handleSpouseIncomeChange}
              />
              
              <NumberInput
                id="spouse_total_monthly_income"
                name="spouse_total_monthly_income"
                label="Total Monthly Income"
                value={formData.spouse_total_monthly_income || ""}
                onChange={onChange}
                disabled
                className="font-bold"
              />
            </div>
          </FormGroup>
        ) : null}
        
        {/* Total Household Income */}
        <FormGroup title="Household Income">
          <div className="grid md:grid-cols-2 gap-4">
            <NumberInput
              id="other_household_income"
              name="other_household_income"
              label="Other Household Income"
              value={formData.other_household_income || ""}
              onChange={handleOtherHouseholdIncomeChange}
              tooltip="Income from other household members"
            />
            
            <NumberInput
              id="total_household_income"
              name="total_household_income"
              label="Total Household Income"
              value={formData.total_household_income || ""}
              onChange={onChange}
              disabled
              className="font-bold"
            />
          </div>
        </FormGroup>
      </CardContent>
    </Card>
  );
};
