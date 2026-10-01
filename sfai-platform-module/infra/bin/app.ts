// CDK entry: `npx cdk deploy` (settings come from cdk.json "context" or -c flags)
import { App } from "aws-cdk-lib";
import { SharedPlatformStack } from "../lib/shared-platform";

const app = new App();
const ctx = (key: string) => app.node.tryGetContext(key);

new SharedPlatformStack(app, "SfaiPlatform", {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "ca-central-1" },
  appUrl: ctx("appUrl"),
  emailFrom: ctx("emailFrom"),
  websiteOrigins: ctx("websiteOrigins") ?? [],
});
