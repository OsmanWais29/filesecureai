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

// Local development only: trust x-dev-firm / x-dev-user headers. Never use on AWS.
export const devAuth: Authenticate = async (req) => ({
  id: req.headers.get("x-dev-user") ?? "dev-user",
  firmId: req.headers.get("x-dev-firm") ?? "demo-firm",
  name: "Dev Trustee",
  role: "trustee",
});
