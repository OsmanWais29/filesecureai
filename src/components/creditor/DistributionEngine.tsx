import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calculator,
  DollarSign,
  Shield,
  Star,
  FileText,
  Download,
  CheckCircle2,
  TrendingUp,
  PieChart,
  ArrowRight,
  Banknote,
} from "lucide-react";
import { Distribution, CreditorDistribution } from "@/types/creditor";

interface DistributionEngineProps {
  distribution?: Distribution;
  onCalculateDistribution: () => void;
  onApproveDistribution: () => void;
  onGenerateForm12: () => void;
  onExportReport: () => void;
}

export function DistributionEngine({
  distribution,
  onCalculateDistribution,
  onApproveDistribution,
  onGenerateForm12,
  onExportReport,
}: DistributionEngineProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (!distribution) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Distribution Calculated</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Calculate the distribution based on BIA s.136 priority rules to determine 
            how funds will be distributed to creditors.
          </p>
          <Button onClick={onCalculateDistribution}>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Distribution
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalDistributed = distribution.secured_distribution + 
    distribution.preferred_distribution + 
    distribution.unsecured_distribution;

  return (
    <div className="space-y-6">
      {/* Distribution Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Distribution Priority Engine
              </CardTitle>
              <CardDescription className="mt-1">
                BIA s.136 compliant distribution calculation
              </CardDescription>
            </div>
            <Badge
              variant={
                distribution.status === 'final' ? 'default' :
                distribution.status === 'distributed' ? 'secondary' :
                distribution.status === 'approved' ? 'outline' : 'outline'
              }
              className="capitalize"
            >
              {distribution.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {distribution.status === 'draft' && (
              <Button onClick={onApproveDistribution}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Distribution
              </Button>
            )}
            <Button variant="outline" onClick={onGenerateForm12}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Form 12
            </Button>
            <Button variant="outline" onClick={onExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receipts & Disbursements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Receipts & Disbursements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Receipts</span>
                <span className="font-mono font-semibold text-green-600">
                  {formatCurrency(distribution.total_receipts)}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Trustee Fees</span>
                  <span className="font-mono text-red-500">
                    -{formatCurrency(distribution.trustee_fees)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">OSB Levy</span>
                  <span className="font-mono text-red-500">
                    -{formatCurrency(distribution.levy_amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sales Tax</span>
                  <span className="font-mono text-red-500">
                    -{formatCurrency(distribution.sales_tax)}
                  </span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="font-medium">Available for Distribution</span>
                <span className="font-mono font-bold">
                  {formatCurrency(distribution.total_receipts - distribution.total_disbursements)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribution Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>Secured Creditors</span>
                </div>
                <span className="font-mono font-semibold">
                  {formatCurrency(distribution.secured_distribution)}
                </span>
              </div>
              <Progress 
                value={(distribution.secured_distribution / totalDistributed) * 100} 
                className="h-2 bg-blue-100"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>Preferred Creditors</span>
                </div>
                <span className="font-mono font-semibold">
                  {formatCurrency(distribution.preferred_distribution)}
                </span>
              </div>
              <Progress 
                value={(distribution.preferred_distribution / totalDistributed) * 100} 
                className="h-2 bg-amber-100"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>Unsecured Creditors</span>
                </div>
                <span className="font-mono font-semibold">
                  {formatCurrency(distribution.unsecured_distribution)}
                </span>
              </div>
              <Progress 
                value={(distribution.unsecured_distribution / totalDistributed) * 100} 
                className="h-2"
              />
            </div>

            <Separator />

            <div className="p-4 rounded-lg bg-primary/10">
              <div className="flex items-center justify-between">
                <span className="font-medium">Dividend Rate</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPercentage(distribution.dividend_rate)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cents on the dollar for unsecured creditors
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribution Details</CardTitle>
          <CardDescription>
            Individual creditor distributions based on BIA s.136 priority
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Creditor</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Claim Amount</TableHead>
                <TableHead className="text-right">Distribution</TableHead>
                <TableHead className="text-right">Dividend %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distribution.distributions.map((dist, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{dist.creditor_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {dist.priority === 'secured' && <Shield className="h-3 w-3 mr-1 text-blue-500" />}
                      {dist.priority === 'preferred' && <Star className="h-3 w-3 mr-1 text-amber-500" />}
                      {dist.priority === 'unsecured' && <DollarSign className="h-3 w-3 mr-1" />}
                      {dist.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(dist.claim_amount)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-600">
                    {formatCurrency(dist.distribution_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPercentage(dist.dividend_percentage)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* BIA Priority Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">BIA s.136 Priority Order</CardTitle>
          <CardDescription>
            Distribution follows the statutory priority order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
              1. Secured Claims
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
              2. Preferred Claims
            </Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">
              3. Ordinary Unsecured
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Preferred claims include: wages (s.136(1)(d)), source deductions (s.136(1)(d.1)), 
            support payments (s.136(1)(d.02)), municipal taxes, and certain other statutory priorities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
