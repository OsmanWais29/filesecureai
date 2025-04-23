
import React from 'react';
import { Button } from '@/components/ui/button';
import { useConnectionTest } from '../hooks/useConnectionTest';
import { ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

export const ConnectionTest: React.FC = () => {
  const { testConnection, isLoading, result } = useConnectionTest();

  return (
    <div className="p-4 border rounded-md bg-muted/20">
      <h3 className="text-lg font-medium mb-2">API Connection Test</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Test your Supabase API connection to verify API keys are working correctly.
      </p>
      
      <div className="mb-4">
        <Button 
          onClick={testConnection}
          disabled={isLoading}
          variant="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
      </div>
      
      {result && (
        <div className={`p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <div className="flex items-start">
            {result.success ? (
              <ShieldCheck className="h-5 w-5 mt-0.5 mr-2 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 mt-0.5 mr-2 text-red-600" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              {!result.success && result.details && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer">View error details</summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-slate-800 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
