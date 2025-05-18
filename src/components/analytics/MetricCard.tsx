
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
}

export const MetricCard = memo(({ title, value, description, icon: Icon, trend }: MetricCardProps) => {
  return (
    <Card className="border border-border/40 shadow-sm hover:shadow transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="p-2 rounded-full bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {trend && (
          <div className="mt-3">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              trend === "up" ? "bg-green-100 text-green-700" : 
              trend === "down" ? "bg-red-100 text-red-700" : 
              "bg-gray-100 text-gray-700"
            )}>
              {trend === "up" ? "↑ Positive" : 
               trend === "down" ? "↓ Negative" : 
               "→ Neutral"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = "MetricCard";
