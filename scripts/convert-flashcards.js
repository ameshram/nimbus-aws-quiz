import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category definitions with keywords for auto-detection
const CATEGORIES = [
  { id: 'api-gateway', name: 'API Gateway', keywords: ['API Gateway', 'throttling', 'token bucket', 'rate limit', 'burst limit', '429'] },
  { id: 'lambda', name: 'AWS Lambda', keywords: ['Lambda', 'serverless', 'execution timeout'] },
  { id: 'codepipeline', name: 'CI/CD (CodePipeline, CodeBuild, CodeDeploy)', keywords: ['CodePipeline', 'CodeBuild', 'CodeDeploy', 'buildspec', 'appspec', 'Blue/Green', 'In-Place', 'deployment'] },
  { id: 'cognito', name: 'Amazon Cognito', keywords: ['Cognito', 'User Pool', 'Identity Pool', 'authentication', 'authorization', 'Federated'] },
  { id: 'iam', name: 'IAM & Security', keywords: ['IAM', 'Role', 'credentials', 'permissions', '--dry-run', 'encryption', 'SSE-', 'KMS', 'least privilege'] },
  { id: 'ec2', name: 'EC2 & Compute', keywords: ['EC2', 'instance', 'User Data', 'On-Demand', 'Spot', 'Security Group', 'connection refused'] },
  { id: 'elb-asg', name: 'ELB & Auto Scaling', keywords: ['Load Balancer', 'ALB', 'NLB', 'Auto Scaling', 'ASG', 'X-Forwarded-For', 'Layer 7', 'Layer 4'] },
  { id: 'ebs', name: 'EBS Storage', keywords: ['EBS', 'Elastic Block Store', 'Instance Store', 'network drive'] },
  { id: 'elastic-beanstalk', name: 'Elastic Beanstalk', keywords: ['Elastic Beanstalk', 'Beanstalk', '.ebextensions', 'Immutable', 'All at once'] },
  { id: 'rds-aurora', name: 'RDS & Aurora', keywords: ['RDS', 'Aurora', 'Read Replica', 'Multi-AZ', 'relational database'] },
  { id: 'route53', name: 'Route 53', keywords: ['Route 53', 'DNS', 'ALIAS', 'CNAME', 'zone apex'] },
  { id: 'elasticache', name: 'ElastiCache', keywords: ['ElastiCache', 'Redis', 'Memcached', 'in-memory cache'] },
  { id: 's3', name: 'Amazon S3', keywords: ['S3', 'bucket', 'versioning', 'Multi-part', 'CORS', 'object'] },
  { id: 'dynamodb', name: 'DynamoDB', keywords: ['DynamoDB', 'NoSQL', 'Query', 'Scan', 'key-value', 'eventually consistent'] },
  { id: 'sqs-sns', name: 'SQS & SNS', keywords: ['SQS', 'SNS', 'queue', 'Visibility Timeout', 'polling', 'topic', 'push', 'pull'] },
  { id: 'cloudformation', name: 'CloudFormation', keywords: ['CloudFormation', 'template', 'Resources section', 'infrastructure as code'] },
  { id: 'cloudfront', name: 'CloudFront', keywords: ['CloudFront', 'CDN', 'edge location', 'Content Delivery'] },
  { id: 'xray', name: 'AWS X-Ray', keywords: ['X-Ray', 'tracing', 'debugging', 'distributed'] },
  { id: 'step-functions', name: 'Step Functions', keywords: ['Step Functions', 'workflows', 'orchestrat'] },
  { id: 'sdk-general', name: 'SDK & General', keywords: ['SDK', 'API', 'exponential backoff', 'retry', 'stateless', 'stateful'] },
  { id: 'secrets', name: 'Secrets Management', keywords: ['Secrets Manager', 'Parameter Store', 'sensitive data', 'credentials'] },
  { id: 'codecommit', name: 'CodeCommit', keywords: ['CodeCommit', 'source control', 'Git'] },
  { id: 'vpc', name: 'VPC & Networking', keywords: ['VPC', 'subnet', 'security group'] },
];

// Parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Detect category from flashcard content
function detectCategory(front, back) {
  const content = `${front} ${back}`.toLowerCase();

  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      if (content.toLowerCase().includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return { id: 'general', name: 'General AWS' };
}

// Infer difficulty based on content complexity
function inferDifficulty(front, back) {
  const content = `${front} ${back}`;
  const wordCount = content.split(/\s+/).length;

  if (wordCount < 20) return 'easy';
  if (wordCount < 40) return 'medium';
  return 'hard';
}

// Generate tags from content
function generateTags(front, back, categoryId) {
  const tags = [categoryId];
  const content = `${front} ${back}`.toLowerCase();

  // Add service-specific tags
  const services = ['lambda', 's3', 'ec2', 'rds', 'dynamodb', 'sqs', 'sns', 'iam', 'cloudformation', 'api gateway', 'cognito', 'elasticache', 'cloudfront', 'route 53', 'ebs', 'elb', 'alb', 'nlb'];

  for (const service of services) {
    if (content.includes(service)) {
      tags.push(`service:${service.replace(/\s+/g, '-')}`);
    }
  }

  return [...new Set(tags)];
}

// Main conversion function
function convertFlashcards() {
  const csvPath = path.join(__dirname, '../flashcards.csv');
  const outputPath = path.join(__dirname, '../public/flashcard_bank.json');

  // Read CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // Group flashcards by category
  const categoriesMap = new Map();

  lines.forEach((line, index) => {
    const [front, back] = parseCSVLine(line);

    if (!front || !back) {
      console.warn(`Skipping invalid line ${index + 1}: ${line.substring(0, 50)}...`);
      return;
    }

    const category = detectCategory(front, back);
    const difficulty = inferDifficulty(front, back);
    const tags = generateTags(front, back, category.id);

    const flashcard = {
      id: `fc-${category.id}-${String(index + 1).padStart(3, '0')}`,
      front: front,
      back: back,
      category: category.id,
      tags: tags,
      difficulty: difficulty,
      created_at: new Date().toISOString()
    };

    if (!categoriesMap.has(category.id)) {
      categoriesMap.set(category.id, {
        category_id: category.id,
        name: category.name,
        flashcards: []
      });
    }

    categoriesMap.get(category.id).flashcards.push(flashcard);
  });

  // Build flashcard bank
  const flashcardBank = {
    exam: 'AWS Certified Developer – Associate (DVA-C02)',
    flashcard_bank_version: 'v1.0',
    generated_at: new Date().toISOString(),
    categories: Array.from(categoriesMap.values()).sort((a, b) => b.flashcards.length - a.flashcards.length),
    total_flashcards: lines.length
  };

  // Write JSON
  fs.writeFileSync(outputPath, JSON.stringify(flashcardBank, null, 2));

  // Print summary
  console.log('\n=== Flashcard Conversion Complete ===\n');
  console.log(`Total flashcards: ${flashcardBank.total_flashcards}`);
  console.log(`Categories: ${flashcardBank.categories.length}\n`);

  console.log('Category breakdown:');
  flashcardBank.categories.forEach(cat => {
    console.log(`  ${cat.name}: ${cat.flashcards.length} cards`);
  });

  console.log(`\nOutput: ${outputPath}`);
}

convertFlashcards();
