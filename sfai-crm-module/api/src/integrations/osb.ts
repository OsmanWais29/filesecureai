// OSB filing export. The Office of the Superintendent of Bankruptcy has no public
// filing API, so this produces a CSV of filed estates for your filing software.
import { and, eq, isNotNull } from "drizzle-orm";
import type { Ctx } from "../context.js";
import { clients } from "../db/schema.js";

const HEADERS = [
  "Estate number",
  "Debtor name",
  "File type",
  "Date filed",
  "Province",
  "City",
  "Total debt (CAD)",
  "Monthly income (CAD)",
  "Stage",
];

// Quote every cell so commas/quotes in names can't break the file
const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function osbCsv(ctx: Ctx, firmId: string) {
  const rows = await ctx.db
    .select()
    .from(clients)
    .where(and(eq(clients.firmId, firmId), isNotNull(clients.filedAt)))
    .orderBy(clients.filedAt);
  const lines = rows.map((c) =>
    [
      c.estateNumber,
      c.name,
      c.fileType,
      c.filedAt?.toISOString().slice(0, 10),
      c.province,
      c.city,
      c.totalDebt,
      c.monthlyIncome,
      c.stage,
    ]
      .map(cell)
      .join(","),
  );
  return [HEADERS.map(cell).join(","), ...lines].join("\n");
}
