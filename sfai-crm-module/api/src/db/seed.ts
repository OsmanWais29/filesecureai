// Demo data for local development (same people as the front-end prototype).
//   npm run db:seed   (uses DATABASE_URL)   - dev server seeds PGlite automatically
import { eq } from "drizzle-orm";
import type { Db } from "./client.js";
import { activities, appointments, clients, deadlines } from "./schema.js";
import { REQUIRED_DOCS, deadlinesFor } from "../domain/rules.js";

const day = 86_400_000;
const ago = (d: number) => new Date(Date.now() - d * day);
const ahead = (d: number) => new Date(Date.now() + d * day);

// [name, email, stage, file type, source, debt, days since created, docs received]
const PEOPLE: [string, string, string, string, string, number, number, number][] = [
  [
    "John Smith",
    "john.smith@email.com",
    "Filed",
    "Consumer proposal",
    "google",
    68400,
    48,
    4,
  ],
  [
    "Sarah Johnson",
    "sarah.j@email.com",
    "In administration",
    "Bankruptcy",
    "referral",
    41200,
    130,
    5,
  ],
  [
    "Michael Brown",
    "m.brown@email.com",
    "Assessment",
    "Division I proposal",
    "advertisement",
    212000,
    30,
    1,
  ],
  [
    "Emily Davis",
    "emily.d@email.com",
    "Consultation booked",
    "Debt consultation",
    "website",
    27900,
    4,
    0,
  ],
  [
    "David Wilson",
    "d.wilson@email.com",
    "Discharged",
    "Bankruptcy",
    "word_of_mouth",
    35500,
    320,
    5,
  ],
  [
    "Priya Patel",
    "priya.p@email.com",
    "New lead",
    "Debt consultation",
    "website",
    0,
    0,
    0,
  ],
];

export async function seed(db: Db, firmId: string) {
  const existing = await db
    .select()
    .from(clients)
    .where(eq(clients.firmId, firmId))
    .limit(1);
  if (existing.length) return; // already seeded

  for (const [name, email, stage, fileType, leadSource, totalDebt, age, docs] of PEOPLE) {
    const filed = ["Filed", "In administration", "Discharged"].includes(stage);
    const [c] = await db
      .insert(clients)
      .values({
        firmId,
        name,
        email,
        stage,
        fileType,
        leadSource,
        totalDebt,
        status: stage === "New lead" ? "lead" : "client",
        province: "ON",
        createdAt: ago(age),
        stageSince: ago(Math.min(age, 6)),
        lastContactAt: ago(age > 20 ? 17 : 1),
        filedAt: filed ? ago(age - 10) : null,
        docsReceived: REQUIRED_DOCS.slice(0, docs),
      })
      .returning();

    if (filed && stage !== "Discharged") {
      await db.insert(deadlines).values(
        deadlinesFor(fileType, c.filedAt!).map((d) => ({
          ...d,
          firmId,
          clientId: c.id,
        })),
      );
    }
    await db.insert(activities).values({
      firmId,
      clientId: c.id,
      type: "note",
      text: `Demo client created (${stage})`,
    });
  }

  const [emily] = await db
    .select()
    .from(clients)
    .where(eq(clients.email, "emily.d@email.com"));
  await db.insert(appointments).values({
    firmId,
    clientId: emily.id,
    title: "Free consultation",
    startsAt: ahead(1),
    kind: "video",
    source: "Website booking",
  });
}

// CLI entry: `tsx src/db/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  const { connect } = await import("./client.js");
  await seed(await connect(), process.env.SEED_FIRM_ID ?? "demo-firm");
  console.log("Seeded");
  process.exit(0);
}
