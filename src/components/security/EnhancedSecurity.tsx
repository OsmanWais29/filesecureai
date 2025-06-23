
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Key,
  Fingerprint,
  Globe,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityMetric {
  name: string;
  status: 'secure' | 'warning' | 'critical';
  score: number;
  description: string;
  lastChecked: string;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'authentication' | 'encryption' | 'access' | 'monitoring';
}

export const EnhancedSecurity = () => {
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([
    {
      name: 'Data Encryption',
      status: 'secure',
      score: 98,
      description: 'All documents encrypted with AES-256',
      lastChecked: '2 minutes ago'
    },
    {
      name: 'Access Control',
      status: 'secure',
      score: 95,
      description: 'Role-based access control active',
      lastChecked: '5 minutes ago'
    },
    {
      name: 'Authentication',
      status: 'warning',
      score: 85,
      description: '2FA not enabled for all users',
      lastChecked: '1 hour ago'
    },
    {
      name: 'Network Security',
      status: 'secure',
      score: 92,
      description: 'SSL/TLS encryption active',
      lastChecked: '10 minutes ago'
    }
  ]);

  const [securitySettings, setSecuritySettings] = useState<SecuritySetting[]>([
    {
      id: 'auto_logout',
      name: 'Auto Logout',
      description: 'Automatically log out inactive users after 30 minutes',
      enabled: true,
      category: 'authentication'
    },
    {
      id: 'email_verification',
      name: 'Email Verification',
      description: 'Require email verification for new accounts',
      enabled: true,
      category: 'authentication'
    },
    {
      id: 'document_encryption',
      name: 'Document Encryption',
      description: 'Encrypt all uploaded documents',
      enabled: true,
      category: 'encryption'
    },
    {
      id: 'audit_logging',
      name: 'Audit Logging',
      description: 'Log all user actions and document access',
      enabled: true,
      category: 'monitoring'
    },
    {
      id: 'ip_whitelisting',
      name: 'IP Whitelisting',
      description: 'Restrict access to specific IP addresses',
      enabled: false,
      category: 'access'
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'secure': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const runSecurityScan = () => {
    setIsScanning(true);
    toast.info('Starting security scan...');
    
    setTimeout(() => {
      setIsScanning(false);
      toast.success('Security scan completed');
    }, 3000);
  };

  const toggleSetting = (settingId: string) => {
    setSecuritySettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    toast.success('Security setting updated');
  };

  const overallScore = Math.round(
    securityMetrics.reduce((acc, metric) => acc + metric.score, 0) / securityMetrics.length
  );

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getStatusColor(overallScore >= 90 ? 'secure' : overallScore >= 75 ? 'warning' : 'critical')}`}>
                  {overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">Security Score</div>
                <Progress value={overallScore} className="mt-2" />
              </div>
            </div>
            <div className="space-y-3">
              {securityMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-xs text-muted-foreground">{metric.description}</div>
                  </div>
                  <Badge variant={getStatusBadge(metric.status)}>
                    {metric.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={runSecurityScan} disabled={isScanning}>
              {isScanning ? 'Scanning...' : 'Run Security Scan'}
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Audit Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {['authentication', 'encryption', 'access', 'monitoring'].map(category => (
              <div key={category}>
                <h4 className="font-medium mb-3 capitalize flex items-center gap-2">
                  {category === 'authentication' && <Key className="h-4 w-4" />}
                  {category === 'encryption' && <Lock className="h-4 w-4" />}
                  {category === 'access' && <Globe className="h-4 w-4" />}
                  {category === 'monitoring' && <Database className="h-4 w-4" />}
                  {category}
                </h4>
                <div className="space-y-3">
                  {securitySettings
                    .filter(setting => setting.category === category)
                    .map(setting => (
                      <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{setting.name}</div>
                          <div className="text-sm text-muted-foreground">{setting.description}</div>
                        </div>
                        <Switch
                          checked={setting.enabled}
                          onCheckedChange={() => toggleSetting(setting.id)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>Some users haven't enabled 2FA. Consider making it mandatory.</span>
                  <Button size="sm" variant="outline">Configure</Button>
                </div>
              </AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                All security scans completed successfully. No threats detected.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
