const fs = require('fs');
const path = require('path');

// All required DVA-C02 topics/subtopics for flashcards
const REQUIRED_TOPICS = [
  // Domain 1: Development with AWS Services
  { domainId: 'domain-1-development', categoryId: 'lambda', categoryName: 'AWS Lambda', subtopics: [
    { id: 'lambda-basics', name: 'Lambda Basics and Invocation Models' },
    { id: 'lambda-concurrency', name: 'Lambda Concurrency and Scaling' },
    { id: 'lambda-layers', name: 'Lambda Layers' },
    { id: 'lambda-destinations', name: 'Lambda Destinations' },
    { id: 'lambda-error-handling', name: 'Lambda Error Handling' },
    { id: 'lambda-performance', name: 'Lambda Performance Optimization' },
    { id: 'lambda-event-sources', name: 'Lambda Event Sources' },
    { id: 'lambda-permissions', name: 'Lambda Permissions and Execution Roles' },
    { id: 'lambda-versions-aliases', name: 'Lambda Versions and Aliases' },
    { id: 'lambda-environment-variables', name: 'Lambda Environment Variables' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'dynamodb', categoryName: 'Amazon DynamoDB', subtopics: [
    { id: 'dynamodb-basics', name: 'DynamoDB Basics and Data Modeling' },
    { id: 'dynamodb-indexes', name: 'DynamoDB Indexes (LSI/GSI)' },
    { id: 'dynamodb-queries-scans', name: 'DynamoDB Queries and Scans' },
    { id: 'dynamodb-streams', name: 'DynamoDB Streams' },
    { id: 'dynamodb-transactions', name: 'DynamoDB Transactions' },
    { id: 'dynamodb-ttl', name: 'DynamoDB TTL' },
    { id: 'dynamodb-global-tables', name: 'DynamoDB Global Tables' },
    { id: 'dynamodb-capacity-modes', name: 'DynamoDB Capacity Modes' },
    { id: 'dynamodb-dax', name: 'DynamoDB DAX' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'api-gateway', categoryName: 'Amazon API Gateway', subtopics: [
    { id: 'api-gateway-basics', name: 'API Gateway Basics' },
    { id: 'api-gateway-authentication', name: 'API Gateway Authentication' },
    { id: 'api-gateway-throttling', name: 'API Gateway Throttling and Caching' },
    { id: 'api-gateway-cors', name: 'API Gateway CORS' },
    { id: 'api-gateway-websocket', name: 'API Gateway WebSocket APIs' },
    { id: 'api-gateway-rest-vs-http', name: 'REST API vs HTTP API' },
    { id: 'api-gateway-stages', name: 'API Gateway Stages and Deployments' }
  ]},
  { domainId: 'domain-1-development', categoryId: 's3', categoryName: 'Amazon S3', subtopics: [
    { id: 's3-basics', name: 'S3 Basics and Storage Classes' },
    { id: 's3-lifecycle-policies', name: 'S3 Lifecycle Policies' },
    { id: 's3-versioning', name: 'S3 Versioning' },
    { id: 's3-replication', name: 'S3 Replication' },
    { id: 's3-event-notifications', name: 'S3 Event Notifications' },
    { id: 's3-presigned-urls', name: 'S3 Presigned URLs' },
    { id: 's3-multipart-upload', name: 'S3 Multipart Upload' },
    { id: 's3-performance', name: 'S3 Performance Optimization' },
    { id: 's3-encryption', name: 'S3 Encryption' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'sqs', categoryName: 'Amazon SQS', subtopics: [
    { id: 'sqs-basics', name: 'SQS Basics' },
    { id: 'sqs-standard-vs-fifo', name: 'SQS Standard vs FIFO' },
    { id: 'sqs-long-polling', name: 'SQS Long Polling' },
    { id: 'sqs-visibility-timeout', name: 'SQS Visibility Timeout' },
    { id: 'sqs-dead-letter-queues', name: 'SQS Dead Letter Queues' },
    { id: 'sqs-batch-operations', name: 'SQS Batch Operations' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'sns', categoryName: 'Amazon SNS', subtopics: [
    { id: 'sns-basics', name: 'SNS Basics' },
    { id: 'sns-fanout-pattern', name: 'SNS Fanout Pattern' },
    { id: 'sns-message-filtering', name: 'SNS Message Filtering' },
    { id: 'sns-delivery-policies', name: 'SNS Delivery Policies' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'eventbridge', categoryName: 'Amazon EventBridge', subtopics: [
    { id: 'eventbridge-basics', name: 'EventBridge Basics' },
    { id: 'eventbridge-rules-patterns', name: 'EventBridge Rules and Patterns' },
    { id: 'eventbridge-event-buses', name: 'EventBridge Event Buses' },
    { id: 'eventbridge-targets', name: 'EventBridge Targets' },
    { id: 'eventbridge-archive-replay', name: 'EventBridge Archive and Replay' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'step-functions', categoryName: 'AWS Step Functions', subtopics: [
    { id: 'step-functions-basics', name: 'Step Functions Basics' },
    { id: 'step-functions-state-types', name: 'Step Functions State Types' },
    { id: 'step-functions-error-handling', name: 'Step Functions Error Handling' },
    { id: 'step-functions-express-vs-standard', name: 'Express vs Standard Workflows' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'kinesis', categoryName: 'Amazon Kinesis', subtopics: [
    { id: 'kinesis-data-streams', name: 'Kinesis Data Streams' },
    { id: 'kinesis-shards', name: 'Kinesis Shards and Scaling' },
    { id: 'kinesis-consumers', name: 'Kinesis Consumers' },
    { id: 'kinesis-firehose', name: 'Kinesis Data Firehose' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'elasticache', categoryName: 'Amazon ElastiCache', subtopics: [
    { id: 'elasticache-redis-vs-memcached', name: 'Redis vs Memcached' },
    { id: 'elasticache-caching-strategies', name: 'Caching Strategies' },
    { id: 'elasticache-cluster-modes', name: 'ElastiCache Cluster Modes' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'rds-aurora', categoryName: 'Amazon RDS and Aurora', subtopics: [
    { id: 'rds-basics', name: 'RDS Basics' },
    { id: 'rds-read-replicas', name: 'RDS Read Replicas' },
    { id: 'rds-multi-az', name: 'RDS Multi-AZ' },
    { id: 'rds-encryption', name: 'RDS Encryption' },
    { id: 'aurora-serverless', name: 'Aurora Serverless' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'ecs-fargate', categoryName: 'Amazon ECS and Fargate', subtopics: [
    { id: 'ecs-task-definitions', name: 'ECS Task Definitions' },
    { id: 'ecs-services', name: 'ECS Services' },
    { id: 'ecs-fargate-vs-ec2', name: 'Fargate vs EC2 Launch Type' }
  ]},
  { domainId: 'domain-1-development', categoryId: 'elastic-beanstalk', categoryName: 'AWS Elastic Beanstalk', subtopics: [
    { id: 'beanstalk-basics', name: 'Elastic Beanstalk Basics' },
    { id: 'beanstalk-deployment-strategies', name: 'Beanstalk Deployment Strategies' },
    { id: 'beanstalk-configuration', name: 'Beanstalk Configuration' }
  ]},

  // Domain 2: Security
  { domainId: 'domain-2-security', categoryId: 'iam', categoryName: 'AWS IAM', subtopics: [
    { id: 'iam-basics', name: 'IAM Basics' },
    { id: 'iam-policies', name: 'IAM Policies' },
    { id: 'iam-roles-vs-users', name: 'IAM Roles vs Users' },
    { id: 'iam-policy-evaluation', name: 'IAM Policy Evaluation' },
    { id: 'iam-least-privilege', name: 'Least Privilege Principle' },
    { id: 'iam-cross-account-access', name: 'Cross-Account Access' },
    { id: 'iam-permission-boundaries', name: 'Permission Boundaries' },
    { id: 'iam-sts', name: 'AWS STS' }
  ]},
  { domainId: 'domain-2-security', categoryId: 'cognito', categoryName: 'Amazon Cognito', subtopics: [
    { id: 'cognito-user-pools', name: 'Cognito User Pools' },
    { id: 'cognito-identity-pools', name: 'Cognito Identity Pools' },
    { id: 'cognito-authentication-flow', name: 'Cognito Authentication Flow' },
    { id: 'cognito-federation', name: 'Cognito Federation' },
    { id: 'cognito-tokens', name: 'Cognito Tokens and JWT' }
  ]},
  { domainId: 'domain-2-security', categoryId: 'kms', categoryName: 'AWS KMS', subtopics: [
    { id: 'kms-basics', name: 'KMS Basics' },
    { id: 'kms-cmk-types', name: 'KMS CMK Types' },
    { id: 'kms-envelope-encryption', name: 'Envelope Encryption' },
    { id: 'kms-key-policies', name: 'KMS Key Policies' },
    { id: 'kms-key-rotation', name: 'KMS Key Rotation' }
  ]},
  { domainId: 'domain-2-security', categoryId: 'secrets-manager', categoryName: 'AWS Secrets Manager', subtopics: [
    { id: 'secrets-manager-basics', name: 'Secrets Manager Basics' },
    { id: 'secrets-manager-rotation', name: 'Secret Rotation' },
    { id: 'secrets-manager-vs-parameter-store', name: 'Secrets Manager vs Parameter Store' }
  ]},
  { domainId: 'domain-2-security', categoryId: 'parameter-store', categoryName: 'Systems Manager Parameter Store', subtopics: [
    { id: 'parameter-store-basics', name: 'Parameter Store Basics' },
    { id: 'parameter-store-types', name: 'Parameter Types' },
    { id: 'parameter-store-hierarchies', name: 'Parameter Hierarchies' }
  ]},
  { domainId: 'domain-2-security', categoryId: 'acm', categoryName: 'AWS Certificate Manager', subtopics: [
    { id: 'acm-basics', name: 'ACM Basics' },
    { id: 'acm-validation', name: 'Certificate Validation' }
  ]},
  { domainId: 'domain-2-security', categoryId: 'waf', categoryName: 'AWS WAF', subtopics: [
    { id: 'waf-basics', name: 'WAF Basics' },
    { id: 'waf-rules', name: 'WAF Rules and Web ACLs' }
  ]},

  // Domain 3: Deployment
  { domainId: 'domain-3-deployment', categoryId: 'codecommit', categoryName: 'AWS CodeCommit', subtopics: [
    { id: 'codecommit-basics', name: 'CodeCommit Basics' },
    { id: 'codecommit-triggers', name: 'CodeCommit Triggers' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'codebuild', categoryName: 'AWS CodeBuild', subtopics: [
    { id: 'codebuild-basics', name: 'CodeBuild Basics' },
    { id: 'codebuild-buildspec', name: 'buildspec.yml' },
    { id: 'codebuild-environment-variables', name: 'CodeBuild Environment Variables' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'codedeploy', categoryName: 'AWS CodeDeploy', subtopics: [
    { id: 'codedeploy-basics', name: 'CodeDeploy Basics' },
    { id: 'codedeploy-appspec', name: 'appspec.yml' },
    { id: 'codedeploy-deployment-types', name: 'CodeDeploy Deployment Types' },
    { id: 'codedeploy-hooks', name: 'CodeDeploy Lifecycle Hooks' },
    { id: 'codedeploy-rollback', name: 'CodeDeploy Rollback' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'codepipeline', categoryName: 'AWS CodePipeline', subtopics: [
    { id: 'codepipeline-basics', name: 'CodePipeline Basics' },
    { id: 'codepipeline-stages-actions', name: 'CodePipeline Stages and Actions' },
    { id: 'codepipeline-artifacts', name: 'CodePipeline Artifacts' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'cloudformation', categoryName: 'AWS CloudFormation', subtopics: [
    { id: 'cloudformation-basics', name: 'CloudFormation Basics' },
    { id: 'cloudformation-intrinsic-functions', name: 'Intrinsic Functions' },
    { id: 'cloudformation-stack-updates', name: 'Stack Updates' },
    { id: 'cloudformation-change-sets', name: 'Change Sets' },
    { id: 'cloudformation-nested-stacks', name: 'Nested Stacks' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'sam', categoryName: 'AWS SAM', subtopics: [
    { id: 'sam-basics', name: 'SAM Basics' },
    { id: 'sam-templates', name: 'SAM Templates' },
    { id: 'sam-cli', name: 'SAM CLI' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'cdk', categoryName: 'AWS CDK', subtopics: [
    { id: 'cdk-basics', name: 'CDK Basics' },
    { id: 'cdk-constructs', name: 'CDK Constructs' }
  ]},
  { domainId: 'domain-3-deployment', categoryId: 'deployment-strategies', categoryName: 'Deployment Strategies', subtopics: [
    { id: 'blue-green-deployment', name: 'Blue-Green Deployment' },
    { id: 'canary-deployment', name: 'Canary Deployment' },
    { id: 'rolling-deployment', name: 'Rolling Deployment' },
    { id: 'immutable-deployment', name: 'Immutable Deployment' }
  ]},

  // Domain 4: Troubleshooting and Optimization
  { domainId: 'domain-4-troubleshooting', categoryId: 'cloudwatch', categoryName: 'Amazon CloudWatch', subtopics: [
    { id: 'cloudwatch-basics', name: 'CloudWatch Basics' },
    { id: 'cloudwatch-logs', name: 'CloudWatch Logs' },
    { id: 'cloudwatch-metrics', name: 'CloudWatch Metrics' },
    { id: 'cloudwatch-alarms', name: 'CloudWatch Alarms' },
    { id: 'cloudwatch-log-insights', name: 'CloudWatch Logs Insights' },
    { id: 'cloudwatch-embedded-metric-format', name: 'Embedded Metric Format' }
  ]},
  { domainId: 'domain-4-troubleshooting', categoryId: 'xray', categoryName: 'AWS X-Ray', subtopics: [
    { id: 'xray-basics', name: 'X-Ray Basics' },
    { id: 'xray-segments-subsegments', name: 'X-Ray Segments and Subsegments' },
    { id: 'xray-annotations-metadata', name: 'X-Ray Annotations and Metadata' },
    { id: 'xray-service-map', name: 'X-Ray Service Map' },
    { id: 'xray-sampling', name: 'X-Ray Sampling' }
  ]},
  { domainId: 'domain-4-troubleshooting', categoryId: 'cloudtrail', categoryName: 'AWS CloudTrail', subtopics: [
    { id: 'cloudtrail-basics', name: 'CloudTrail Basics' },
    { id: 'cloudtrail-events', name: 'CloudTrail Event Types' }
  ]},
  { domainId: 'domain-4-troubleshooting', categoryId: 'debugging', categoryName: 'Debugging', subtopics: [
    { id: 'lambda-debugging', name: 'Lambda Debugging' },
    { id: 'api-gateway-debugging', name: 'API Gateway Debugging' },
    { id: 'permission-errors', name: 'Permission Error Troubleshooting' }
  ]},
  { domainId: 'domain-4-troubleshooting', categoryId: 'performance-optimization', categoryName: 'Performance Optimization', subtopics: [
    { id: 'lambda-optimization', name: 'Lambda Optimization' },
    { id: 'dynamodb-optimization', name: 'DynamoDB Optimization' },
    { id: 'caching-strategies', name: 'Caching Strategies' },
    { id: 'cold-start-optimization', name: 'Cold Start Optimization' }
  ]},
  { domainId: 'domain-4-troubleshooting', categoryId: 'cost-optimization', categoryName: 'Cost Optimization', subtopics: [
    { id: 'lambda-cost', name: 'Lambda Cost Optimization' },
    { id: 'right-sizing', name: 'Right-Sizing Resources' }
  ]}
];

// Flatten all subtopics into a list
function getAllRequiredSubtopics() {
  const subtopics = [];
  for (const topic of REQUIRED_TOPICS) {
    for (const subtopic of topic.subtopics) {
      subtopics.push({
        domainId: topic.domainId,
        categoryId: topic.categoryId,
        categoryName: topic.categoryName,
        subtopicId: subtopic.id,
        subtopicName: subtopic.name
      });
    }
  }
  return subtopics;
}

// Main
async function main() {
  const allRequired = getAllRequiredSubtopics();

  console.log(`Total required flashcard subtopics: ${allRequired.length}`);
  console.log('\nAll required subtopics:');

  // Group by category
  const byCategory = {};
  for (const s of allRequired) {
    if (!byCategory[s.categoryId]) {
      byCategory[s.categoryId] = [];
    }
    byCategory[s.categoryId].push(s);
  }

  for (const [cat, subs] of Object.entries(byCategory)) {
    console.log(`\n${cat}:`);
    for (const s of subs) {
      console.log(`  - ${s.subtopicId}: ${s.subtopicName}`);
    }
  }

  // Save to JSON for batch processing
  const outputPath = path.join(__dirname, 'flashcard-topics.json');
  fs.writeFileSync(outputPath, JSON.stringify(allRequired, null, 2));
  console.log(`\nSaved ${allRequired.length} subtopics to ${outputPath}`);
}

main().catch(console.error);
