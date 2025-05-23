
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Client, Task } from '@/types/client';
import { ensureClientType, ensureTaskType } from '@/utils/typeGuards';
import { format } from 'date-fns';

export default function ClientViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadClientData(id);
    }
  }, [id]);

  const loadClientData = async (clientId: string) => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockClientData = {
        id: clientId,
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        status: 'active',
        location: 'Toronto, ON',
        address: '123 Main Street',
        city: 'Toronto',
        province: 'Ontario',
        postalCode: 'M1A 1A1',
        company: 'ABC Corporation',
        occupation: 'Software Developer',
        mobilePhone: '(555) 987-6543',
        notes: 'Client is very responsive and cooperative.',
        last_interaction: new Date().toISOString(),
        engagement_score: 85,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
        metrics: {
          openTasks: 3,
          pendingDocuments: 2,
          urgentDeadlines: 1
        }
      };

      const validatedClient = ensureClientType(mockClientData);
      setClient(validatedClient);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock tasks - replace with actual API call
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Financial Assessment',
      description: 'Submit updated financial documents',
      status: 'pending',
      priority: 'high',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'trustee-1'
    },
    {
      id: '2',
      title: 'Schedule Counselling Session',
      description: 'Book mandatory counselling appointment',
      status: 'in_progress',
      priority: 'medium',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'trustee-1'
    },
    {
      id: '3',
      title: 'Review Proposal Terms',
      description: 'Review and approve consumer proposal terms',
      status: 'completed',
      priority: 'high',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'trustee-1'
    }
  ].map(ensureTaskType);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Client not found</h2>
          <p className="text-gray-600 mt-2">The requested client could not be found.</p>
          <Button onClick={() => navigate('/crm')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to CRM
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/crm')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Client ID: {client.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
            {client.status}
          </Badge>
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
        </div>
      </div>

      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-gray-400" />
              {client.email}
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-gray-400" />
              {client.phone}
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              {client.city}, {client.province}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Case Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Open Tasks:</span>
              <span className="font-medium">{client.metrics?.openTasks || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pending Documents:</span>
              <span className="font-medium">{client.metrics?.pendingDocuments || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Urgent Deadlines:</span>
              <span className="font-medium text-red-600">{client.metrics?.urgentDeadlines || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Score:</span>
              <span className="font-medium">{client.engagement_score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${client.engagement_score}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">
              Last interaction: {client.last_interaction ? format(new Date(client.last_interaction), 'MMM d, yyyy') : 'Never'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-500">Full Name</label>
                    <p>{client.name}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Status</label>
                    <p>{client.status}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Email</label>
                    <p>{client.email}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Phone</label>
                    <p>{client.phone}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Company</label>
                    <p>{client.company}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-500">Occupation</label>
                    <p>{client.occupation}</p>
                  </div>
                </div>
                
                {client.notes && (
                  <div>
                    <label className="font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm">{client.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle2 className={`h-5 w-5 ${
                        task.status === 'completed' ? 'text-green-500' : 'text-gray-300'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-600">
                          {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : 'No due date'}
                        </p>
                      </div>
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'default'} className="text-xs">
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tasks</CardTitle>
                <Button size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle2 className={`h-5 w-5 ${
                        task.status === 'completed' ? 'text-green-500' : 'text-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-gray-500">
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={task.priority === 'high' ? 'destructive' : 'default'}>
                        {task.priority}
                      </Badge>
                      <Badge variant={task.status === 'completed' ? 'secondary' : 'default'}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Documents</CardTitle>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No documents uploaded yet</p>
                <p className="text-sm">Upload documents to get started</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Client History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Client created</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(client.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
