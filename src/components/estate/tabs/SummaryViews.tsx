import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { MetricStrip, PageHeading } from "@/components/estate/PageHeading";
import { StatusBadge } from "@/components/estate/StatusBadge";
import { Register } from "@/components/estate/forms/RecordForm";
import { useTrustPosition } from "@/hooks/useEstateAccounting";
import { useEstateAssets, netRealizable } from "@/hooks/useEstateAssets";
import { useEstateIncomePeriods } from "@/hooks/useEstateIncome";
import { useEstateCreditors } from "@/hooks/useEstateCreditors";
import { useEstateMilestones } from "@/hooks/useEstateMilestones";
import { useEstateCompliance, ComplianceRule } from "@/hooks/useEstateCompliance";

const money = (n: number) =>
  `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface PageProps {
  estateId?: string;
  title: string;
  description?: string;
}

export const FinancialsSummary = ({ estateId, title, description }: PageProps) => {
  const trust = useTrustPosition(estateId);
  const { data: assets = [] } = useEstateAssets(estateId);
  const { data: income = [] } = useEstateIncomePeriods(estateId);
  const { data: creditors = [] } = useEstateCreditors(estateId);

  const realizable = assets.reduce((s, a) => s + netRealizable(a), 0);
  const outstandingSurplus = income.reduce((s, p) => s + Number(p.outstanding || 0), 0);
  const admitted = creditors.reduce((s, c) => s + c.admitted_dividend, 0);

  return (
    <>
      <PageHeading title={title} description={description} />
      <MetricStrip
        items={[
          { label: "Trust balance", value: money(trust.balance) },
          { label: "Receipts", value: money(trust.received) },
          { label: "Disbursements", value: money(trust.paid) },
          { label: "Net realizable assets", value: money(realizable) },
        ]}
      />
      <MetricStrip
        items={[
          { label: "Income periods", value: String(income.length) },
          {
            label: "Surplus outstanding",
            value: money(outstandingSurplus),
            tone: outstandingSurplus > 0 ? "bad" : "default",
          },
          { label: "Creditors", value: String(creditors.length) },
          { label: "Admitted for dividend", value: money(admitted) },
        ]}
      />
    </>
  );
};

export const CreditorsOverview = ({ estateId, title, description }: PageProps) => {
  const { data: creditors = [] } = useEstateCreditors(estateId);
  const soa = creditors.reduce((s, c) => s + c.soa_amount, 0);
  const filed = creditors.reduce((s, c) => s + c.filed_amount, 0);
  const admitted = creditors.reduce((s, c) => s + c.admitted_dividend, 0);
  const variances = creditors.filter((c) => c.filed_amount !== c.soa_amount);

  return (
    <>
      <PageHeading title={title} description={description} />
      <MetricStrip
        items={[
          { label: "Creditors", value: String(creditors.length) },
          { label: "SOA total", value: money(soa) },
          { label: "Filed total", value: money(filed) },
          { label: "Admitted (dividend)", value: money(admitted) },
        ]}
      />
      <Register
        title="Claim variances"
        description={`${variances.length} creditor(s) filed an amount different from the sworn statement of affairs.`}
      >
        <div className="space-y-2 text-sm">
          {variances.length === 0 && (
            <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
              No variances between SOA and filed claims.
            </p>
          )}
          {variances.map((c) => {
            const delta = c.filed_amount - c.soa_amount;
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{c.legal_name}</span>
                <StatusBadge label={c.poc_filed ? "In Progress" : "Missing"} />
                <span className="ml-auto text-muted-foreground">
                  SOA {money(c.soa_amount)} · Filed {money(c.filed_amount)}
                </span>
                <span className={delta !== 0 ? "font-medium text-destructive" : "font-medium"}>
                  {delta > 0 ? "+" : ""}
                  {money(delta)}
                </span>
              </div>
            );
          })}
        </div>
      </Register>
    </>
  );
};

export const WorkflowSummary = ({ estateId, title, description }: PageProps) => {
  const { milestones, blockers, completed, total, progress } = useEstateMilestones(estateId);
  const overdue = milestones.filter((m) => m.state === "overdue");

  return (
    <>
      <PageHeading title={title} description={description} />
      <MetricStrip
        items={[
          { label: "Milestones complete", value: `${completed}/${total}` },
          { label: "Progress", value: `${progress}%` },
          { label: "Blocking items", value: String(blockers.length), tone: blockers.length ? "warn" : "default" },
          { label: "Overdue", value: String(overdue.length), tone: overdue.length ? "bad" : "default" },
        ]}
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Stage progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progress} />
          <div className="space-y-2 text-sm">
            {overdue.length === 0 && blockers.length === 0 && (
              <p className="text-muted-foreground">No blocking or overdue milestones.</p>
            )}
            {[...overdue, ...blockers.filter((b) => b.state !== "overdue")].map((m) => (
              <div key={m.code} className="flex items-center gap-3 rounded-md border p-3">
                <span>{m.label}</span>
                <StatusBadge className="ml-auto" label={m.state === "overdue" ? "Overdue" : "Attention Required"} />
                <span className="text-xs text-muted-foreground">{m.dueDate ?? "No due date"}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const RuleRow = ({ c }: { c: ComplianceRule }) => (
  <div className="flex items-start gap-3 rounded-md border p-3">
    {c.state === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />}
    {c.state === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
    {c.state === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
    <div>
      <div className="font-medium">{c.rule}</div>
      <div className="text-xs text-muted-foreground">{c.detail}</div>
      {c.source && <div className="text-xs text-muted-foreground">{c.source}</div>}
    </div>
  </div>
);

export const ComplianceOverview = ({ estateId, title, description }: PageProps) => {
  const { rules, failing, warning, passing, score } = useEstateCompliance(estateId);
  return (
    <>
      <PageHeading title={title} description={description} />
      <MetricStrip
        items={[
          { label: "Compliance score", value: `${score}%` },
          { label: "Passing", value: String(passing.length) },
          { label: "Warnings", value: String(warning.length), tone: warning.length ? "warn" : "default" },
          { label: "Failing", value: String(failing.length), tone: failing.length ? "bad" : "default" },
        ]}
      />
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Rule states</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Progress value={score} className="mb-3" />
          {rules.slice(0, 4).map((c) => (
            <RuleRow key={c.id} c={c} />
          ))}
        </CardContent>
      </Card>
    </>
  );
};

export const ComplianceExceptions = ({ estateId, title, description }: PageProps) => {
  const { failing, warning } = useEstateCompliance(estateId);
  const items = [...failing, ...warning];
  return (
    <>
      <PageHeading title={title} description={description} />
      <Register title="Open exceptions" description={`${failing.length} failing · ${warning.length} at risk.`}>
        <div className="space-y-2 text-sm">
          {items.length === 0 && (
            <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
              No open compliance exceptions.
            </p>
          )}
          {items.map((c) => (
            <RuleRow key={c.id} c={c} />
          ))}
        </div>
      </Register>
    </>
  );
};