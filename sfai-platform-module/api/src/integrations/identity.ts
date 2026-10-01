// Login accounts for client-portal users, in the shared Cognito user pool.
// Staff accounts are made by an admin; this only ever creates role "client" users.
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

export interface PortalUser {
  email: string;
  name: string;
  password: string;
  firmId: string;
  clientId: string;
}

export interface Identity {
  roleOf(email: string): Promise<string | null>; // null = no account yet
  createClientUser(u: PortalUser): Promise<void>;
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
    async createClientUser(u) {
      await cognito.send(
        new AdminCreateUserCommand({
          UserPoolId,
          Username: u.email,
          MessageAction: "SUPPRESS",
          UserAttributes: [
            { Name: "email", Value: u.email },
            { Name: "email_verified", Value: "true" },
            { Name: "name", Value: u.name },
            { Name: "custom:firm_id", Value: u.firmId },
            { Name: "custom:role", Value: "client" },
            { Name: "custom:client_id", Value: u.clientId },
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
    },
  };
}

export class WeakPasswordError extends Error {
  constructor() {
    super("Password does not meet the password policy");
  }
}
