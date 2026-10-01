// Client documents live in S3. The browser uploads/downloads directly with
// short-lived presigned links, so files never pass through Lambda.
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { Config } from "../config.js";

export interface Storage {
  uploadUrl(key: string, contentType: string): Promise<string>;
  downloadUrl(key: string, fileName: string): Promise<string>;
}

export function createStorage(cfg: Config): Storage {
  const s3 = new S3Client({ region: cfg.region });
  const Bucket = cfg.docsBucket;
  const ttl = { expiresIn: 300 }; // links work for 5 minutes

  return {
    uploadUrl: (Key, ContentType) =>
      getSignedUrl(s3, new PutObjectCommand({ Bucket, Key, ContentType }), ttl),
    downloadUrl: (Key, name) =>
      getSignedUrl(
        s3,
        new GetObjectCommand({
          Bucket,
          Key,
          ResponseContentDisposition: `attachment; filename="${encodeURI(name)}"`,
        }),
        ttl,
      ),
  };
}
