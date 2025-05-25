
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  percentage?: string;
  gradient?: string;
  onClick?: () => void;
}

export const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  percentage,
  gradient = "from-blue-500 to-blue-600",
  onClick
}: StatCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white dark:bg-gray-800" 
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg bg-gradient-to-br text-white shadow-sm",
            gradient
          )}>
            <Icon className="h-5 w-5" />
          </div>
          
          {trend && percentage && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              trend === 'up' 
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              {trend === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {percentage}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
