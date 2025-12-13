
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Scale,
  DollarSign,
  ExternalLink,
  X,
} from "lucide-react";
import { SAFAModule } from "./SAFANavigationSidebar";

interface ContextItem {
  type: "creditor" | "claim" | "form" | "alert" | "document";
  title: string;
  data: Record<string, any>;
}

interface SAFAContextDrawerProps {
  activeModule: SAFAModule;
  contextItem: ContextItem | null;
  onClose: () => void;
}

export const SAFAContextDrawer: React.FC<SAFAContextDrawerProps> = ({
  activeModule,
  contextItem,
  onClose,
}) => {
  const renderModuleContext = () => {
    switch (activeModule) {
      case "overview":
        return <OverviewContext />;
      case "creditors":
        return <CreditorsContext />;
      case "claims":
        return <ClaimsContext />;
      case "documents":
        return <DocumentsContext />;
      default:
        return <DefaultContext module={activeModule} />;
    }
  };

  return (
    <div className="w-72 border-l bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Context</h3>
        {contextItem && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {contextItem ? (
            <ContextItemDetail item={contextItem} />
          ) : (
            renderModuleContext()
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const ContextItemDetail: React.FC<{ item: ContextItem }> = ({ item }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm flex items-center gap-2">
        {item.type === "creditor" && <Users className="h-4 w-4" />}
        {item.type === "claim" && <Scale className="h-4 w-4" />}
        {item.type === "form" && <FileText className="h-4 w-4" />}
        {item.type === "alert" && <AlertTriangle className="h-4 w-4 text-destructive" />}
        {item.title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-sm space-y-2">
      {Object.entries(item.data).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="text-muted-foreground capitalize">{key}:</span>
          <span className="font-medium">{String(value)}</span>
        </div>
      ))}
      <Button size="sm" className="w-full mt-3">
        <ExternalLink className="h-3 w-3 mr-1" />
        View Details
      </Button>
    </CardContent>
  </Card>
);

const OverviewContext: React.FC = () => (
  <>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">SAFA Signals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-xs">CRA claim discrepancy detected</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-md">
          <Clock className="h-4 w-4 text-yellow-500" />
          <span className="text-xs">Form 31 due in 3 days</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-md">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-xs">All proofs of claim verified</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Creditors:</span>
          <span className="font-medium">12</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Claims:</span>
          <span className="font-medium">$147,523.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Estate Assets:</span>
          <span className="font-medium">$89,200.00</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Est. Dividend:</span>
          <span className="font-medium text-green-600">60.5%</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Key Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Form 31 Filing</span>
          <Badge variant="destructive">3 days</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Meeting of Creditors</span>
          <Badge variant="secondary">12 days</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Distribution Report</span>
          <Badge variant="outline">30 days</Badge>
        </div>
      </CardContent>
    </Card>
  </>
);

const CreditorsContext: React.FC = () => (
  <>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Creditor Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Secured:</span>
          <span className="font-medium">$45,000.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Preferred:</span>
          <span className="font-medium">$12,523.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Unsecured:</span>
          <span className="font-medium">$90,000.00</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Action Required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded-md">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-xs">2 missing proofs of claim</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-xs">1 claim under dispute</span>
        </div>
      </CardContent>
    </Card>
  </>
);

const ClaimsContext: React.FC = () => (
  <>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Claims Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Verified:</span>
          <Badge variant="default" className="bg-green-500">8</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pending:</span>
          <Badge variant="secondary">3</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Disputed:</span>
          <Badge variant="destructive">1</Badge>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">BIA Priority</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-xs">
        <div className="p-2 bg-accent rounded">s.136(1)(a) - Secured claims</div>
        <div className="p-2 bg-accent rounded">s.136(1)(b) - Trust claims</div>
        <div className="p-2 bg-accent rounded">s.136(1)(d) - Wages</div>
        <div className="p-2 bg-accent rounded">s.136(1)(j) - CRA claims</div>
      </CardContent>
    </Card>
  </>
);

const DocumentsContext: React.FC = () => (
  <>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer">
          <FileText className="h-4 w-4 text-blue-500" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">Statement of Affairs</div>
            <div className="text-xs text-muted-foreground">2 hours ago</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer">
          <FileText className="h-4 w-4 text-green-500" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">Form 47</div>
            <div className="text-xs text-muted-foreground">1 day ago</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer">
          <FileText className="h-4 w-4 text-orange-500" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">CRA Proof of Claim</div>
            <div className="text-xs text-muted-foreground">3 days ago</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </>
);

const DefaultContext: React.FC<{ module: string }> = ({ module }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm capitalize">{module} Context</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">
        Ask SAFA about {module} to see relevant context here.
      </p>
    </CardContent>
  </Card>
);
