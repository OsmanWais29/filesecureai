
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  FileShield, 
  UserCheck, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  type: 'login' | 'access' | 'download' | 'upload' | 'modification';
  user: string;
  timestamp: string;
  ip: string;
  location: string;
  risk: 'low' | 'medium' | 'high';
  details: string;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  ipWhitelist: boolean;
  encryptionLevel: string;
  auditLogging: boolean;
  failedLoginLockout: boolean;
  passwordPolicy: {
    minLength: number;
    requireSpecialChars: boolean;
    requireNumbers: boolean;
    expiry: number;
  };
}

export const EnhancedSecurity = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    sessionTimeout: 30,
    ipWhitelist: false,
    encryptionLevel: 'AES-256',
    auditLogging: true,
    failedLoginLockout: true,
    passwordPolicy: {
      minLength: 12,
      requireSpecialChars: true,
      requireNumbers: true,
      expiry: 90
    }
  });
  const [activeThreats, setActiveThreats] = useState(0);
  const [securityScore, setSecurityScore] = useState(94);

  useEffect(() => {
    loadSecurityEvents();
    calculateSecurityScore();
  }, [settings]);

  const loadSecurityEvents = () => {
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login',
        user: 'john.trustee@example.com',
        timestamp: '2025-01-10T09:15:00Z',
        ip: '192.168.1.100',
        location: 'Toronto, ON',
        risk: 'low',
        details: 'Successful login from known device'
      },
      {
        id: '2',
        type: 'access',
        user: 'client.user@example.com',
        timestamp: '2025-01-10T08:45:00Z',
        ip: '203.0.113.45',
        location: 'Vancouver, BC',
        risk: 'medium',
        details: 'Document access from new location'
      },
      {
        id: '3',
        type: 'download',
        user: 'admin@securefiles.ai',
        timestamp: '2025-01-09T16:30:00Z',
        ip: '192.168.1.50',
        location: 'Calgary, AB',
        risk: 'low',
        details: 'Bulk document download by administrator'
      }
    ];
    
    setSecurityEvents(mockEvents);
    setActiveThreats(mockEvents.filter(e => e.risk === 'high').length);
  };

  const calculateSecurityScore = () => {
    let score = 100;
    if (!settings.twoFactorAuth) score -= 20;
    if (!settings.auditLogging) score -= 15;
    if (!settings.failedLoginLockout) score -= 10;
    if (settings.sessionTimeout > 60) score -= 5;
    
    setSecurityScore(Math.max(score, 0));
  };

  const updateSetting = <K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Security setting updated');
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'login': return <UserCheck className="h-4 w-4" />;
      case 'access': return <Eye className="h-4 w-4" />;
      case 'download': return <FileShield className="h-4 w-4" />;
      case 'upload': return <Database className="h-4 w-4" />;
      case 'modification': return <Key className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityScore}</p>
                <p className="text-sm text-muted-foreground">Security Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeThreats}</p>
                <p className="text-sm text-muted-foreground">Active Threats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">247</p>
                <p className="text-sm text-muted-foreground">Events Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Lock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">AES-256</p>
                <p className="text-sm text-muted-foreground">Encryption</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authentication */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Authentication & Access
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">Extra security layer</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelist</Label>
                  <p className="text-xs text-muted-foreground">Restrict by IP address</p>
                </div>
                <Switch
                  checked={settings.ipWhitelist}
                  onCheckedChange={(checked) => updateSetting('ipWhitelist', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Failed Login Lockout</Label>
                  <p className="text-xs text-muted-foreground">Auto-lock after failures</p>
                </div>
                <Switch
                  checked={settings.failedLoginLockout}
                  onCheckedChange={(checked) => updateSetting('failedLoginLockout', checked)}
                />
              </div>
            </div>
          </div>

          {/* Data Protection */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileShield className="h-4 w-4" />
              Data Protection
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Audit Logging</Label>
                  <p className="text-xs text-muted-foreground">Track all activities</p>
                </div>
                <Switch
                  checked={settings.auditLogging}
                  onCheckedChange={(checked) => updateSetting('auditLogging', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Encryption Level</Label>
                <Input value={settings.encryptionLevel} disabled />
              </div>
            </div>
          </div>

          {/* Password Policy */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Password Policy
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Length</Label>
                <Input
                  type="number"
                  value={settings.passwordPolicy.minLength}
                  onChange={(e) => updateSetting('passwordPolicy', {
                    ...settings.passwordPolicy,
                    minLength: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry (days)</Label>
                <Input
                  type="number"
                  value={settings.passwordPolicy.expiry}
                  onChange={(e) => updateSetting('passwordPolicy', {
                    ...settings.passwordPolicy,
                    expiry: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Special Characters</Label>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) => updateSetting('passwordPolicy', {
                    ...settings.passwordPolicy,
                    requireSpecialChars: checked
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Numbers</Label>
                </div>
                <Switch
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => updateSetting('passwordPolicy', {
                    ...settings.passwordPolicy,
                    requireNumbers: checked
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securityEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{event.type} Event</h4>
                      <Badge className={getRiskColor(event.risk)}>
                        {event.risk.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {event.details}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {event.ip}
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
