// File storage, replacing Supabase Storage. Same calls as supabase.storage:
//   supabase.storage.from("documents").upload(path, file)
// Files live in a private S3 bucket under the firm's folder; the browser gets
// 5-minute links from the API and uploads/downloads straight to S3.
import { API_URL, getViewKey, request, type ApiError } from "./http";

const BUCKETS = ["documents", "client-portal-uploads", "avatars"];
// cacheControl/duplex are accepted for compatibility; S3 links don't need them
type UploadOptions = { contentType?: string; upsert?: boolean; cacheControl?: string; duplex?: string };
const failed = (e: unknown) => ({ data: null, error: { message: (e as ApiError).message ?? String(e) } });

function bucket(name: string) {
  const link = (path: string, download = false) =>
    request<{ url: string }>("/files/download-url", { bucket: name, path, download }).then((r) => r.url);

  return {
    async upload(path: string, file: Blob | File | ArrayBuffer, opts: UploadOptions = {}) {
      try {
        const body = file instanceof ArrayBuffer ? new Blob([file]) : file;
        const contentType = opts.contentType || (body as Blob).type || "application/octet-stream";
        const { url } = await request<{ url: string }>("/files/upload-url", { bucket: name, path, contentType });
        const put = await fetch(url, { method: "PUT", body, headers: { "content-type": contentType } });
        if (!put.ok) throw new Error(`Upload failed (${put.status})`);
        return { data: { path, id: path, fullPath: `${name}/${path}` }, error: null };
      } catch (e) {
        return failed(e);
      }
    },
    // Same as upload, replacing the file
    update(path: string, file: Blob | File, opts: UploadOptions = {}) {
      return this.upload(path, file, { ...opts, upsert: true });
    },

    async download(path: string) {
      try {
        const res = await fetch(await link(path, true));
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
        return { data: await res.blob(), error: null };
      } catch (e) {
        return failed(e);
      }
    },

    // A link the browser PUTs the file to (any content type)
    async createSignedUploadUrl(path: string) {
      try {
        const { url } = await request<{ url: string }>("/files/upload-url", { bucket: name, path });
        return { data: { signedUrl: url, path, token: "" }, error: null };
      } catch (e) {
        return failed(e);
      }
    },

    async createSignedUrl(path: string, _expiresIn = 300, opts: { download?: boolean | string } = {}) {
      try {
        return { data: { signedUrl: await link(path, !!opts.download) }, error: null };
      } catch (e) {
        return failed(e);
      }
    },
    async createSignedUrls(paths: string[], expiresIn = 300) {
      const out = await Promise.all(paths.map((p) => this.createSignedUrl(p, expiresIn)));
      return { data: out.map((r, i) => ({ path: paths[i], signedUrl: r.data?.signedUrl ?? "", error: r.error?.message ?? null })), error: null };
    },

    // Synchronous, like Supabase's: a link to the API that checks a 10-minute view
    // key (never the login token) and redirects to a 5-minute S3 link. The bucket
    // itself is never public.
    getPublicUrl(path: string) {
      const q = new URLSearchParams({ bucket: name, path, key: getViewKey() ?? "" });
      return { data: { publicUrl: `${API_URL}/public/files/view?${q}` } };
    },

    async remove(paths: string[]) {
      try {
        await request("/files/remove", { bucket: name, paths });
        return { data: paths.map((p) => ({ name: p })), error: null };
      } catch (e) {
        return failed(e);
      }
    },

    async list(prefix = "", opts: { limit?: number; offset?: number; search?: string; sortBy?: unknown } = {}) {
      try {
        const { files } = await request<{ files: { name: string; size: number; updated_at: string }[] }>(
          "/files/list",
          { bucket: name, prefix, limit: opts.limit, search: opts.search },
        );
        return { data: files.map((f) => ({ ...f, id: f.name, metadata: { size: f.size } })), error: null };
      } catch (e) {
        return failed(e);
      }
    },
  };
}

export const storage = {
  from: bucket,
  // Buckets are created by the infrastructure (CDK); these just report them
  async listBuckets() {
    return { data: BUCKETS.map((id) => ({ id, name: id, public: false })), error: null };
  },
  async getBucket(id: string) {
    return BUCKETS.includes(id)
      ? { data: { id, name: id, public: false }, error: null }
      : { data: null, error: { message: "Bucket not found" } };
  },
  async createBucket(_id: string, _opts?: unknown) {
    return { data: null, error: null };
  },
};
