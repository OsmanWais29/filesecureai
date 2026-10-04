// /files: the app's file storage (replaces Supabase Storage). Files go to S3 under
// <firm>/<bucket>/<path>, so a firm can never reach another firm's files.
// The browser uploads and downloads directly with 5-minute links.
import { z } from "zod";
import type { Ctx } from "../context.js";
import { portalEstates } from "../data/access.js";
import { body, fail, router } from "../lib/http.js";
import type { AuthUser } from "../lib/http.js";

const BUCKETS = ["documents", "client-portal-uploads", "avatars"] as const;
const PORTAL_BUCKET = "client-portal-uploads"; // keys: <estate_id>/<file>
const Path = z
  .string()
  .min(1)
  .max(500)
  .refine((p) => !p.startsWith("/") && !p.split("/").includes(".."), "Invalid path");
const File = z.object({ bucket: z.enum(BUCKETS), path: Path });

// The S3 key for a path, after checking a portal client may use it
export async function fileKey(ctx: Ctx, user: AuthUser, bucket: string, path: string) {
  if (user.role === "client") {
    if (bucket !== PORTAL_BUCKET) throw fail(403, "Not available in the client portal");
    const estate = path.split("/")[0];
    // Portal clients upload and read only inside their own estate's folder
    if (!(await portalEstates(ctx, user)).includes(estate))
      throw fail(403, "Not your estate");
  }
  return `${user.firmId}/${bucket}/${path}`;
}

export default (ctx: Ctx) => {
  const key = (user: AuthUser, bucket: string, path: string) =>
    fileKey(ctx, user, bucket, path);

  return (
    router()
      .post("/upload-url", async (c) => {
        const user = c.get("user");
        const { bucket, path, contentType } = await body(
          c,
          File.extend({ contentType: z.string().min(1).max(200).optional() }),
        );
        const url = await ctx.svc.storage.uploadUrl(
          await key(user, bucket, path),
          contentType,
        );
        return c.json({ url, path });
      })

      // A short-lived link to view (inline) or download a file
      .post("/download-url", async (c) => {
        const user = c.get("user");
        const { bucket, path, download } = await body(
          c,
          File.extend({ download: z.boolean().optional() }),
        );
        const name = path.split("/").pop()!;
        const url = await ctx.svc.storage.downloadUrl(
          await key(user, bucket, path),
          name,
          !download,
        );
        return c.json({ url });
      })

      // Files in a folder (portal clients: only their estate's folder)
      .post("/list", async (c) => {
        const user = c.get("user");
        const { bucket, prefix, limit, search } = await body(
          c,
          z.object({
            bucket: z.enum(BUCKETS),
            prefix: z.string().max(500).default(""),
            limit: z.number().int().min(1).max(1000).default(100),
            search: z.string().max(200).optional(),
          }),
        );
        if (prefix.split("/").includes("..")) throw fail(400, "Invalid path");
        const folder = prefix ? `${prefix.replace(/\/$/, "")}/` : "";
        if (user.role === "client") await key(user, bucket, folder || "x"); // estate check
        const base = `${user.firmId}/${bucket}/`;
        const objects = await ctx.svc.storage.list(base + folder, limit);
        const files = objects
          .map((o) => ({
            name: o.key.slice((base + folder).length),
            size: o.size,
            updated_at: o.updated,
          }))
          .filter(
            (f) =>
              f.name && !f.name.includes("/") && (!search || f.name.includes(search)),
          );
        return c.json({ files });
      })

      .post("/remove", async (c) => {
        const user = c.get("user");
        if (user.role === "client") throw fail(403, "Not available in the client portal");
        const { bucket, paths } = await body(
          c,
          z.object({ bucket: z.enum(BUCKETS), paths: z.array(Path).min(1).max(100) }),
        );
        await ctx.svc.storage.remove(paths.map((p) => `${user.firmId}/${bucket}/${p}`));
        return c.json({ removed: paths.length });
      })
  );
};
