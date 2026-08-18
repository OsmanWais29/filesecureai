// Estate access layer. The database is the source of truth; these hooks are a
// thin presentation wrapper over the persisted `estates` table.
import { rowToSummary } from "@/data/estateRecordMapping";
import { useEstateRow, useEstateSummaries } from "@/hooks/useEstateRecords";

export const useEstateList = () => useEstateSummaries();

export const useEstate = (id?: string) => {
  const { data, isLoading, error } = useEstateRow(id);
  return {
    estate: data ? rowToSummary(data) : undefined,
    row: data ?? undefined,
    isLoading,
    error,
  };
};
