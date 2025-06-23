
import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  compact?: boolean;
  className?: string;
}

export const Footer = ({ compact = false, className }: FooterProps) => {
  return (
    <footer className={cn(
      "border-t border-border bg-background",
      compact ? "py-2" : "py-4",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2024 SecureFiles AI. All rights reserved.</p>
          <p>Licensed Insolvency Trustee Portal</p>
        </div>
      </div>
    </footer>
  );
};
