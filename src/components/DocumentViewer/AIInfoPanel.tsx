
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Info, Code, Webhook } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIInfoPanelProps {
  analysisData: any;
  debugInfo?: any;
}

export const AIInfoPanel: React.FC<AIInfoPanelProps> = ({
  analysisData,
  debugInfo
}) => {
  const hasDebugInfo = debugInfo && Object.keys(debugInfo).length > 0;
  const [isOpen, setIsOpen] = React.useState(false);
  
  const getModelInfo = () => {
    if (debugInfo?.model) return debugInfo.model;
    if (analysisData?.ai_model) return analysisData.ai_model;
    return "DeepSeek";
  };
  
  const getTimingInfo = () => {
    if (debugInfo?.timing_ms) {
      return `${(debugInfo.timing_ms / 1000).toFixed(2)}s`;
    }
    return "Unknown";
  };
  
  const getTokenInfo = () => {
    if (debugInfo?.tokens) {
      return `${debugInfo.tokens.input || 0} in / ${debugInfo.tokens.output || 0} out`;
    }
    return "Unknown";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span>AI Processing Info</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">AI Model</p>
              <p className="text-sm font-medium">{getModelInfo()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Processing Time</p>
              <p className="text-sm font-medium">{getTimingInfo()}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Extraction Details</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">
                {analysisData?.extracted_info?.formNumber || 'Unknown'} Form
              </Badge>
              <Badge variant="outline" className="text-xs">
                {analysisData?.extracted_info?.formType || 'Standard'} Type
              </Badge>
              <Badge variant="outline" className="text-xs">
                {getTokenInfo()} Tokens
              </Badge>
            </div>
          </div>
          
          {hasDebugInfo && (
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="w-full space-y-2"
            >
              <Separator />
              
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="flex w-full justify-between p-1">
                  <div className="flex items-center">
                    <Code className="h-4 w-4 mr-2" />
                    <span className="text-xs">Technical Details</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {isOpen ? 'Hide' : 'Show'}
                  </span>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="space-y-2">
                    {Object.entries(debugInfo).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs font-medium">{key}:</p>
                        <pre className="text-xs text-muted-foreground overflow-auto max-w-full">
                          {typeof value === 'object' 
                            ? JSON.stringify(value, null, 2) 
                            : String(value)
                          }
                        </pre>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="mt-2 text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  <span>This information is useful for debugging AI processing issues.</span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Webhook className="h-3 w-3" />
            <span>Powered by Supabase Edge Functions</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
