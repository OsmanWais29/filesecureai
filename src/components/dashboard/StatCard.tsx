
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  actionLabel?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  onClick, 
  actionLabel = "View All" 
}: StatCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mb-2">{description}</p>
        {onClick && (
          <Button variant="outline" size="sm" className="w-full">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
