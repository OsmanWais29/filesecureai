
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  onClick
}: StatCardProps) => {
  return (
    <Card 
      className="hover:shadow-md hover:bg-accent/50 transition-all duration-200 cursor-pointer group" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium group-hover:text-accent-foreground transition-colors">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold group-hover:text-accent-foreground transition-colors">
          {value}
        </div>
        <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
