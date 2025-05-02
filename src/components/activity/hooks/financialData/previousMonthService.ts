
import { supabase } from "@/lib/supabase";
import { IncomeExpenseData } from "../../types";
import { mapDatabaseRecordToIncomeExpenseData } from "./mappers";

export const fetchPreviousMonthData = async (
  clientId: string, 
  currentMonth: string
): Promise<IncomeExpenseData | null> => {
  try {
    // Get month and year from current month (format: YYYY-MM)
    const [year, month] = currentMonth.split('-').map(Number);
    
    // Calculate previous month (handle January case)
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    
    // Format previous month as YYYY-MM
    const previousMonth = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
    
    // Fetch previous month's record
    const { data, error } = await supabase
      .from("financial_records")
      .select("*")
      .eq("client_id", clientId)
      .eq("month", previousMonth)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error("Error fetching previous month data:", error);
      return null;
    }
    
    // Map database record to form data structure
    return mapDatabaseRecordToIncomeExpenseData(data);
  } catch (error) {
    console.error("Error in fetchPreviousMonthData:", error);
    return null;
  }
};
