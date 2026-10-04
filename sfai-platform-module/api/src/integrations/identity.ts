// Login accounts in the shared Cognito user pool: a trustee signing up a new firm,
// or a client activating their portal invite. Staff for an existing firm are
// invited by an admin in the Cognito console.
import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  InvalidPasswordException,
  UserNotFoundException,
} from "@aws-sdk/client-cognito-identity-provider";
import type { Config } from "../config.js";

export interface NewUser {
  email: string;
  name: string;
  password: string;
  firmId: string;
  role: "trustee" | "client";
}

export interface Identity {
  roleOf(email: string): Promise<string | null>; // null = no account yet
  createUser(u: NewUser): Promise<string>; // returns the new user's id
}

export function createIdentity(cfg: Config): Identity {
  const cognito = new CognitoIdentityProviderClient({ region: cfg.region });
  const UserPoolId = cfg.cognito?.userPoolId ?? "";

  return {
    // Look up an existing account by email (the pool signs in with email)
    async roleOf(email) {
      try {
        const u = await cognito.send(
          new AdminGetUserCommand({ UserPoolId, Username: email }),
        );
        const role = u.UserAttributes?.find((a) => a.Name === "custom:role")?.Value;
        return role ?? "staff";
      } catch (e) {
        if (e instanceof UserNotFoundException) return null;
        throw e;
      }
    },

    // Create the account with a permanent password and no welcome email
    async createUser(u) {
      const res = await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId,
          Username: u.email,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            { Name: "email", Value: u.email },
            { Name: "email_verified", Value: "true" },
            { Name: "name", Value: u.name },
            { Name: "custom:firm_id", Value: u.firmId },
            { Name: "custom:role", Value: u.role },
          ],
        }),
      );
      try {
        await cognito.send(
          new AdminSetUserPasswordCommand({
            UserPoolId,
            Username: u.email,
            Password: u.password,
            Permanent: true,
          }),
        );
      } catch (e) {
        // Password too weak for the pool's policy: undo, so they can try again
        await cognito.send(new AdminDeleteUserCommand({ UserPoolId, Username: u.email }));
        if (e instanceof InvalidPasswordException) throw new WeakPasswordError();
        throw e;
      }
      return res.User!.Attributes!.find((a) => a.Name === "sub")!.Value!;
    },
  };
}

export class WeakPasswordError extends Error {
  constructor() {
    super("Password does not meet the password policy");
  }
}
