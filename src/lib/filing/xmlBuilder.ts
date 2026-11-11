import type { Payload, SchemaElement } from "./types";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const tag = (path: string) => path.split("/").pop()!;

/**
 * Writes elements in schema sequence order. Repeating groups (path "Group/Child") emit one
 * <Group> per record in payload[Group]. Empty optional elements are omitted; empty mandatory
 * elements are written empty so the schema check reports them.
 */
export const buildXml = (rootName: string, namespace: string | null, elements: SchemaElement[], payload: Payload): string => {
  const sorted = [...elements].sort((a, b) => a.seq - b.seq);
  const out: string[] = [`<?xml version="1.0" encoding="UTF-8"?>`, `<${rootName}${namespace ? ` xmlns="${esc(namespace)}"` : ""}>`];
  const doneGroups = new Set<string>();
  for (const el of sorted) {
    const parts = el.path.split("/");
    if (parts.length > 1) {
      const group = parts[0];
      if (doneGroups.has(group)) continue;
      doneGroups.add(group);
      const children = sorted.filter((e) => e.path.startsWith(group + "/"));
      const rows = Array.isArray(payload[group]) ? (payload[group] as Array<Record<string, string | number | null>>) : [];
      for (const row of rows) {
        out.push(`  <${group}>`);
        for (const c of children) {
          const v = row[tag(c.path)];
          if (v === null || v === undefined || v === "") { if (c.min_occurs > 0) out.push(`    <${tag(c.path)}/>`); continue; }
          out.push(`    <${tag(c.path)}>${esc(String(v))}</${tag(c.path)}>`);
        }
        out.push(`  </${group}>`);
      }
      continue;
    }
    const v = payload[el.path];
    if (v === null || v === undefined || v === "" || Array.isArray(v)) { if (el.min_occurs > 0) out.push(`  <${el.path}/>`); continue; }
    out.push(`  <${el.path}>${esc(String(v))}</${el.path}>`);
  }
  out.push(`</${rootName}>`);
  return out.join("\n");
};
