// Example HOST stack: the shared platform the bigger SFAI project owns.
// One VPC, one database, one login, one API -> the CRM (and later modules) plug in.
// Copy the parts you don't already have into the host project's CDK app.
import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as backup from "aws-cdk-lib/aws-backup";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as events from "aws-cdk-lib/aws-events";
import * as rds from "aws-cdk-lib/aws-rds";
import { CrmModule } from "./crm-module";

export interface SharedPlatformProps extends StackProps {
  appUrl: string; // the SFAI front end
  emailFrom: string; // SES-verified sender
  websiteOrigins: string[]; // trustee websites that embed the lead form
}

export class SharedPlatformStack extends Stack {
  constructor(scope: Construct, id: string, props: SharedPlatformProps) {
    super(scope, id, props);

    // ---------- Network ----------
    // A tiny NAT *instance* (~$3/mo) instead of a NAT gateway (~$35+/mo)
    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 1,
      natGatewayProvider: ec2.NatProvider.instanceV2({
        instanceType: new ec2.InstanceType("t4g.nano"),
        defaultAllowedTraffic: ec2.NatTrafficDirection.OUTBOUND_ONLY,
      }),
      subnetConfiguration: [
        { name: "public", subnetType: ec2.SubnetType.PUBLIC },
        { name: "app", subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        { name: "data", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
      gatewayEndpoints: { S3: { service: ec2.GatewayVpcEndpointAwsService.S3 } }, // free
    });

    // ---------- Database (shared; each module uses its own schema) ----------
    const db = new rds.DatabaseInstance(this, "Db", {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17,
      }),
      instanceType: new ec2.InstanceType("t4g.micro"),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      credentials: rds.Credentials.fromGeneratedSecret("sfai_admin"),
      databaseName: "sfai",
      allocatedStorage: 20,
      maxAllocatedStorage: 100, // grows automatically if needed
      storageType: rds.StorageType.GP3,
      storageEncrypted: true,
      multiAz: false, // single instance keeps cost low; turn on for a standby
      // Automated backups: daily snapshots + point-in-time restore for 14 days
      backupRetention: Duration.days(14),
      preferredBackupWindow: "07:00-08:00", // 3-4am Toronto
      deleteAutomatedBackups: false,
      copyTagsToSnapshot: true,
      deletionProtection: true,
      removalPolicy: RemovalPolicy.SNAPSHOT, // final snapshot if the stack is deleted
      cloudwatchLogsExports: ["postgresql"],
    });

    // Long-term backups: a monthly snapshot kept for 1 year (AWS Backup)
    const plan = new backup.BackupPlan(this, "MonthlyBackups", {
      backupPlanRules: [
        new backup.BackupPlanRule({
          ruleName: "monthly-1-year",
          scheduleExpression: events.Schedule.cron({ day: "1", hour: "8", minute: "0" }),
          deleteAfter: Duration.days(365),
        }),
      ],
    });
    plan.addSelection("Database", {
      resources: [backup.BackupResource.fromRdsDatabaseInstance(db)],
    });

    // ---------- Login (shared) ----------
    const userPool = new cognito.UserPool(this, "Users", {
      selfSignUpEnabled: false, // staff are invited by an admin
      signInAliases: { email: true },
      customAttributes: {
        firm_id: new cognito.StringAttribute({ mutable: true }),
        role: new cognito.StringAttribute({ mutable: true }), // trustee | staff
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: { otp: true, sms: false },
      passwordPolicy: { minLength: 12 },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    const userPoolClient = userPool.addClient("Web", {
      authFlows: { userSrp: true },
      // Users can't edit their own firm or role (only admins can)
      writeAttributes: new cognito.ClientAttributes().withStandardAttributes({
        fullname: true,
        email: true,
      }),
    });

    // ---------- API (shared) ----------
    const httpApi = new apigw.HttpApi(this, "Api", {
      corsPreflight: {
        allowOrigins: [props.appUrl, ...props.websiteOrigins],
        allowHeaders: ["authorization", "content-type"],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        maxAge: Duration.hours(1),
      },
    });
    // Throttle the whole API, and the public (no-login) routes much harder
    const stage = httpApi.defaultStage!.node.defaultChild as apigw.CfnStage;
    stage.defaultRouteSettings = { throttlingRateLimit: 50, throttlingBurstLimit: 100 };
    stage.routeSettings = {
      "POST /crm/public/{proxy+}": { throttlingRateLimit: 2, throttlingBurstLimit: 5 },
    };

    // ---------- Modules ----------
    const crm = new CrmModule(this, "Crm", {
      vpc,
      database: {
        secret: db.secret!,
        securityGroup: db.connections.securityGroups[0],
        instance: db,
      },
      userPool,
      userPoolClient,
      httpApi,
      appUrl: props.appUrl,
      emailFrom: props.emailFrom,
    });

    new CfnOutput(this, "ApiUrl", { value: httpApi.apiEndpoint });
    new CfnOutput(this, "UserPoolId", { value: userPool.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: userPoolClient.userPoolClientId });
    new CfnOutput(this, "CrmSecretArn", { value: crm.secret.secretArn });
  }
}
