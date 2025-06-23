
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export const getRiskColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'outline';
  }
};

export const getRiskIcon = (severity: string) => {
  switch (severity) {
    case 'high': return AlertTriangle;
    case 'medium': return Shield;
    case 'low': return CheckCircle;
    default: return Shield;
  }
};
