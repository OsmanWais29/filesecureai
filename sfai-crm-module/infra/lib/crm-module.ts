// CrmModule: drop this construct into the host project's CDK stack.
// It REUSES the host's VPC, database, Cognito login and HTTP API (no second copies),
// and adds only what the CRM needs: Lambda, documents bucket, key, secret, schedule.
import * as path from "node:path";
import { Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as scheduler from "aws-cdk-lib/aws-scheduler";
import * as targets from "aws-cdk-lib/aws-scheduler-targets";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";
import * as triggers from "aws-cdk-lib/triggers";

export interface CrmModuleProps {
  vpc: ec2.IVpc; // host VPC (Lambda runs in its private subnets)
  database: {
    secret: secrets.ISecret; // RDS-generated credentials secret
    securityGroup: ec2.ISecurityGroup; // the database's security group
    instance?: Construct; // migrations run after this exists
  };
  userPool: cognito.IUserPool; // shared login
  userPoolClient: cognito.IUserPoolClient;
  httpApi: apigw.HttpApi; // shared API; the CRM is added under basePath
  appUrl: string; // front-end origin (CORS, OAuth redirect back)
  emailFrom: string; // SES-verified default sender
  basePath?: string; // default "/crm"
  bedrockModelId?: string; // default anthropic.claude-opus-5-5
}

const API_DIR = path.join(__dirname, "../../api"); // the backend package
const ROOT = path.join(__dirname, "../.."); // npm workspace root (lockfile)

export class CrmModule extends Construct {
  readonly fn: nodejs.NodejsFunction;
  readonly bucket: s3.Bucket;
  readonly secret: secrets.Secret;

  constructor(scope: Construct, id: string, props: CrmModuleProps) {
    super(scope, id);
    const base = props.basePath ?? "/crm";

    // Encrypts SINs, OAuth tokens and documents. Yearly automatic rotation.
    const key = new kms.Key(this, "Key", {
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.RETAIN,
      description: "SFAI CRM: client data encryption",
    });

    // Client documents: private, encrypted, versioned (old versions kept 90 days)
    this.bucket = new s3.Bucket(this, "Documents", {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
      bucketKeyEnabled: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      lifecycleRules: [{ noncurrentVersionExpiration: Duration.days(90) }],
      cors: [
        {
          allowedOrigins: [props.appUrl],
          allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });

    // Integration secrets (Google/Microsoft client secrets...): add values in the console
    this.secret = new secrets.Secret(this, "Secrets", {
      description: "SFAI CRM: GOOGLE_CLIENT_ID/SECRET, MS_CLIENT_ID/SECRET, ...",
      generateSecretString: {
        secretStringTemplate: "{}",
        generateStringKey: "OAUTH_STATE_SECRET",
        excludePunctuation: true,
        passwordLength: 48,
      },
    });

    // Shared Lambda settings: Node 22 on Graviton (cheaper), private subnets
    const sg = new ec2.SecurityGroup(this, "LambdaSg", { vpc: props.vpc });
    props.database.securityGroup.addIngressRule(sg, ec2.Port.tcp(5432), "CRM Lambda");
    const common: nodejs.NodejsFunctionProps = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [sg],
      projectRoot: ROOT,
      depsLockFilePath: path.join(ROOT, "package-lock.json"),
      bundling: {
        format: nodejs.OutputFormat.ESM, // allows top-level await
        target: "node22",
        sourceMap: true,
        externalModules: ["@aws-sdk/*"], // already in the Lambda runtime
        banner:
          "import{createRequire}from'module';" +
          "const require=createRequire(import.meta.url);",
      },
      environment: {
        DB_SECRET_ARN: props.database.secret.secretArn,
        CRM_SECRET_ARN: this.secret.secretArn,
        NODE_EXTRA_CA_CERTS: "/var/runtime/ca-cert.pem", // trust the RDS TLS certificate
        NODE_OPTIONS: "--enable-source-maps",
      },
      logGroup: new logs.LogGroup(this, "Logs", {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    };

    // The API (also handles the hourly scheduled job)
    this.fn = new nodejs.NodejsFunction(this, "Api", {
      ...common,
      entry: path.join(API_DIR, "src/handlers/lambda.ts"),
      memorySize: 1024,
      timeout: Duration.seconds(29), // API Gateway's limit is 30s
      environment: {
        ...common.environment,
        CRM_BASE_PATH: base,
        APP_URL: props.appUrl,
        PUBLIC_API_URL: props.httpApi.apiEndpoint,
        DOCS_BUCKET: this.bucket.bucketName,
        KMS_KEY_ID: key.keyArn,
        EMAIL_FROM: props.emailFrom,
        COGNITO_USER_POOL_ID: props.userPool.userPoolId,
        COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
        BEDROCK_MODEL_ID: props.bedrockModelId ?? "anthropic.claude-opus-5-5",
      },
    });

    // Least privilege for everything the API calls
    props.database.secret.grantRead(this.fn);
    this.secret.grantRead(this.fn);
    this.bucket.grantReadWrite(this.fn);
    key.grantEncryptDecrypt(this.fn);
    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ses:SendEmail"],
        resources: [
          `arn:aws:ses:${Stack.of(this).region}:${Stack.of(this).account}:identity/*`,
        ],
      }),
    );
    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sns:Publish"],
        resources: ["*"], // direct-to-phone SMS has no topic ARN
      }),
    );
    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["bedrock-mantle:CreateInference"],
        resources: ["*"], // Ask your CRM
      }),
    );

    // Routes on the shared API. Login is checked by API Gateway (Cognito) AND in code.
    const integration = new HttpLambdaIntegration("Crm", this.fn);
    const authorizer = new HttpUserPoolAuthorizer("CrmAuth", props.userPool, {
      userPoolClients: [props.userPoolClient],
    });
    props.httpApi.addRoutes({ path: `${base}/{proxy+}`, integration, authorizer });
    for (const open of [
      `${base}/health`,
      `${base}/public/{proxy+}`,
      `${base}/integrations/{provider}/callback`,
    ]) {
      props.httpApi.addRoutes({
        path: open,
        integration,
        methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
      });
    }

    // Database migrations run automatically after each deploy
    const migrate = new nodejs.NodejsFunction(this, "Migrate", {
      ...common,
      entry: path.join(API_DIR, "src/handlers/migrate.ts"),
      timeout: Duration.minutes(5),
      bundling: {
        ...common.bundling,
        commandHooks: {
          // ship the SQL migration files with the function
          beforeBundling: () => [],
          beforeInstall: () => [],
          afterBundling: (input, output) => [
            `cp -r ${input}/api/drizzle ${output}/drizzle`,
          ],
        },
      },
    });
    props.database.secret.grantRead(migrate);
    this.secret.grantRead(migrate);
    new triggers.Trigger(this, "RunMigrations", {
      handler: migrate,
      executeAfter: props.database.instance ? [props.database.instance] : [],
      executeOnHandlerChange: true,
    });

    // Every 15 minutes: automations, calendar sync, inbound email sync
    new scheduler.Schedule(this, "Every15Min", {
      schedule: scheduler.ScheduleExpression.rate(Duration.minutes(15)),
      target: new targets.LambdaInvoke(this.fn, {
        input: scheduler.ScheduleTargetInput.fromObject({ source: "sfai.crm.scheduler" }),
      }),
    });
  }
}
