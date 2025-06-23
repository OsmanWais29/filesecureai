
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Clock, 
  FileText, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Play,
  Settings
} from 'lucide-react';
import { TaskTemplate } from '@/hooks/useEnhancedTaskManagement';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WorkflowTemplatesProps {
  templates: TaskTemplate[];
  onGenerateFromTemplate: (templateId: string) => void;
}

export const WorkflowTemplates: React.FC<WorkflowTemplatesProps> = ({
  templates,
  onGenerateFromTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.form_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'compliance': return 'bg-blue-100 text-blue-800';
      case 'analysis': return 'bg-green-100 text-green-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'filing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Templates</h2>
          <p className="text-muted-foreground">Pre-built workflows for common BIA form processing</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Manage Templates
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="transition-all duration-200 hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => onGenerateFromTemplate(template.id)}
                  size="sm"
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Info */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getCategoryColor(template.category)}>
                  {template.category}
                </Badge>
                <Badge variant={getPriorityColor(template.priority)}>
                  {template.priority} priority
                </Badge>
                {template.form_number && (
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {template.form_number}
                  </Badge>
                )}
                {template.estimated_duration && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {template.estimated_duration} min
                  </Badge>
                )}
              </div>

              {/* BIA Section */}
              {template.bia_section && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <div className="text-xs font-medium text-blue-900">BIA Section</div>
                  <div className="text-sm text-blue-700">{template.bia_section}</div>
                </div>
              )}

              {/* Template Steps Preview */}
              {template.template_steps && template.template_steps.length > 0 && (
                <Collapsible 
                  open={expandedTemplate === template.id}
                  onOpenChange={(open) => setExpandedTemplate(open ? template.id : null)}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      <span>View Steps ({template.template_steps.length})</span>
                      {expandedTemplate === template.id ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {template.template_steps.map((step: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{step.title || step.name}</div>
                          {step.description && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {step.description}
                            </div>
                          )}
                          {step.estimated_duration && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Est. {step.estimated_duration} minutes
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Compliance Requirements */}
              {template.compliance_requirements && Object.keys(template.compliance_requirements).length > 0 && (
                <div className="p-2 bg-green-50 rounded-lg">
                  <div className="text-xs font-medium text-green-900 mb-1">Compliance Requirements</div>
                  <div className="text-xs text-green-700">
                    {Object.entries(template.compliance_requirements).map(([key, value]) => (
                      <div key={key}>{key}: {String(value)}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadline Rules */}
              {template.deadline_rules && Object.keys(template.deadline_rules).length > 0 && (
                <div className="p-2 bg-orange-50 rounded-lg">
                  <div className="text-xs font-medium text-orange-900 mb-1">Deadline Rules</div>
                  <div className="text-xs text-orange-700">
                    {Object.entries(template.deadline_rules).map(([key, value]) => (
                      <div key={key}>{key}: {String(value)}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No templates found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No workflow templates are available yet.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
