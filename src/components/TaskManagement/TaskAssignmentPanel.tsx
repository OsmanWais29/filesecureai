
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Brain, 
  Search, 
  UserPlus, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { EnhancedTask } from '@/hooks/useEnhancedTaskManagement';

interface TaskAssignmentPanelProps {
  tasks: EnhancedTask[];
  onAssignTask: (taskId: string, assigneeId: string, notes?: string) => void;
}

// Mock user data - in real app, this would come from your user management system
const mockUsers = [
  {
    id: 'user-1',
    name: 'Sarah Thompson',
    email: 'sarah.thompson@example.com',
    role: 'Senior Trustee',
    expertise: ['Form 47', 'Consumer Proposals', 'BIA Compliance'],
    workload: 12,
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'Trustee',
    expertise: ['Form 31', 'Proof of Claims', 'Asset Valuation'],
    workload: 8,
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'user-3',
    name: 'Jennifer Rodriguez',
    email: 'jennifer.rodriguez@example.com',
    role: 'Junior Trustee',
    expertise: ['Document Review', 'Client Communication'],
    workload: 5,
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'user-4',
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'Compliance Officer',
    expertise: ['BIA Compliance', 'OSB Regulations', 'Risk Assessment'],
    workload: 15,
    avatar: '/api/placeholder/32/32'
  }
];

export const TaskAssignmentPanel: React.FC<TaskAssignmentPanelProps> = ({
  tasks,
  onAssignTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');

  const unassignedTasks = tasks.filter(task => !task.assigned_to);
  const assignedTasks = tasks.filter(task => task.assigned_to);

  const filteredUnassignedTasks = unassignedTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.form_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkloadColor = (workload: number) => {
    if (workload <= 5) return 'text-green-600';
    if (workload <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendedAssignee = (task: EnhancedTask) => {
    // Simple AI-like recommendation based on form number and expertise
    if (task.form_number?.includes('47') || task.form_number?.includes('66')) {
      return mockUsers.find(user => user.expertise.includes('Consumer Proposals'));
    }
    if (task.form_number?.includes('31') || task.form_number?.includes('32')) {
      return mockUsers.find(user => user.expertise.includes('Proof of Claims'));
    }
    if (task.category === 'compliance') {
      return mockUsers.find(user => user.expertise.includes('BIA Compliance'));
    }
    // Default to least loaded user
    return mockUsers.reduce((prev, current) => 
      prev.workload < current.workload ? prev : current
    );
  };

  const handleBulkAssign = () => {
    if (!selectedUser) return;
    
    filteredUnassignedTasks.forEach(task => {
      onAssignTask(task.id, selectedUser, assignmentNotes);
    });
    
    setSelectedUser('');
    setAssignmentNotes('');
  };

  const handleSmartAssign = () => {
    unassignedTasks.forEach(task => {
      const recommendedUser = getRecommendedAssignee(task);
      if (recommendedUser) {
        onAssignTask(task.id, recommendedUser.id, 'AI-recommended assignment');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Task Assignment</h2>
          <p className="text-muted-foreground">Manage task assignments and workload distribution</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSmartAssign} variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            Smart Assign
          </Button>
          <Button onClick={handleBulkAssign} disabled={!selectedUser} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Bulk Assign
          </Button>
        </div>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockUsers.map(user => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.role}</div>
                  <div className={`text-sm font-medium ${getWorkloadColor(user.workload)}`}>
                    {user.workload} active tasks
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Expertise</div>
                <div className="flex flex-wrap gap-1">
                  {user.expertise.slice(0, 2).map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {user.expertise.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.expertise.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignment Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Assignment Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user..." />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {user.workload} tasks
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment Notes</label>
              <Input
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                placeholder="Optional notes..."
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Tasks</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search unassigned tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unassigned Tasks ({filteredUnassignedTasks.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUnassignedTasks.map(task => {
              const recommendedUser = getRecommendedAssignee(task);
              
              return (
                <div key={task.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {task.description?.substring(0, 100)}...
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{task.priority}</Badge>
                        <Badge variant="secondary">{task.category}</Badge>
                        {task.form_number && (
                          <Badge variant="outline">{task.form_number}</Badge>
                        )}
                        {task.estimated_duration && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_duration}m
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {recommendedUser && (
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">AI Recommends:</div>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={recommendedUser.avatar} alt={recommendedUser.name} />
                              <AvatarFallback className="text-xs">
                                {recommendedUser.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{recommendedUser.name}</span>
                          </div>
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => recommendedUser && onAssignTask(task.id, recommendedUser.id)}
                        className="gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {filteredUnassignedTasks.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All tasks assigned!</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No unassigned tasks match your search criteria.' : 'Great job! All tasks have been assigned to team members.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Assignment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{assignedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{unassignedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Unassigned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((assignedTasks.length / tasks.length) * 100) || 0}%
              </div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
