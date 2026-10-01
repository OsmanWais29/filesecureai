// Field-level encryption for sensitive values (SIN, OAuth tokens, Twilio token).
// AWS: KMS, bound to the firm via encryption context. Dev/tests: AES-256-GCM local key.
import { DecryptCommand, EncryptCommand, KMSClient } from "@aws-sdk/client-kms";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { Config } from "../config.js";

export interface Crypto {
  encrypt(plain: string, firmId: string): Promise<string>;
  decrypt(cipher: string, firmId: string): Promise<string>;
}

// KMS: ciphertext only decrypts with the same firmId (stops cross-firm mix-ups)
function kmsCrypto(keyId: string, region: string): Crypto {
  const kms = new KMSClient({ region });
  const context = (firmId: string) => ({ firmId });
  return {
    async encrypt(plain, firmId) {
      const res = await kms.send(
        new EncryptCommand({
          KeyId: keyId,
          Plaintext: Buffer.from(plain),
          EncryptionContext: context(firmId),
        }),
      );
      return "kms:" + Buffer.from(res.CiphertextBlob!).toString("base64");
    },
    async decrypt(cipher, firmId) {
      const res = await kms.send(
        new DecryptCommand({
          CiphertextBlob: Buffer.from(cipher.slice(4), "base64"),
          EncryptionContext: context(firmId),
        }),
      );
      return Buffer.from(res.Plaintext!).toString();
    },
  };
}

// Local AES-GCM: "local:" + iv.tag.data (base64). Firm id is authenticated data.
function localCrypto(hexKey: string): Crypto {
  const key = Buffer.from(hexKey, "hex");
  if (key.length !== 32) throw new Error("LOCAL_ENCRYPTION_KEY must be 64 hex chars");
  return {
    async encrypt(plain, firmId) {
      const iv = randomBytes(12);
      const c = createCipheriv("aes-256-gcm", key, iv).setAAD(Buffer.from(firmId));
      const data = Buffer.concat([c.update(plain), c.final()]);
      const parts = [iv, c.getAuthTag(), data].map((b) => b.toString("base64"));
      return "local:" + parts.join(".");
    },
    async decrypt(cipher, firmId) {
      const [iv, tag, data] = cipher
        .slice(6)
        .split(".")
        .map((p) => Buffer.from(p, "base64"));
      const d = createDecipheriv("aes-256-gcm", key, iv).setAAD(Buffer.from(firmId));
      d.setAuthTag(tag);
      return Buffer.concat([d.update(data), d.final()]).toString();
    },
  };
}

export function createCrypto(cfg: Config): Crypto {
  if (cfg.kmsKeyId) return kmsCrypto(cfg.kmsKeyId, cfg.region);
  if (cfg.localKey) return localCrypto(cfg.localKey);
  throw new Error("Set KMS_KEY_ID (AWS) or LOCAL_ENCRYPTION_KEY (dev)");
}
