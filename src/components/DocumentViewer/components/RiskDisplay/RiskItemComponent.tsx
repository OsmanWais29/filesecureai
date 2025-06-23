
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Clock, User, MapPin } from 'lucide-react';
import { RiskFactor } from './RiskDisplayTypes';
import { getRiskColor, getRiskIcon } from './RiskUtilities';

interface RiskItemComponentProps {
  risk: RiskFactor;
  index: number;
  isExpanded: boolean;
  onToggleExpansion: (index: number) => void;
  onJumpToField?: (fieldLocation: string) => void;
  onViewBIAReference?: (reference: string) => void;
  onCreateTask?: (risk: RiskFactor) => void;
}

export const RiskItemComponent = ({
  risk,
  index,
  isExpanded,
  onToggleExpansion,
  onJumpToField,
  onViewBIAReference,
  onCreateTask
}: RiskItemComponentProps) => {
  const RiskIcon = getRiskIcon(risk.severity);

  return (
    <div 
      className={`p-4 border rounded-lg transition-all ${
        risk.severity === 'high' 
          ? 'border-red-200 bg-red-50' 
          : risk.severity === 'medium'
          ? 'border-yellow-200 bg-yellow-50'
          : 'border-green-200 bg-green-50'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <RiskIcon className={`h-4 w-4 ${
              risk.severity === 'high' 
                ? 'text-red-500' 
                : risk.severity === 'medium'
                ? 'text-yellow-500'
                : 'text-green-500'
            }`} />
            <h4 className="font-medium text-sm">{risk.type}</h4>
            <Badge variant={getRiskColor(risk.severity)}>
              {risk.severity.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {risk.description}
          </p>

          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <span className="text-sm font-medium">Recommendation:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {risk.recommendation}
                </p>
              </div>
              
              {risk.biaReference && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">BIA Reference:</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => onViewBIAReference?.(risk.biaReference)}
                  >
                    {risk.biaReference}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              )}
              
              {risk.fieldLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Field Location:</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-blue-600"
                    onClick={() => onJumpToField?.(risk.fieldLocation)}
                  >
                    {risk.fieldLocation}
                  </Button>
                </div>
              )}
              
              {risk.deadline && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Deadline:</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(risk.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {risk.assignedTo && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Assigned to:</span>
                  <span className="text-sm text-muted-foreground">
                    {risk.assignedTo}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpansion(index)}
            className="text-xs"
          >
            {isExpanded ? 'Less' : 'More'}
          </Button>
          
          {onCreateTask && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCreateTask(risk)}
              className="text-xs"
            >
              Create Task
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
