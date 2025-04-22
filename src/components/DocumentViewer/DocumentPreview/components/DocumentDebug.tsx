
import React, { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

interface DocumentDebugProps {
  fileUrl: string | null;
  visible?: boolean;
  onResult?: (diagnostics: DocumentDiagnostics) => void;
}

export interface DocumentDiagnostics {
  isValidUrl: boolean;
  urlString: string | null;
  contentType: string | null;
  contentLength: string | null;
  statusCode: number | null;
  isAccessible: boolean;
  error: string | null;
  timestamp: number;
}

export const DocumentDebug: React.FC<DocumentDebugProps> = ({ 
  fileUrl, 
  visible = false,
  onResult 
}) => {
  const [diagnostics, setDiagnostics] = useState<DocumentDiagnostics>({
    isValidUrl: false,
    urlString: null,
    contentType: null,
    contentLength: null,
    statusCode: null,
    isAccessible: false,
    error: null,
    timestamp: Date.now()
  });
  
  const [logs, setLogs] = useState<{level: 'info' | 'error' | 'warn', message: string}[]>([]);
  
  const addLog = (level: 'info' | 'error' | 'warn', message: string) => {
    console[level](`DocumentDebug: ${message}`);
    setLogs(prev => [...prev, { level, message }]);
  };
  
  useEffect(() => {
    if (!fileUrl) {
      addLog('error', 'No file URL provided');
      setDiagnostics(prev => ({
        ...prev,
        isValidUrl: false,
        urlString: null,
        error: 'No file URL provided',
        timestamp: Date.now()
      }));
      if (onResult) onResult({
        ...diagnostics,
        isValidUrl: false,
        urlString: null, 
        error: 'No file URL provided',
        timestamp: Date.now()
      });
      return;
    }
    
    addLog('info', '=== PDF DEBUG START ===');
    addLog('info', `File URL: ${fileUrl}`);
    
    let isValidUrl = false;
    let urlObj: URL | null = null;
    
    // Test if URL is valid
    try {
      urlObj = new URL(fileUrl);
      isValidUrl = true;
      addLog('info', 'URL format is valid');
      addLog('info', `Protocol: ${urlObj.protocol}`);
      addLog('info', `Host: ${urlObj.hostname}`);
      addLog('info', `Path: ${urlObj.pathname}`);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error';
      addLog('error', `INVALID URL FORMAT: ${errMsg}`);
      
      setDiagnostics(prev => ({
        ...prev,
        isValidUrl: false,
        urlString: fileUrl,
        error: `Invalid URL format: ${errMsg}`,
        timestamp: Date.now()
      }));
      
      if (onResult) onResult({
        ...diagnostics,
        isValidUrl: false,
        urlString: fileUrl,
        error: `Invalid URL format: ${errMsg}`,
        timestamp: Date.now()
      });
      return;
    }
    
    // Test if the file is accessible
    const testFile = async () => {
      try {
        addLog('info', 'Fetching file headers...');
        
        const response = await fetch(fileUrl, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
          },
          credentials: 'include',
        });
        
        const contentType = response.headers.get('Content-Type');
        const contentLength = response.headers.get('Content-Length');
        const statusCode = response.status;
        
        addLog('info', `Response status: ${response.status}`);
        addLog('info', `Content-Type: ${contentType || 'Not available'}`);
        addLog('info', `Content-Length: ${contentLength || 'Not available'}`);
        
        const isPdf = contentType?.includes('pdf');
        if (isPdf) {
          addLog('info', '✓ Content confirmed as PDF');
        } else if (contentType) {
          addLog('warn', `⚠️ Content might not be PDF: ${contentType}`);
        }
        
        const newDiagnostics: DocumentDiagnostics = {
          isValidUrl,
          urlString: fileUrl,
          contentType,
          contentLength,
          statusCode,
          isAccessible: response.ok,
          error: response.ok ? null : `HTTP Error: ${response.status} ${response.statusText}`,
          timestamp: Date.now()
        };
        
        setDiagnostics(newDiagnostics);
        if (onResult) onResult(newDiagnostics);
        
        if (!response.ok) {
          addLog('error', `FILE ACCESS ERROR: ${response.status} ${response.statusText}`);
        } else {
          addLog('info', '✓ File is accessible');
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : 'Unknown error';
        addLog('error', `FETCH ERROR: ${errMsg}`);
        
        // Check for specific error types
        if (errMsg.includes('CORS')) {
          addLog('error', '⚠️ CORS issue detected - Document might need to be served with proper CORS headers');
        }
        if (errMsg.includes('NetworkError')) {
          addLog('error', '⚠️ Network error - Check internet connection or VPN settings');
        }
        
        const newDiagnostics: DocumentDiagnostics = {
          isValidUrl,
          urlString: fileUrl,
          contentType: null,
          contentLength: null,
          statusCode: null,
          isAccessible: false,
          error: `Fetch error: ${errMsg}`,
          timestamp: Date.now()
        };
        
        setDiagnostics(newDiagnostics);
        if (onResult) onResult(newDiagnostics);
      }
    };
    
    testFile();
    
    return () => {
      addLog('info', '=== PDF DEBUG END ===');
    };
  }, [fileUrl]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 w-96 max-w-[80vw] bg-white dark:bg-slate-900 rounded-lg shadow-lg border p-2 z-50">
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">PDF Debug Info</span>
        </div>
        <Badge variant={diagnostics.isAccessible ? "success" : "destructive"}>
          {diagnostics.isAccessible ? "Accessible" : "Not Accessible"}
        </Badge>
      </div>
      
      <ScrollArea className="h-64">
        <div className="p-2 space-y-2 text-sm">
          {logs.map((log, i) => (
            <div key={i} className={`flex items-start ${
              log.level === 'error' ? 'text-red-600' : 
              log.level === 'warn' ? 'text-amber-600' : 
              'text-slate-700 dark:text-slate-300'
            }`}>
              {log.level === 'error' && <XCircle className="h-3.5 w-3.5 mt-0.5 mr-1.5 flex-shrink-0" />}
              {log.level === 'warn' && <AlertTriangle className="h-3.5 w-3.5 mt-0.5 mr-1.5 flex-shrink-0" />}
              {log.level === 'info' && <Info className="h-3.5 w-3.5 mt-0.5 mr-1.5 flex-shrink-0" />}
              <pre className="whitespace-pre-wrap text-xs">{log.message}</pre>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
