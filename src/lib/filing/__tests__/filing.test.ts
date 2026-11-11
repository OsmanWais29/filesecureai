import { describe, expect, test } from "vitest";
import { coverage, debtorChoice, toCode } from "../mapping";
import { buildXml } from "../xmlBuilder";
import { crossFormCheck, packageCheck, readiness, rulesCheck, schemaCheck } from "../checks";
import { canonical, sealPack } from "../evidence";
import { diffPayload } from "../diff";
import { deadlineOutcome, nextSteps } from "../status";
import type { SchemaElement } from "../types";

const els: SchemaElement[] = [
  { id: "a", path: "DebtorName", seq: 1, min_occurs: 1 },
  { id: "b", path: "Province", seq: 2, min_occurs: 1, enum_values: ["MB", "ON"] },
  { id: "c", path: "Asset/Description", seq: 3, min_occurs: 0 },
  { id: "d", path: "Asset/Value", seq: 4, min_occurs: 0, data_type: "decimal" },
];

describe("mapping", () => {
  test("unloaded schema is not covered", () => expect(coverage([], []).loaded).toBe(false));
  test("unmapped mandatory blocks release", () => {
    const c = coverage(els, [{ schema_element_id: "a", source_field: "x" }]);
    expect(c.unmappedMandatory.map((e) => e.id)).toEqual(["b"]);
    expect(c.releasable).toBe(false);
  });
  test("choice follows estate record", () => { expect(debtorChoice("Corporation")).toBe("Corporation"); expect(debtorChoice("")).toBeNull(); });
  test("province text converts; unknown is flagged", () => { expect(toCode("Manitoba", ["MB"]).code).toBe("MB"); expect(toCode("Atlantis", ["MB"]).confident).toBe(false); });
});

describe("xml", () => {
  test("schema order and one group per record", () => {
    const x = buildXml("Form79", "urn:osb", els, { Province: "MB", DebtorName: "A & B", Asset: [{ Description: "Car", Value: 100 }, { Description: "TV", Value: 5 }] });
    expect(x.indexOf("<DebtorName>")).toBeLessThan(x.indexOf("<Province>"));
    expect(x).toContain("A &amp; B");
    expect(x.match(/<Asset>/g)?.length).toBe(2);
  });
});

describe("checks", () => {
  test("no schema means not checked, never pass", () => expect(schemaCheck([], {}).state).toBe("not_checked"));
  test("bad code and missing mandatory fail", () => {
    const r = schemaCheck(els, { DebtorName: "", Province: "XX" });
    expect(r.state).toBe("fail"); expect(r.issues).toHaveLength(2);
  });
  test("liabilities must equal creditor list to the cent", () => {
    expect(crossFormCheck({ form79LiabilitiesTotal: 100, creditorRegisterTotal: 100.01 }).state).toBe("fail");
    expect(crossFormCheck({}).state).toBe("not_checked");
  });
  test("consumer proposal package needs 47, 48, 65, 79", () => {
    const r = packageCheck("Form 47", "Consumer Proposal", ["Form 79"]);
    expect(r.issues.map((i) => i.message)).toEqual(["Initial consumer proposal also needs Form 48.", "Initial consumer proposal also needs Form 65."]);
  });
  test("readiness is not ready while any layer is unchecked", () => {
    expect(readiness([rulesCheck([], true), schemaCheck([], {})]).state).toBe("not_checked");
    expect(readiness([rulesCheck(["Fee over tariff"], true)]).state).toBe("blocked");
  });
});

describe("evidence and history", () => {
  test("hash is stable regardless of key order", async () => {
    expect(canonical({ b: 1, a: 2 })).toBe(canonical({ a: 2, b: 1 }));
    const base: any = { filing_id: "f", estate_id: "e", form_number: "Form 79", version_label: "v", schema_version_id: null, rules_version: "1", xml: null, xml_sha256: null, payload: {}, checks: [], signer: null, signed_at: null, osb_reference: null, osb_response: null, events: [] };
    expect((await sealPack(base)).pack_sha256).toBe((await sealPack({ ...base })).pack_sha256);
  });
  test("amendment diff lists only changed fields", () => expect(diffPayload({ a: "1", b: "2" }, { a: "1", b: "3" })).toEqual([{ field: "b", before: "2", after: "3" }]));
  test("status only moves forward; outcomes only after submission", () => {
    expect(nextSteps("drafted")).toEqual(["checked"]);
    expect(nextSteps("signed")).toEqual(["queued"]);
    expect(nextSteps("accepted")).toEqual([]);
  });
  test("accepted filing closes deadline as met or late", () => {
    expect(deadlineOutcome("2026-11-10", "2026-11-10")).toBe("met");
    expect(deadlineOutcome("2026-11-10", "2026-11-11")).toBe("late");
  });
});
