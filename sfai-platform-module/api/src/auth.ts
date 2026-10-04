// Login check. The module never manages passwords: it trusts the host's identity
// provider. Default = Cognito ID tokens (shared user pool). Hosts can pass their own.
import { CognitoJwtVerifier } from "aws-jwt-verify";
import type { Config } from "./config.js";
import type { AuthUser } from "./lib/http.js";

// Turns a request into a user, or null (-> 401)
export type Authenticate = (req: Request) => Promise<AuthUser | null>;

const bearer = (req: Request) =>
  req.headers.get("authorization")?.replace(/^Bearer /i, "");

// Cognito: firm comes from the custom:firm_id attribute on the user
export function cognitoAuth(cfg: NonNullable<Config["cognito"]>): Authenticate {
  const verifier = CognitoJwtVerifier.create({
    userPoolId: cfg.userPoolId,
    clientId: cfg.clientId,
    tokenUse: "id",
  });
  return async (req) => {
    const token = bearer(req);
    if (!token) return null;
    try {
      const claims = await verifier.verify(token);
      const firmId = claims["custom:firm_id"];
      if (typeof firmId !== "string") return null; // user not linked to a firm
      return {
        id: claims.sub,
        firmId,
        name: claims.name as string | undefined,
        email: claims.email as string | undefined,
        role: (claims["custom:role"] as string | undefined) ?? "staff",
      };
    } catch {
      return null; // expired / forged / wrong pool
    }
  };
}

// Local development only. Never use on AWS. Accepts the dev server's unsigned
// "dev.<base64 json>" tokens (handlers/dev.ts), else x-dev-firm / x-dev-user headers
// (the CRM app's dev mode). No token and no header = signed out, as on AWS.
export const devAuth: Authenticate = async (req) => {
  const token = bearer(req);
  if (token?.startsWith("dev.")) {
    try {
      return JSON.parse(Buffer.from(token.slice(4), "base64url").toString()) as AuthUser;
    } catch {
      return null;
    }
  }
  const firmId = req.headers.get("x-dev-firm");
  if (!firmId) return null; // signed out
  return {
    id: req.headers.get("x-dev-user") ?? "dev-user",
    firmId,
    name: "Dev Trustee",
    email: "trustee@demo.test",
    role: "trustee",
  };
};
