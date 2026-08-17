import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { estates } from "@/data/estateWorkspace";

const EstatesListPage = () => (
  <MainLayout>
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Estates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Open an estate to enter its workspace — every record, deadline and SAFA action belongs to the estate.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {estates.map((e) => (
          <Link key={e.id} to={`/estates/${e.id}`}>
            <Card className="h-full transition-colors hover:border-primary/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{e.debtorName}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  #{e.estateNumber} · {e.proceeding}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{e.status}</Badge>
                  {e.openIssues > 0 && <Badge variant="destructive">{e.openIssues} issues</Badge>}
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{e.stage}</span>
                    <span>{e.stageProgress}%</span>
                  </div>
                  <Progress value={e.stageProgress} className="mt-1 h-1.5" />
                </div>
                <p className="text-xs text-muted-foreground">Next: {e.nextDeadline}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </MainLayout>
);

export default EstatesListPage;
