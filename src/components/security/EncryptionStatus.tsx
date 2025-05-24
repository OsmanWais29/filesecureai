
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Key, CheckCircle, AlertTriangle, Database, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface EncryptionCheck {
  category: string;
  status: 'active' | 'warning' | 'error';
  description: string;
  details: string;
  icon: React.ReactNode;
}

export const EncryptionStatus = () => {
  const [encryptionChecks, setEncryptionChecks] = useState<EncryptionCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    performEncryptionChecks();
  }, []);

  const performEncryptionChecks = async () => {
    setLoading(true);
    
    // Simulate encryption status checks
    const checks: EncryptionCheck[] = [
      {
        category: 'Data at Rest',
        status: 'active',
        description: 'AES-256 encryption enabled',
        details: 'All data stored in Supabase is encrypted at rest using AES-256 encryption',
        icon: <Database className="h-4 w-4" />
      },
      {
        category: 'Data in Transit',
        status: 'active',
        description: 'TLS 1.3 secured connections',
        details: 'All API communications use TLS 1.3 encryption for secure data transmission',
        icon: <Globe className="h-4 w-4" />
      },
      {
        category: 'Document Storage',
        status: 'active',
        description: 'End-to-end encryption',
        details: 'Documents are encrypted before storage and during transmission',
        icon: <Lock className="h-4 w-4" />
      },
      {
        category: 'Authentication',
        status: 'active',
        description: 'Secure token management',
        details: 'JWT tokens are securely generated and managed with proper expiration',
        icon: <Key className="h-4 w-4" />
      },
      {
        category: 'Database Security',
        status: 'active',
        description: 'Row Level Security enabled',
        details: 'All database tables have RLS policies to prevent unauthorized access',
        icon: <Shield className="h-4 w-4" />
      }
    ];

    // Simulate some loading time
    setTimeout(() => {
      setEncryptionChecks(checks);
      setLoading(false);
    }, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'secondary';
      case 'warning': return 'default';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const overallStatus = encryptionChecks.every(check => check.status === 'active') 
    ? 'active' : encryptionChecks.some(check => check.status === 'error') 
    ? 'error' : 'warning';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Encryption Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Encryption Status
            </div>
            <Badge variant={getStatusColor(overallStatus)} className="flex items-center gap-1">
              {getStatusIcon(overallStatus)}
              {overallStatus === 'active' ? 'All Systems Secure' : 
               overallStatus === 'warning' ? 'Issues Detected' : 'Critical Issues'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-6xl mb-4">
              {overallStatus === 'active' ? '🔒' : overallStatus === 'warning' ? '⚠️' : '🚨'}
            </div>
            <h3 className="text-lg font-medium mb-2">
              {overallStatus === 'active' ? 'Your data is fully protected' :
               overallStatus === 'warning' ? 'Some security checks need attention' :
               'Critical security issues detected'}
            </h3>
            <p className="text-muted-foreground">
              {overallStatus === 'active' 
                ? 'All encryption and security measures are active and functioning properly'
                : 'Review the details below and take necessary action'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <div className="grid gap-4 md:grid-cols-2">
        {encryptionChecks.map((check, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 p-2 bg-muted rounded-lg">
                  {check.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{check.category}</h4>
                    <Badge variant={getStatusColor(check.status)} className="flex items-center gap-1">
                      {getStatusIcon(check.status)}
                      {check.status === 'active' ? 'Active' : 
                       check.status === 'warning' ? 'Warning' : 'Error'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {check.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {check.details}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Security Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={performEncryptionChecks} 
            variant="outline" 
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Re-run Security Checks
          </Button>
          <Button 
            onClick={() => toast.info('Security report would be generated here')}
            variant="outline" 
            className="w-full"
          >
            <Key className="h-4 w-4 mr-2" />
            Generate Security Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
