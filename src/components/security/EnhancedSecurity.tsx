
import React from 'react';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const EnhancedSecurity = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Security Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Encryption</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Lock className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Access Control</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              <Eye className="h-3 w-3 mr-1" />
              Monitored
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
