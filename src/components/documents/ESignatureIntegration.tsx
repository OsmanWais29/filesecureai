
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  PenTool, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Eye,
  Download,
  Share,
  History,
  Users,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface SignatureRequest {
  id: string;
  documentName: string;
  recipient: {
    name: string;
    email: string;
    role: string;
  };
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'completed' | 'expired';
  createdAt: string;
  expiresAt: string;
  signedAt?: string;
  progress: number;
}

interface SignatureField {
  id: string;
  type: 'signature' | 'initial' | 'date' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
  assignedTo: string;
}

export const ESignatureIntegration = () => {
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([
    {
      id: 'sr1',
      documentName: 'Form 47 - Consumer Proposal',
      recipient: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        role: 'Debtor'
      },
      status: 'signed',
      createdAt: '2025-01-09T10:00:00Z',
      expiresAt: '2025-01-16T10:00:00Z',
      signedAt: '2025-01-10T14:30:00Z',
      progress: 100
    },
    {
      id: 'sr2',
      documentName: 'Assignment for Benefit of Creditors',
      recipient: {
        name: 'Jane Doe',
        email: 'jane.doe@email.com',
        role: 'Client'
      },
      status: 'sent',
      createdAt: '2025-01-10T09:15:00Z',
      expiresAt: '2025-01-17T09:15:00Z',
      progress: 60
    },
    {
      id: 'sr3',
      documentName: 'Income and Expense Statement',
      recipient: {
        name: 'Mike Johnson',
        email: 'mike.johnson@email.com',
        role: 'Co-signer'
      },
      status: 'viewed',
      createdAt: '2025-01-10T11:30:00Z',
      expiresAt: '2025-01-17T11:30:00Z',
      progress: 40
    }
  ]);

  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    documentName: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
    expiryDays: 7
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'viewed':
        return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'signed':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'viewed':
        return 'outline';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const createSignatureRequest = () => {
    if (!newRequest.documentName || !newRequest.recipientEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    const request: SignatureRequest = {
      id: `sr${Date.now()}`,
      documentName: newRequest.documentName,
      recipient: {
        name: newRequest.recipientName || newRequest.recipientEmail.split('@')[0],
        email: newRequest.recipientEmail,
        role: 'Signer'
      },
      status: 'draft',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + newRequest.expiryDays * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0
    };

    setSignatureRequests(prev => [request, ...prev]);
    setNewRequest({
      documentName: '',
      recipientName: '',
      recipientEmail: '',
      message: '',
      expiryDays: 7
    });
    setIsCreatingRequest(false);
    toast.success('Signature request created successfully');
  };

  const sendForSignature = (requestId: string) => {
    setSignatureRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? { ...req, status: 'sent' as const, progress: 25 }
          : req
      )
    );
    toast.success('Document sent for signature');
  };

  const resendReminder = (requestId: string) => {
    toast.success('Reminder sent to recipient');
  };

  const downloadDocument = (requestId: string) => {
    toast.success('Document downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          <h2 className="text-2xl font-bold">E-Signature Management</h2>
        </div>
        <Button onClick={() => setIsCreatingRequest(true)}>
          <PenTool className="h-4 w-4 mr-2" />
          New Signature Request
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {signatureRequests.filter(r => r.status === 'sent').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Signatures</p>
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
                <p className="text-2xl font-bold">
                  {signatureRequests.filter(r => r.status === 'signed' || r.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {signatureRequests.filter(r => r.status === 'viewed').length}
                </p>
                <p className="text-sm text-muted-foreground">Viewed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">3.2</p>
                <p className="text-sm text-muted-foreground">Avg Days to Sign</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Request */}
      {isCreatingRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Create Signature Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentName">Document Name *</Label>
                <Input
                  id="documentName"
                  value={newRequest.documentName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, documentName: e.target.value }))}
                  placeholder="Enter document name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email *</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={newRequest.recipientEmail}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, recipientEmail: e.target.value }))}
                  placeholder="signer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name</Label>
                <Input
                  id="recipientName"
                  value={newRequest.recipientName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, recipientName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDays">Expires in (days)</Label>
                <Input
                  id="expiryDays"
                  type="number"
                  value={newRequest.expiryDays}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, expiryDays: parseInt(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message</Label>
              <Textarea
                id="message"
                value={newRequest.message}
                onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message for the signer"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createSignatureRequest}>
                Create Request
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingRequest(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {signatureRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium">{request.documentName}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {request.recipient.name} ({request.recipient.email})
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(request.status)} className="flex items-center gap-1">
                      {getStatusIcon(request.status)}
                      {request.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Signing Progress</span>
                    <span>{request.progress}%</span>
                  </div>
                  <Progress value={request.progress} className="h-2" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {request.status === 'draft' && (
                    <Button size="sm" onClick={() => sendForSignature(request.id)}>
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                  )}
                  {(request.status === 'sent' || request.status === 'viewed') && (
                    <Button variant="outline" size="sm" onClick={() => resendReminder(request.id)}>
                      <Mail className="h-3 w-3 mr-1" />
                      Remind
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => downloadDocument(request.id)}>
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm">
                    <History className="h-3 w-3 mr-1" />
                    History
                  </Button>
                </div>

                {/* Signed Information */}
                {request.signedAt && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Signed by {request.recipient.name} on{' '}
                        {new Date(request.signedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
