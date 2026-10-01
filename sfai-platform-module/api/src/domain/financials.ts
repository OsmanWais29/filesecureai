// Monthly budget check (replaces analyze-financial-data). Plain arithmetic, no AI.
export interface Month {
  monthly_income: number;
  total_expenses: number;
  rent_mortgage?: number;
  food?: number;
  transportation?: number;
}

const LIMITS = { rent_mortgage: 0.33, transportation: 0.15, food: 0.15 }; // share of income
const LABEL = {
  monthly_income: "Monthly income",
  rent_mortgage: "Housing",
  food: "Food",
  transportation: "Transportation",
};

export function checkFinancials(current: Month, history: Month[] = []) {
  const warnings: string[] = [];
  const income = current.monthly_income;

  // 1. Spending against income and common guidelines
  if (income > 0 && current.total_expenses > income * 0.9) {
    warnings.push("Expenses are over 90% of income");
  }
  for (const [k, limit] of Object.entries(LIMITS) as [keyof typeof LIMITS, number][]) {
    const share = income > 0 ? (current[k] ?? 0) / income : 0;
    if (share > limit) {
      warnings.push(
        `${LABEL[k]} is ${(share * 100).toFixed(1)}% of income (guide: ${limit * 100}%)`,
      );
    }
  }

  // 2. Big jumps (>25%) since last month (history[0] = most recent)
  const last = history[0];
  const anomalies = !last
    ? []
    : (Object.keys(LABEL) as (keyof typeof LABEL)[]).flatMap((k) => {
        const now = current[k] ?? 0;
        const before = last[k] ?? 0;
        const change = before > 0 ? (now - before) / before : 0;
        if (Math.abs(change) <= 0.25) return [];
        const severity = Math.abs(change) > 0.5 ? "high" : "medium";
        return [{ field: LABEL[k], change: `${(change * 100).toFixed(1)}%`, severity }];
      });

  // 3. Surplus income trend (needs 3+ months)
  const surplus = history.map((m) => m.monthly_income - m.total_expenses);
  const average = surplus.reduce((a, b) => a + b, 0) / (surplus.length || 1);
  const trend = surplus.length >= 3 ? surplus[surplus.length - 1] - surplus[0] : 0;
  const predictions =
    surplus.length < 3
      ? null
      : {
          trend: trend > 0 ? "increasing" : "decreasing",
          average,
          nextMonthEstimate: average + trend / surplus.length,
          riskFactors: [
            ...(average < 0 ? ["Negative average surplus income"] : []),
            ...(trend < 0 ? ["Declining surplus income trend"] : []),
          ],
        };

  return { warnings, anomalies, predictions };
}
