
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Workflow, Plus, Play, Pause, Settings, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: string;
  actions: number;
  lastRun: string;
  nextRun?: string;
  runsCount: number;
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: '1',
    name: 'Document Auto-Analysis',
    description: 'Automatically analyze uploaded bankruptcy forms',
    status: 'active',
    trigger: 'Document Upload',
    actions: 5,
    lastRun: '2024-01-15 14:30',
    nextRun: 'On Upload',
    runsCount: 142
  },
  {
    id: '2',
    name: 'Risk Assessment Notification',
    description: 'Send alerts when high-risk issues are detected',
    status: 'active',
    trigger: 'Risk Detection',
    actions: 3,
    lastRun: '2024-01-15 12:15',
    nextRun: 'On Detection',
    runsCount: 28
  },
  {
    id: '3',
    name: 'Weekly Client Reports',
    description: 'Generate and send weekly reports to clients',
    status: 'paused',
    trigger: 'Schedule',
    actions: 4,
    lastRun: '2024-01-08 09:00',
    nextRun: 'Monday 9:00 AM',
    runsCount: 16
  },
  {
    id: '4',
    name: 'Task Assignment',
    description: 'Auto-assign tasks based on form type and expertise',
    status: 'draft',
    trigger: 'Task Creation',
    actions: 2,
    lastRun: 'Never',
    runsCount: 0
  }
];

export const WorkflowManagement = () => {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleStatusChange = (workflowId: string, newStatus: WorkflowItem['status']) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId ? { ...workflow, status: newStatus } : workflow
    ));
    toast.success('Workflow status updated');
  };

  const handleRunWorkflow = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    toast.success(`Running workflow: ${workflow?.name}`);
  };

  const filteredWorkflows = filterStatus === 'all' 
    ? workflows 
    : workflows.filter(workflow => workflow.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-3 w-3" />;
      case 'paused': return <Pause className="h-3 w-3" />;
      case 'draft': return <Settings className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Workflows</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Workflow name" />
              <Input placeholder="Description" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upload">Document Upload</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="risk">Risk Detection</SelectItem>
                  <SelectItem value="task">Task Creation</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => {
                toast.success('Workflow created successfully');
                setIsCreateOpen(false);
              }} className="w-full">
                Create Workflow
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Workflow className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{workflows.length}</div>
                <div className="text-sm text-muted-foreground">Total Workflows</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'active').length}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{workflows.filter(w => w.status === 'paused').length}</div>
                <div className="text-sm text-muted-foreground">Paused</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{workflows.reduce((sum, w) => sum + w.runsCount, 0)}</div>
                <div className="text-sm text-muted-foreground">Total Runs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow List */}
      <div className="space-y-4">
        {filteredWorkflows.map(workflow => (
          <Card key={workflow.id}>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{workflow.name}</h3>
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1 capitalize">{workflow.status}</span>
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{workflow.description}</p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Trigger:</span> {workflow.trigger}
                    </div>
                    <div>
                      <span className="font-medium">Actions:</span> {workflow.actions}
                    </div>
                    <div>
                      <span className="font-medium">Last Run:</span> {workflow.lastRun}
                    </div>
                    <div>
                      <span className="font-medium">Total Runs:</span> {workflow.runsCount}
                    </div>
                  </div>
                  {workflow.nextRun && (
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Next Run:</span> {workflow.nextRun}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {workflow.status === 'active' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(workflow.id, 'paused')}
                    >
                      <Pause className="h-3 w-3 mr-1" />
                      Pause
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(workflow.id, 'active')}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunWorkflow(workflow.id)}
                    disabled={workflow.status === 'draft'}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Run
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
