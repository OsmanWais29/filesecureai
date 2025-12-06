import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Scan, 
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DigitizationLog } from "./types";

const mockDigitizationLogs: DigitizationLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-12-06T14:00:00Z"),
    eventType: "paper_to_digital",
    operator: "J. Smith",
    scannerModel: "Fujitsu fi-7160",
    dpi: 300,
    ocrEngine: "Tesseract 5.3.1",
    dataLossCheck: true,
    readabilityScore: 98,
    resolution: "2480x3508",
    textExtractionCompleteness: 99,
    outcome: "success",
    details: "High-quality scan of creditor claim form with full text extraction"
  },
  {
    id: "2",
    timestamp: new Date("2025-12-06T11:30:00Z"),
    eventType: "pdf_to_xml",
    operator: "System",
    dataLossCheck: true,
    xmlSchemaCompliant: true,
    textExtractionCompleteness: 100,
    outcome: "success",
    details: "Converted Form 48 to OSB-compliant XML format"
  },
  {
    id: "3",
    timestamp: new Date("2025-12-06T09:15:00Z"),
    eventType: "quality_check",
    operator: "System",
    dataLossCheck: true,
    readabilityScore: 95,
    textExtractionCompleteness: 97,
    outcome: "success",
    details: "Automated quality verification passed all checks"
  },
  {
    id: "4",
    timestamp: new Date("2025-12-05T16:45:00Z"),
    eventType: "paper_to_digital",
    operator: "M. Johnson",
    scannerModel: "Canon DR-C225",
    dpi: 200,
    ocrEngine: "Tesseract 5.3.1",
    dataLossCheck: true,
    readabilityScore: 85,
    resolution: "1654x2339",
    textExtractionCompleteness: 92,
    outcome: "warning",
    details: "Lower resolution scan - acceptable but not optimal"
  },
  {
    id: "5",
    timestamp: new Date("2025-12-05T10:00:00Z"),
    eventType: "pdf_to_xml",
    operator: "System",
    dataLossCheck: true,
    xmlSchemaCompliant: false,
    textExtractionCompleteness: 88,
    outcome: "warning",
    details: "XML schema validation warning - manual review recommended"
  }
];

const eventTypeConfig = {
  paper_to_digital: { 
    icon: Scan, 
    label: "Paper → Digital", 
    color: "bg-blue-100 text-blue-700 border-blue-300" 
  },
  pdf_to_xml: { 
    icon: FileCode, 
    label: "PDF → XML", 
    color: "bg-purple-100 text-purple-700 border-purple-300" 
  },
  quality_check: { 
    icon: FileText, 
    label: "Quality Check", 
    color: "bg-green-100 text-green-700 border-green-300" 
  }
};

const outcomeConfig = {
  success: { icon: CheckCircle2, color: "text-green-600" },
  warning: { icon: AlertTriangle, color: "text-yellow-600" },
  blocked: { icon: XCircle, color: "text-red-600" },
  system_error: { icon: XCircle, color: "text-red-600" }
};

export const ConversionLogsTable = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Digitization & Conversion Logs</h2>
        </div>
        <Badge variant="outline" className="text-xs">
          {mockDigitizationLogs.length} events
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground">
        Directive 32 requires proof that digitization preserves readability, stability, and perennity.
        Conversion must not alter or lose information.
      </p>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Timestamp</TableHead>
              <TableHead>Event Type</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Scanner/Engine</TableHead>
              <TableHead>DPI/Resolution</TableHead>
              <TableHead>Data Loss Check</TableHead>
              <TableHead>Readability</TableHead>
              <TableHead>Text Extraction</TableHead>
              <TableHead>Outcome</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDigitizationLogs.map((log) => {
              const typeConfig = eventTypeConfig[log.eventType];
              const TypeIcon = typeConfig.icon;
              const outcomeConf = outcomeConfig[log.outcome];
              const OutcomeIcon = outcomeConf.icon;
              
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    {format(log.timestamp, "MMM dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", typeConfig.color)}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.operator}</TableCell>
                  <TableCell className="text-xs">
                    {log.scannerModel && (
                      <div>{log.scannerModel}</div>
                    )}
                    {log.ocrEngine && (
                      <div className="text-muted-foreground">{log.ocrEngine}</div>
                    )}
                    {!log.scannerModel && !log.ocrEngine && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {log.dpi && <div>{log.dpi} DPI</div>}
                    {log.resolution && (
                      <div className="text-muted-foreground">{log.resolution}</div>
                    )}
                    {!log.dpi && !log.resolution && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.dataLossCheck ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    {log.readabilityScore !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Progress value={log.readabilityScore} className="w-12 h-2" />
                        <span className="text-xs">{log.readabilityScore}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.textExtractionCompleteness !== undefined ? (
                      <div className="flex items-center gap-2">
                        <Progress value={log.textExtractionCompleteness} className="w-12 h-2" />
                        <span className="text-xs">{log.textExtractionCompleteness}%</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <OutcomeIcon className={cn("h-4 w-4", outcomeConf.color)} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 bg-muted/30 rounded-lg border">
        <h4 className="text-sm font-medium mb-2">Compliance Notes</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• All scans use OCR with confidence scoring for text extraction verification</li>
          <li>• PDF to XML conversions validate against OSB-defined XML schemas</li>
          <li>• Data loss checks confirm no information is lost during conversion</li>
          <li>• Quality checks ensure readability, stability, and perennity as per Directive 32</li>
        </ul>
      </div>
    </div>
  );
};
