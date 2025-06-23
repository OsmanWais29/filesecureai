
import { Users, FileCheck, PieChart } from "lucide-react";
import { MetricCard } from "../MetricCard";

export const CrmMetricsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard
        title="Total Leads"
        value="400"
        description="+8% from last month"
        icon={Users}
        trend="up"
        change="+8% from last month"
      />
      <MetricCard
        title="Conversion Rate"
        value="25%"
        description="This quarter"
        icon={FileCheck}
        trend="up"
        change="This quarter"
      />
      <MetricCard
        title="Feature Usage"
        value="85%"
        description="Active features"
        icon={PieChart}
        trend="neutral"
        change="Active features"
      />
    </div>
  );
};
