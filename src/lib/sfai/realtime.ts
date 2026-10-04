// Live updates, replacing Supabase Realtime. Same calls:
//   supabase.channel("x").on("postgres_changes", { table, filter: "id=eq.5" }, cb).subscribe()
// Instead of a websocket it asks the API every 5 seconds for rows changed since
// the last check (cheap on Lambda, nothing to keep running). Deletes aren't reported.
import { request } from "./http";

type Row = Record<string, unknown>;
type Change = { eventType: "INSERT" | "UPDATE"; new: Row; old: Row; table: string; schema: string };
type Listen = { table?: string; filter?: string; event?: string; schema?: string };
const EVERY = 5000;

// "estate_id=eq.123" -> an API filter
const parseFilter = (f?: string) => {
  const m = f?.match(/^([a-z_0-9]+)=(eq|neq|gt|gte|lt|lte|in)\.(.*)$/);
  if (!m) return [];
  const value = m[2] === "in" ? m[3].replace(/^\(|\)$/g, "").split(",") : m[3];
  return [{ col: m[1], op: m[2], value }];
};

export class Channel {
  private listeners: { opts: Listen; cb: (c: Change) => void }[] = [];
  private timers: ReturnType<typeof setInterval>[] = [];

  constructor(readonly topic: string) {}

  on(_type: string, opts: Listen, cb: (c: Change) => void) {
    this.listeners.push({ opts, cb });
    return this;
  }

  subscribe(status?: (s: "SUBSCRIBED" | "CLOSED") => void) {
    for (const { opts, cb } of this.listeners) {
      if (!opts.table) continue; // presence/broadcast aren't used by the app
      let since = new Date().toISOString();
      const filters = parseFilter(opts.filter);
      const poll = async () => {
        if (document.hidden) return; // don't poll from background tabs
        try {
          const { rows, at } = await request<{ rows: Row[]; at: string }>(
            `/data/${opts.table}/changes`,
            { since, filters },
          );
          for (const row of rows) {
            const eventType = String(row.created_at) > since ? "INSERT" : "UPDATE";
            if (opts.event && opts.event !== "*" && opts.event !== eventType) continue;
            cb({ eventType, new: row, old: {}, table: opts.table!, schema: "public" });
          }
          since = at;
        } catch {
          // signed out or offline: try again next time
        }
      };
      this.timers.push(setInterval(poll, EVERY));
    }
    status?.("SUBSCRIBED");
    return this;
  }

  unsubscribe() {
    this.timers.forEach(clearInterval);
    this.timers = [];
    return Promise.resolve("ok");
  }
}
