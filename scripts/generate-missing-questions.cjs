const fs = require('fs');
const path = require('path');

// All required topics and subtopics from DVA-C02 exam
const REQUIRED_TOPICS = {
  'domain-1-development': {
    'lambda': [
      'lambda-concurrency', 'lambda-vpc-integration', 'lambda-configuration',
      'lambda-layers', 'lambda-destinations', 'lambda-error-handling',
      'lambda-performance-optimization', 'lambda-event-sources', 'lambda-permissions'
    ],
    'dynamodb': [
      'dynamodb-partition-keys', 'dynamodb-indexes', 'dynamodb-consistency',
      'dynamodb-queries-scans', 'dynamodb-streams', 'dynamodb-transactions',
      'dynamodb-ttl', 'dynamodb-global-tables', 'dynamodb-capacity-modes'
    ],
    'api-gateway': [
      'api-gateway-integration', 'api-gateway-authentication', 'api-gateway-stages',
      'api-gateway-caching', 'api-gateway-throttling', 'api-gateway-cors',
      'api-gateway-websocket', 'api-gateway-rest-vs-http'
    ],
    's3': [
      's3-storage-classes', 's3-lifecycle-policies', 's3-versioning',
      's3-replication', 's3-event-notifications', 's3-presigned-urls',
      's3-multipart-upload', 's3-performance-optimization'
    ],
    'sqs': [
      'sqs-standard-vs-fifo', 'sqs-visibility-timeout', 'sqs-dead-letter-queues',
      'sqs-long-polling', 'sqs-message-retention', 'sqs-batch-operations'
    ],
    'sns': [
      'sns-topics-subscriptions', 'sns-message-filtering', 'sns-fanout-pattern',
      'sns-delivery-policies'
    ],
    'eventbridge': [
      'eventbridge-rules-patterns', 'eventbridge-event-buses', 'eventbridge-targets',
      'eventbridge-archive-replay'
    ],
    'step-functions': [
      'step-functions-state-types', 'step-functions-error-handling',
      'step-functions-parallel-execution', 'step-functions-express-vs-standard'
    ],
    'kinesis': [
      'kinesis-data-streams', 'kinesis-shards-scaling', 'kinesis-consumers',
      'kinesis-data-firehose'
    ],
    'elasticache': [
      'elasticache-redis-vs-memcached', 'elasticache-caching-strategies',
      'elasticache-cluster-modes'
    ],
    'rds-aurora': [
      'rds-read-replicas', 'rds-multi-az', 'rds-encryption', 'aurora-serverless'
    ],
    'elastic-beanstalk': [
      'beanstalk-deployment-strategies', 'beanstalk-configuration', 'beanstalk-environments'
    ],
    'ecs-eks': [
      'ecs-task-definitions', 'ecs-service-deployment', 'ecs-fargate-vs-ec2'
    ],
    'architectural-patterns': [
      'event-driven-architecture', 'microservices-patterns', 'serverless-patterns',
      'loose-coupling', 'fanout-pattern'
    ]
  },
  'domain-2-security': {
    'iam': [
      'iam-roles-vs-users', 'iam-policies', 'iam-policy-evaluation',
      'iam-least-privilege', 'iam-cross-account-access', 'iam-permission-boundaries'
    ],
    'cognito': [
      'cognito-user-pools', 'cognito-identity-pools', 'cognito-authentication-flow',
      'cognito-federation', 'cognito-tokens-jwt'
    ],
    'kms': [
      'kms-cmk-types', 'kms-encryption-at-rest', 'kms-envelope-encryption',
      'kms-key-policies', 'kms-key-rotation'
    ],
    'secrets-manager': [
      'secrets-manager-rotation', 'secrets-manager-vs-parameter-store',
      'secrets-manager-retrieval'
    ],
    'parameter-store': [
      'parameter-store-types', 'parameter-store-hierarchies', 'parameter-store-encryption'
    ],
    'acm': [
      'acm-certificate-validation', 'acm-certificate-renewal'
    ],
    'waf': [
      'waf-web-acls', 'waf-rules', 'waf-rate-limiting'
    ],
    'security-best-practices': [
      'encryption-in-transit', 'encryption-at-rest', 'secret-management',
      'credential-management'
    ]
  },
  'domain-3-deployment': {
    'codecommit': [
      'codecommit-repositories', 'codecommit-branches', 'codecommit-triggers'
    ],
    'codebuild': [
      'codebuild-buildspec', 'codebuild-artifacts', 'codebuild-environment-variables',
      'codebuild-docker-builds'
    ],
    'codedeploy': [
      'codedeploy-deployment-types', 'codedeploy-appspec', 'codedeploy-hooks',
      'codedeploy-rollback', 'codedeploy-blue-green', 'codedeploy-lambda-deployments'
    ],
    'codepipeline': [
      'codepipeline-stages-actions', 'codepipeline-artifacts', 'codepipeline-approval-actions',
      'codepipeline-cross-region'
    ],
    'cloudformation': [
      'cloudformation-templates', 'cloudformation-stack-updates', 'cloudformation-change-sets',
      'cloudformation-nested-stacks', 'cloudformation-drift-detection'
    ],
    'sam': [
      'sam-templates', 'sam-cli', 'sam-local-testing', 'sam-deployment'
    ],
    'cdk': [
      'cdk-constructs', 'cdk-stacks', 'cdk-deployment'
    ],
    'deployment-strategies': [
      'blue-green-deployment', 'canary-deployment', 'rolling-deployment',
      'immutable-deployment', 'deployment-rollback'
    ],
    'lambda-deployment': [
      'lambda-versions-aliases', 'lambda-deployment-packages', 'lambda-container-images'
    ],
    'environment-management': [
      'dev-test-prod-environments', 'environment-variables', 'appconfig'
    ]
  },
  'domain-4-troubleshooting': {
    'cloudwatch': [
      'cloudwatch-metrics', 'cloudwatch-logs', 'cloudwatch-alarms',
      'cloudwatch-dashboards', 'cloudwatch-log-insights', 'cloudwatch-embedded-metric-format'
    ],
    'xray': [
      'xray-tracing', 'xray-segments-subsegments', 'xray-annotations-metadata',
      'xray-service-map', 'xray-sampling'
    ],
    'cloudtrail': [
      'cloudtrail-events', 'cloudtrail-log-analysis'
    ],
    'debugging': [
      'lambda-debugging', 'api-gateway-debugging', 'permission-errors', 'timeout-issues'
    ],
    'performance-optimization': [
      'lambda-memory-optimization', 'dynamodb-performance', 'api-gateway-performance',
      'caching-strategies', 'cold-start-optimization'
    ],
    'cost-optimization': [
      'right-sizing-resources', 'reserved-capacity', 'lambda-cost-optimization'
    ],
    'observability': [
      'structured-logging', 'correlation-ids', 'distributed-tracing', 'monitoring-strategies'
    ]
  }
};

// Read current question bank
const BANK_PATH = path.join(__dirname, '../public/question_bank.json');
const data = JSON.parse(fs.readFileSync(BANK_PATH, 'utf8'));

// Get existing coverage
const existingCoverage = new Set();
for (const domain of data.domains) {
  for (const topic of domain.topics) {
    for (const subtopic of topic.subtopics) {
      if (subtopic.questions.length > 0) {
        existingCoverage.add(`${topic.topic_id}/${subtopic.subtopic_id}`);
      }
    }
  }
}

// Find missing topics
const missing = [];
for (const [domainId, topics] of Object.entries(REQUIRED_TOPICS)) {
  for (const [topicId, subtopics] of Object.entries(topics)) {
    for (const subtopicId of subtopics) {
      const key = `${topicId}/${subtopicId}`;
      if (!existingCoverage.has(key)) {
        missing.push({
          domainId,
          topicId,
          subtopicId,
          topicName: topicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          subtopicName: subtopicId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        });
      }
    }
  }
}

console.log('Missing topics/subtopics:', missing.length);
console.log('');
missing.forEach(m => console.log(`  ${m.domainId} > ${m.topicId} > ${m.subtopicId}`));

// Output as JSON for the generation script
fs.writeFileSync(
  path.join(__dirname, 'missing-topics.json'),
  JSON.stringify(missing, null, 2)
);
console.log('');
console.log('Saved to scripts/missing-topics.json');
