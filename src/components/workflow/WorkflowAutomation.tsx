
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Pause, 
  Settings, 
  Plus, 
  Trash2, 
  Clock, 
  Users, 
  FileText,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay';
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'document' | 'client' | 'compliance' | 'payment';
  isActive: boolean;
  lastRun?: string;
  runCount: number;
  steps: WorkflowStep[];
}

export const WorkflowAutomation = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([
    {
      id: 'wf1',
      name: 'Document Processing Pipeline',
      description: 'Automatically process and categorize uploaded documents',
      category: 'document',
      isActive: true,
      lastRun: '2025-01-10T09:30:00Z',
      runCount: 156,
      steps: []
    },
    {
      id: 'wf2',
      name: 'Client Onboarding Automation',
      description: 'Complete client setup and initial document collection',
      category: 'client',
      isActive: true,
      lastRun: '2025-01-09T16:45:00Z',
      runCount: 43,
      steps: []
    },
    {
      id: 'wf3',
      name: 'Compliance Monitoring',
      description: 'Monitor deadlines and compliance requirements',
      category: 'compliance',
      isActive: false,
      runCount: 0,
      steps: []
    }
  ]);

  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    category: 'document' as const
  });

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(prev => 
      prev.map(wf => 
        wf.id === workflowId 
          ? { ...wf, isActive: !wf.isActive }
          : wf
      )
    );
    toast.success('Workflow status updated');
  };

  const createWorkflow = () => {
    if (!newWorkflow.name.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    const workflow: WorkflowTemplate = {
      id: `wf${Date.now()}`,
      name: newWorkflow.name,
      description: newWorkflow.description,
      category: newWorkflow.category,
      isActive: false,
      runCount: 0,
      steps: []
    };

    setWorkflows(prev => [...prev, workflow]);
    setNewWorkflow({ name: '', description: '', category: 'document' });
    setIsCreating(false);
    toast.success('Workflow created successfully');
  };

  const deleteWorkflow = (workflowId: string) => {
    setWorkflows(prev => prev.filter(wf => wf.id !== workflowId));
    toast.success('Workflow deleted');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
      case 'compliance': return <AlertTriangle className="h-4 w-4" />;
      case 'payment': return <CheckCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-yellow-100 text-yellow-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Workflow Automation</h2>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{workflows.filter(w => w.isActive).length}</p>
                <p className="text-sm text-muted-foreground">Active Workflows</p>
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
                  {workflows.reduce((acc, w) => acc + w.runCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Executions</p>
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
                <p className="text-2xl font-bold">847</p>
                <p className="text-sm text-muted-foreground">Hours Saved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Workflow Modal */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workflowName">Workflow Name</Label>
                <Input
                  id="workflowName"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workflow name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflowCategory">Category</Label>
                <Select
                  value={newWorkflow.category}
                  onValueChange={(value: any) => setNewWorkflow(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workflowDescription">Description</Label>
              <Textarea
                id="workflowDescription"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this workflow does"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createWorkflow}>Create Workflow</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflows List */}
      <div className="grid gap-6">
        {workflows.map((workflow) => (
          <Card key={workflow.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(workflow.category)}`}>
                    {getCategoryIcon(workflow.category)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={workflow.isActive ? "default" : "secondary"}>
                    {workflow.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWorkflow(workflow.id)}
                  >
                    {workflow.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWorkflow(workflow.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteWorkflow(workflow.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">Executions</p>
                  <p className="text-muted-foreground">{workflow.runCount}</p>
                </div>
                <div>
                  <p className="font-medium">Last Run</p>
                  <p className="text-muted-foreground">
                    {workflow.lastRun 
                      ? new Date(workflow.lastRun).toLocaleDateString()
                      : 'Never'
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-muted-foreground capitalize">{workflow.category}</p>
                </div>
              </div>
              
              {/* Workflow Steps Preview */}
              <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm font-medium">Workflow Steps</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Trigger
                  </div>
                  <ArrowRight className="h-3 w-3" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Process
                  </div>
                  <ArrowRight className="h-3 w-3" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Complete
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <h4 className="font-medium">Auto Document Classification</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically categorize and process uploaded documents
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-green-500" />
                <h4 className="font-medium">Client Communication</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Send automated updates and reminders to clients
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <h4 className="font-medium">Deadline Monitoring</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Track important dates and send early warnings
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Task Assignment</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Intelligently assign tasks based on workload and expertise
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
