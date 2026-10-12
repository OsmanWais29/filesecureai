// The database, replacing Supabase's query builder. Same chainable API:
//   supabase.from("documents").select("*").eq("user_id", id).order("created_at")
// Each chain becomes one JSON request to the API's /data/:table route, which
// applies the firm and table rules (sfai-platform-module/api/src/data).
import { request, type ApiError } from "./http";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Op = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is" | "contains";
interface Filter { col: string; op: Op; value?: unknown; not?: boolean }
export interface Result<T = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  data: T;
  error: ApiError | null;
  count: number | null;
  status: number;
  statusText: string;
}

// "in.(a,b)" style values from .filter() / .not()
const listValue = (v: unknown) =>
  typeof v === "string" && /^\(.*\)$/.test(v) ? v.slice(1, -1).split(",").map((s) => s.trim()) : v;

class Query<T = any> implements PromiseLike<Result<T>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  private req: Row = { action: "select", filters: [] as Filter[], or: [] as string[], order: [] as Row[] };
  private one: "single" | "maybe" | null = null;
  private returning = false; // insert/update/... return rows only after .select()

  constructor(private table: string) {}

  // ---------- What to do ----------
  select(columns = "*", opts: { count?: "exact" | "planned" | "estimated"; head?: boolean } = {}) {
    if (this.req.action === "select") {
      this.req.select = columns;
      this.req.count = !!opts.count;
      this.req.head = !!opts.head;
    } else {
      this.returning = true;
      this.req.select = columns;
    }
    return this;
  }
  insert(values: Row | Row[]) {
    return this.write("insert", values);
  }
  update(values: Row) {
    return this.write("update", values);
  }
  upsert(values: Row | Row[], opts: { onConflict?: string; ignoreDuplicates?: boolean } = {}) {
    Object.assign(this.req, { onConflict: opts.onConflict, ignoreDuplicates: opts.ignoreDuplicates });
    return this.write("upsert", values);
  }
  delete() {
    return this.write("delete");
  }
  private write(action: string, values?: Row | Row[]) {
    Object.assign(this.req, { action, values });
    return this;
  }

  // ---------- Filters ----------
  private add(col: string, op: Op, value?: unknown, not = false) {
    (this.req.filters as Filter[]).push({ col, op, value, not });
    return this;
  }
  eq(col: string, v: unknown) { return this.add(col, "eq", v); }
  neq(col: string, v: unknown) { return this.add(col, "neq", v); }
  gt(col: string, v: unknown) { return this.add(col, "gt", v); }
  gte(col: string, v: unknown) { return this.add(col, "gte", v); }
  lt(col: string, v: unknown) { return this.add(col, "lt", v); }
  lte(col: string, v: unknown) { return this.add(col, "lte", v); }
  like(col: string, v: string) { return this.add(col, "like", v); }
  ilike(col: string, v: string) { return this.add(col, "ilike", v); }
  in(col: string, v: unknown[]) { return this.add(col, "in", v); }
  is(col: string, v: null | boolean) { return this.add(col, "is", v); }
  contains(col: string, v: unknown) { return this.add(col, "contains", v); }
  not(col: string, op: string, v: unknown) { return this.add(col, op as Op, listValue(v), true); }
  // .filter("status", "in", "(a,b)") / .filter("x", "not.eq", 1)
  filter(col: string, op: string, v: unknown) {
    const not = op.startsWith("not.");
    return this.add(col, op.replace(/^not\./, "") as Op, listValue(v), not);
  }
  match(obj: Row) {
    for (const [k, v] of Object.entries(obj)) this.eq(k, v);
    return this;
  }
  or(expr: string) {
    (this.req.or as string[]).push(expr);
    return this;
  }

  // ---------- Shape of the result ----------
  order(col: string, opts: { ascending?: boolean; nullsFirst?: boolean } = {}) {
    (this.req.order as Row[]).push({ col, asc: opts.ascending ?? true, nullsFirst: opts.nullsFirst });
    return this;
  }
  limit(n: number) {
    this.req.limit = n;
    return this;
  }
  range(from: number, to: number) {
    this.req.offset = from;
    this.req.limit = to - from + 1;
    return this;
  }
  single() {
    this.one = "single";
    return this;
  }
  maybeSingle() {
    this.one = "maybe";
    return this;
  }
  abortSignal(_s: AbortSignal) { return this; }
  throwOnError() { return this; }
  returns<U>() { return this as unknown as Query<U>; }

  // ---------- Run it (await / .then) ----------
  private async run(): Promise<Result<T>> {
    try {
      const out = await request<{ data: Row[] | null; count?: number }>(`/records/${this.table}`, this.req);
      const write = this.req.action !== "select";
      let data: unknown = write && !this.returning ? null : out.data;
      if (this.one && Array.isArray(data)) {
        if (data.length > 1 || (this.one === "single" && !data.length)) {
          return this.done(null, {
            code: "PGRST116",
            message: "JSON object requested, multiple (or no) rows returned",
            details: `The result contains ${data.length} rows`,
          }, 406);
        }
        data = data[0] ?? null;
      }
      return this.done(data as T, null, write && this.req.action === "insert" ? 201 : 200, out.count);
    } catch (e) {
      const err = e as ApiError;
      return this.done(null, { message: err.message, code: err.code, details: err.details, hint: err.hint }, err.status ?? 500);
    }
  }
  private done(data: unknown, error: ApiError | null, status: number, count?: number): Result<T> {
    return { data: data as T, error, count: count ?? null, status, statusText: error ? "Error" : "OK" };
  }

  then<A = Result<T>, B = never>(
    ok?: ((r: Result<T>) => A | PromiseLike<A>) | null,
    bad?: ((e: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return this.run().then(ok, bad);
  }
}

export const from = <T = any>(table: string) => new Query<T>(table); // eslint-disable-line @typescript-eslint/no-explicit-any

// Database functions (portal invites) -> API paths. The first two work before sign-in.
const PUBLIC_RPC: Record<string, string> = {
  peek_client_portal_invitation: "/public/portal/peek",
  mark_client_portal_invitation_opened: "/public/portal/opened",
};
const RPC: Record<string, string> = {
  redeem_client_portal_invitation: "/portal/invites/redeem",
  record_client_portal_login: "/portal/logins",
};
export async function rpc(name: string, args: Row = {}) {
  try {
    const path = PUBLIC_RPC[name] ?? RPC[name];
    if (!path) throw { message: `Unknown function: ${name}`, code: "404" } as ApiError;
    const body = PUBLIC_RPC[name] ? { token: args.p_token } : args;
    return { data: await request(path, body), error: null };
  } catch (e) {
    const err = e as ApiError;
    return { data: null, error: { message: err.message, code: err.code } };
  }
}
