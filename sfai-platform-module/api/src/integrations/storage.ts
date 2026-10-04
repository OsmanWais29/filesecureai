// Client documents live in S3. The browser uploads/downloads directly with
// short-lived presigned links, so files never pass through the API.
// Only the analysis worker reads a file's bytes (to hand it to Claude).
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Config } from "../config.js";

export interface Storage {
  uploadUrl(key: string, contentType?: string): Promise<string>; // unset = any type
  downloadUrl(key: string, fileName: string, inline?: boolean): Promise<string>;
  read(key: string): Promise<Uint8Array>; // the file's bytes
  remove(keys: string[]): Promise<void>;
  list(
    prefix: string,
    limit: number,
  ): Promise<{ key: string; size: number; updated: string }[]>;
}

export function createStorage(cfg: Config): Storage {
  const s3 = new S3Client({ region: cfg.region });
  const Bucket = cfg.docsBucket;
  const ttl = { expiresIn: 300 }; // links work for 5 minutes

  return {
    uploadUrl: (Key, ContentType) =>
      getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), ttl),
    // inline = show in the browser (PDF viewer); otherwise download
    downloadUrl: (Key, name, inline = false) =>
      getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket,
          Key,
          ResponseContentDisposition: `${inline ? "inline" : "attachment"}; filename="${encodeURI(name)}"`,
        }),
        ttl,
      ),
    read: async (Key) => {
      const res = await s3.send(new GetObjectCommand({ Bucket, Key }));
      return res.Body!.transformToByteArray();
    },
    remove: async (keys) => {
      if (!keys.length) return;
      await s3.send(
        new DeleteObjectsCommand({
          Bucket,
          Delete: { Objects: keys.map((Key) => ({ Key })) },
        }),
      );
    },
    list: async (Prefix, MaxKeys) => {
      const res = await s3.send(new ListObjectsV2Command({ Bucket, Prefix, MaxKeys }));
      return (res.Contents ?? []).map((o) => ({
        key: o.Key!,
        size: o.Size ?? 0,
        updated: (o.LastModified ?? new Date()).toISOString(),
      }));
    },
  };
}
