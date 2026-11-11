// Reads a client-uploaded pay stub / statement and returns DRAFT figures.
// Runs as the signed-in user, so database and storage permissions decide access.
// Output is never posted anywhere: a trustee must confirm it in the app.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { generateChatCompletion, GatewayError } from "npm:@lovable.dev/ai-gateway";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const SCHEMA = {
  type: "object",
  properties: {
    document_type: { type: "string", enum: ["pay_stub", "bank_statement", "benefit_statement", "tax_document", "other"] },
    payer: { type: ["string", "null"], description: "Employer or payer name" },
    period_start: { type: ["string", "null"], description: "YYYY-MM-DD" },
    period_end: { type: ["string", "null"], description: "YYYY-MM-DD" },
    pay_date: { type: ["string", "null"], description: "YYYY-MM-DD" },
    pay_frequency: { type: ["string", "null"], enum: ["weekly", "biweekly", "semimonthly", "monthly", "other", null] },
    gross_pay: { type: ["number", "null"] },
    net_pay: { type: ["number", "null"] },
    deductions: { type: ["number", "null"] },
    confidence: { type: "number", description: "0 to 1, how legible and unambiguous the figures are" },
    notes: { type: "string", description: "Anything unclear or missing. Never guess figures." },
  },
  required: ["document_type", "confidence", "notes"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Sign in required." }, 401);
    const { documentId } = await req.json();
    if (typeof documentId !== "string") return json({ error: "documentId is required." }, 400);

    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: doc, error } = await sb.from("client_portal_documents").select("id, estate_id, storage_path, mime_type, file_name").eq("id", documentId).maybeSingle();
    if (error || !doc) return json({ error: "Document not found or you don't have access to it." }, 404);

    const mime = doc.mime_type || "image/jpeg";
    if (!/^image\/(png|jpe?g|webp)$/.test(mime)) return json({ error: "Only photos or screenshots (PNG, JPG, WebP) can be read for now. PDFs need to be entered by hand." }, 415);
    const { data: file, error: dlErr } = await sb.storage.from("client-portal-uploads").download(doc.storage_path);
    if (dlErr || !file) return json({ error: "Could not open the file." }, 403);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > 10 * 1024 * 1024) return json({ error: "File is larger than 10 MB." }, 413);
    let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    const dataUrl = `data:${mime};base64,${btoa(bin)}`;

    let out;
    try {
      out = await generateChatCompletion({
        model: "openai/gpt-6-astra",
        messages: [
          { role: "system", content: "You read Canadian income documents for a Licensed Insolvency Trustee. Extract only figures printed on the document. Use null for anything not shown. Never estimate." },
          { role: "user", content: [
            { type: "text", text: "Extract the income figures from this document." },
            { type: "image_url", image_url: { url: dataUrl } },
          ] },
        ],
        tools: [{ type: "function", function: { name: "record_income", description: "Record figures read from the document", parameters: SCHEMA } }],
        tool_choice: { type: "function", function: { name: "record_income" } },
      } as any);
    } catch (e) {
      if (e instanceof GatewayError) {
        const st = (e as any).httpStatus;
        if (st === 429) return json({ error: "The reading service is busy. Try again in a minute." }, 429);
        if (st === 402) return json({ error: "AI credits have run out for this workspace." }, 402);
        console.error("gateway", (e as any).code, (e as any).ids);
      }
      return json({ error: "The document could not be read." }, 502);
    }
    const args = (out as any)?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return json({ error: "No figures could be read from this document." }, 422);
    return json({ documentId: doc.id, estateId: doc.estate_id, fileName: doc.file_name, extraction: JSON.parse(args) });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
