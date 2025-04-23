
import React, { useState } from 'react';
import { useDebug } from '../hooks/useDebug';
import { Button } from '@/components/ui/button';
import { Loader2, Bug, ChevronDown, ChevronRight, Shield, FileCheck, Database } from 'lucide-react';
import { ConnectionTest } from './ConnectionTest';

interface DiagnosticToolProps {
  storagePath: string | null;
  expanded?: boolean;
}

export const DiagnosticTool: React.FC<DiagnosticToolProps> = ({
  storagePath,
  expanded = false
}) => {
  const { runDiagnostics, isLoading, results } = useDebug();
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleRunDiagnostics = async () => {
    await runDiagnostics(storagePath);
  };

  return (
    <div className="border rounded-lg bg-muted/20 overflow-hidden">
      <div 
        className="p-3 bg-muted/30 border-b flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          <h3 className="text-sm font-medium">Diagnostic Tools</h3>
        </div>
        {isExpanded ? 
          <ChevronDown className="h-4 w-4" /> : 
          <ChevronRight className="h-4 w-4" />
        }
      </div>
      
      {isExpanded && (
        <div className="p-3">
          <div className="mb-4">
            <ConnectionTest />
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Document Diagnostics</p>
            <div className="flex items-center mb-3">
              <Button
                onClick={handleRunDiagnostics}
                size="sm"
                disabled={isLoading || !storagePath}
                className="flex items-center"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bug className="mr-2 h-4 w-4" />
                )}
                {isLoading ? "Running..." : "Run Diagnostics"}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground mb-3">
              Storage Path: <code className="px-1 bg-muted rounded">{storagePath || 'Not specified'}</code>
            </div>
            
            {results && (
              <div className={`border rounded-md p-3 ${results.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className="font-medium text-sm mb-2">
                  {results.success ? '✅ All checks passed' : '⚠️ Some checks failed'}
                </p>
                <p className="text-sm mb-3">{results.message}</p>
                
                <div className="space-y-3">
                  <div className={`p-2 rounded-md ${results.details.auth?.isAuthenticated ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="font-medium">Authentication:</span>
                      <span className="ml-1">
                        {results.details.auth?.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                      </span>
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded-md ${results.details.storage?.hasAccess ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2" />
                      <span className="font-medium">Storage Access:</span>
                      <span className="ml-1">
                        {results.details.storage?.hasAccess ? 'Access Granted' : 'Access Denied'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs">
                      {results.details.storage?.buckets && 
                       Array.isArray(results.details.storage.buckets) && 
                       results.details.storage.buckets.length > 0 ? (
                        <div>
                          <p>Available buckets:</p>
                          <ul className="list-disc pl-4 mt-1">
                            {results.details.storage.buckets.map((bucket: any, index: number) => (
                              <li key={index}>{bucket.name}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p>No buckets available or access denied</p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`p-2 rounded-md ${results.details.document?.pathExists ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 mr-2" />
                      <span className="font-medium">Document Access:</span>
                      <span className="ml-1">
                        {results.details.document?.pathExists ? 'Found' : 'Not Found'}
                      </span>
                    </div>
                    {results.details.document?.error && (
                      <p className="text-xs mt-1 text-red-600">Error: {results.details.document.error}</p>
                    )}
                    {results.details.document?.url && (
                      <details className="mt-1 text-xs">
                        <summary className="cursor-pointer">View document URL</summary>
                        <div className="mt-1 p-1 bg-white rounded overflow-x-auto">
                          <code className="break-all">{results.details.document.url}</code>
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
