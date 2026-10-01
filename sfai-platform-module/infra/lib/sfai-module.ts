// SfaiModule: drop this construct into the host project's CDK stack.
// It REUSES the host's VPC, database, Cognito login and HTTP API (no second copies),
// and adds only what the module needs: the API Lambda, a worker Lambda + SQS queue
// for document analysis, the documents bucket, a key, a secret and a schedule.
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
import * as sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as scheduler from "aws-cdk-lib/aws-scheduler";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as targets from "aws-cdk-lib/aws-scheduler-targets";
import * as secrets from "aws-cdk-lib/aws-secretsmanager";
import * as triggers from "aws-cdk-lib/triggers";

export interface SfaiModuleProps {
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
  basePath?: string; // default "/api"
  bedrockModelId?: string; // default anthropic.claude-opus-5-5
  analysisModelId?: string; // document analysis model (default: bedrockModelId)
}

const API_DIR = path.join(__dirname, "../../api"); // the backend package
const ROOT = path.join(__dirname, "../.."); // npm workspace root (lockfile)

export class SfaiModule extends Construct {
  readonly fn: nodejs.NodejsFunction;
  readonly worker: nodejs.NodejsFunction;
  readonly queue: sqs.Queue;
  readonly bucket: s3.Bucket;
  readonly secret: secrets.Secret;

  constructor(scope: Construct, id: string, props: SfaiModuleProps) {
    super(scope, id);
    const base = props.basePath ?? "/api";

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

    // Background jobs (document analysis). Failed jobs retry 3 times, then wait in
    // the dead-letter queue for 14 days so nothing is lost.
    const dlq = new sqs.Queue(this, "JobsDlq", {
      retentionPeriod: Duration.days(14),
      enforceSSL: true,
    });
    this.queue = new sqs.Queue(this, "Jobs", {
      visibilityTimeout: Duration.minutes(6), // longer than the worker's timeout
      deadLetterQueue: { queue: dlq, maxReceiveCount: 3 },
      enforceSSL: true,
    });

    const environment = {
      ...common.environment,
      API_BASE_PATH: base,
      APP_URL: props.appUrl,
      PUBLIC_API_URL: props.httpApi.apiEndpoint,
      DOCS_BUCKET: this.bucket.bucketName,
      KMS_KEY_ID: key.keyArn,
      EMAIL_FROM: props.emailFrom,
      COGNITO_USER_POOL_ID: props.userPool.userPoolId,
      COGNITO_CLIENT_ID: props.userPoolClient.userPoolClientId,
      BEDROCK_MODEL_ID: props.bedrockModelId ?? "anthropic.claude-opus-5-5",
      ANALYSIS_MODEL_ID:
        props.analysisModelId ?? props.bedrockModelId ?? "anthropic.claude-opus-5-5",
      JOBS_QUEUE_URL: this.queue.queueUrl,
    };
    const entry = path.join(API_DIR, "src/handlers/lambda.ts");

    // The API (also handles the 15-minute scheduled job)
    this.fn = new nodejs.NodejsFunction(this, "Api", {
      ...common,
      entry,
      memorySize: 1024,
      timeout: Duration.seconds(29), // API Gateway's limit is 30s
      environment,
    });

    // The worker: same code, longer timeout, fed by the queue one job at a time
    this.worker = new nodejs.NodejsFunction(this, "Worker", {
      ...common,
      entry,
      memorySize: 1024,
      timeout: Duration.minutes(5), // a long PDF can take a minute or two
      environment,
    });
    this.worker.addEventSource(
      new sources.SqsEventSource(this.queue, {
        batchSize: 1,
        reportBatchItemFailures: true,
      }),
    );
    this.queue.grantSendMessages(this.fn);

    // Least privilege for everything both functions call
    for (const fn of [this.fn, this.worker]) {
      props.database.secret.grantRead(fn);
      this.secret.grantRead(fn);
      this.bucket.grantReadWrite(fn);
      key.grantEncryptDecrypt(fn);
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["ses:SendEmail"],
          resources: [
            `arn:aws:ses:${Stack.of(this).region}:${Stack.of(this).account}:identity/*`,
          ],
        }),
      );
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["sns:Publish"],
          resources: ["*"], // direct-to-phone SMS has no topic ARN
        }),
      );
      fn.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["bedrock-mantle:CreateInference"],
          resources: ["*"], // Ask your CRM, chat, document analysis
        }),
      );
    }
    // Client-portal sign-up: create "client" logins in the shared pool
    this.fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminDeleteUser",
        ],
        resources: [props.userPool.userPoolArn],
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
