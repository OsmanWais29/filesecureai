export const sha256 = async (text: string): Promise<string> => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
};
/** Stable JSON so the same pack always hashes the same. */
export const canonical = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canonical).join(",")}]`
  : v && typeof v === "object" ? `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as any)[k])}`).join(",")}}`
  : JSON.stringify(v ?? null);

export interface EvidencePack { filing_id: string; estate_id: string; form_number: string; version_label: string; schema_version_id: string | null; rules_version: string; xml: string | null; xml_sha256: string | null; payload: unknown; checks: unknown; signer: string | null; signed_at: string | null; osb_reference: string | null; osb_response: unknown; events: unknown[] }
export const sealPack = async (p: EvidencePack) => ({ pack: p, pack_sha256: await sha256(canonical(p)) });
