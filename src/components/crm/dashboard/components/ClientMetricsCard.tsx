
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LucideIcon } from 'lucide-react';

interface ClientMetricsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  progress?: number;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export const ClientMetricsCard = ({ title, value, icon: Icon, progress, color }: ClientMetricsCardProps) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">{title}</p>
          <Icon className={`h-5 w-5 ${colorClasses[color]}`} />
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold">{value}</p>
          {progress !== undefined && (
            <Progress value={progress} className="h-2" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
