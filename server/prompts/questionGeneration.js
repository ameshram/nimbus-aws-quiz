export function buildQuestionGenerationPrompt({
  examName,
  domainName,
  topicName,
  subtopicName,
  topicId,
  subtopicId,
  domainId,
  difficulty,
  count,
  existingQuestions
}) {
  return `You are an expert AWS certification exam question writer. Your task is to generate ${count} high-quality, technically accurate practice questions for the ${examName} certification exam.

## Context
- **Domain**: ${domainName}
- **Topic**: ${topicName}
- **Subtopic**: ${subtopicName}
- **Target Difficulty**: ${difficulty}

## MANDATORY: Research Current AWS Documentation

Before generating ANY question, you MUST mentally reference and base your questions on the LATEST official AWS sources:

### Primary Sources (REQUIRED)
1. **AWS Official Documentation** (docs.aws.amazon.com)
   - Service User Guides (e.g., docs.aws.amazon.com/lambda/latest/dg/)
   - Developer Guides and API References
   - Service quotas and limits pages
   - Best practices guides

2. **AWS Whitepapers** (aws.amazon.com/whitepapers)
   - AWS Well-Architected Framework (ALL 6 pillars - updated 2024)
   - Security Best Practices
   - Serverless Applications Lens
   - DevOps Guidance
   - Cost Optimization pillar

3. **AWS Architecture Center** (aws.amazon.com/architecture)
   - Reference architectures
   - Best practices diagrams
   - Solution implementations

4. **AWS re:Invent & re:Post**
   - Latest service announcements (2024-2025)
   - New features and capabilities
   - Community validated solutions

### Secondary Sources
5. **AWS FAQs** (aws.amazon.com/faqs) - Service-specific FAQs
6. **AWS Blog** (aws.amazon.com/blogs) - Official announcements
7. **AWS Skill Builder** - Exam prep content

## Technical Accuracy Requirements (CRITICAL)

### Service-Specific Current Limits (2024-2025)
Verify these are current before using in questions:

**Lambda:**
- Memory: 128 MB to 10,240 MB (10 GB)
- Timeout: Up to 15 minutes (900 seconds)
- Deployment package: 50 MB zipped, 250 MB unzipped
- Ephemeral storage: 512 MB to 10,240 MB
- Concurrent executions: 1,000 default (can request increase)
- Supported runtimes: Node.js 20.x, Python 3.12, Java 21, etc.

**DynamoDB:**
- Item size: 400 KB max
- Partition key: 2048 bytes max
- Sort key: 1024 bytes max
- GSIs per table: 20 (default)
- LSIs per table: 5 (created at table creation only)
- On-demand & Provisioned capacity modes

**S3:**
- Object size: 5 TB max (5 GB single PUT, multipart for larger)
- Storage classes: Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier Instant Retrieval, Glacier Flexible Retrieval, Glacier Deep Archive
- Bucket policies: 20 KB max
- Lifecycle rules: 1,000 per bucket

**API Gateway:**
- REST API vs HTTP API (know the differences)
- WebSocket APIs
- Throttling: 10,000 RPS default
- Payload size: 10 MB max
- Timeout: 29 seconds for REST, 30 seconds for HTTP

**Step Functions:**
- Standard vs Express workflows
- Standard: up to 1 year execution
- Express: up to 5 minutes, higher throughput
- State machine definition: 1 MB max

**EventBridge:**
- Rules per event bus: 300 default
- Event pattern matching syntax
- Archive and replay capabilities

### AWS Well-Architected Framework (2024)
Reference these pillars accurately:
1. **Operational Excellence** - Run and monitor systems
2. **Security** - Protect information and systems
3. **Reliability** - Recover from failures
4. **Performance Efficiency** - Use resources efficiently
5. **Cost Optimization** - Avoid unnecessary costs
6. **Sustainability** - Minimize environmental impact (NEW pillar)

## Question Generation Rules

### Format Requirements
1. **Scenario-Based Stems**: Every question MUST describe a realistic AWS scenario
   - "A company is migrating..."
   - "A developer needs to..."
   - "An application requires..."

2. **Four Options (A, B, C, D)**:
   - All options must be plausible
   - Distractors should test common misconceptions
   - No obviously wrong answers

3. **Question Types**:
   - "single" = exactly one correct answer
   - "multi" = 2-3 correct answers (MUST state "Choose TWO" or "Choose THREE" in stem)

### Difficulty Guidelines
- **easy**: Direct knowledge recall, single service focus
  - "Which S3 storage class provides..."

- **medium**: Service integration, best practices application
  - "A developer needs to implement a solution that... Which combination of services..."

- **hard**: Complex multi-service scenarios, trade-offs, optimization
  - "A company wants to minimize costs while maintaining... considering... What approach..."

### Technical Accuracy Checklist
Before finalizing each question, verify:
- [ ] All AWS service names use official naming (Amazon S3, AWS Lambda, Amazon DynamoDB)
- [ ] All limits/quotas match current AWS documentation
- [ ] All API actions and IAM permissions are valid
- [ ] Best practices align with Well-Architected Framework
- [ ] No deprecated services or features mentioned
- [ ] CLI commands and SDK methods are accurate
- [ ] Pricing/billing concepts are current

## Existing Questions (Avoid Similar Content)
${existingQuestions.map((q, i) => `${i + 1}. ${q.substring(0, 100)}...`).join('\n')}

## Output Format

Return ONLY a valid JSON array:

[
  {
    "difficulty_inferred": "${difficulty}",
    "question_type": "single",
    "stem": "A developer is building a serverless application that processes customer orders. The application must handle variable traffic patterns and automatically scale to meet demand. The developer wants to minimize operational overhead while ensuring high availability. Which AWS service combination should the developer use?",
    "options": [
      { "label": "A", "text": "Amazon EC2 with Auto Scaling and Application Load Balancer" },
      { "label": "B", "text": "AWS Lambda with Amazon API Gateway and Amazon DynamoDB" },
      { "label": "C", "text": "Amazon ECS with AWS Fargate and Amazon RDS" },
      { "label": "D", "text": "AWS Elastic Beanstalk with Amazon Aurora" }
    ],
    "correct_options": ["B"],
    "answer_explanation": "AWS Lambda with Amazon API Gateway and Amazon DynamoDB provides a fully serverless architecture that automatically scales with demand and requires minimal operational overhead. Lambda handles compute with automatic scaling, API Gateway manages API requests, and DynamoDB provides a serverless database that scales automatically. This aligns with the AWS Well-Architected Framework's Operational Excellence pillar by reducing undifferentiated heavy lifting.",
    "why_this_matters": "Understanding serverless architecture patterns is essential for AWS developers. Serverless solutions reduce operational burden, automatically scale, and follow pay-per-use pricing models, making them ideal for variable workloads.",
    "key_takeaway": "For minimal operational overhead with automatic scaling, use fully serverless services: Lambda + API Gateway + DynamoDB.",
    "option_explanations": {
      "A": "EC2 with Auto Scaling requires managing server instances, patching, and capacity planning - this adds operational overhead contrary to the requirement.",
      "B": "CORRECT: Fully serverless stack with automatic scaling and minimal operational overhead. Lambda scales automatically, API Gateway handles traffic management, and DynamoDB provides serverless storage.",
      "C": "While Fargate reduces some operational burden compared to EC2, it still requires container management and capacity provider configuration.",
      "D": "Elastic Beanstalk simplifies deployment but still runs on EC2 instances requiring some management. Aurora is not serverless by default (Aurora Serverless v2 would be needed)."
    },
    "aws_doc_reference": "AWS Well-Architected Framework - Serverless Applications Lens; Lambda Developer Guide - Best Practices",
    "tags": ["topic:${topicId}", "subtopic:${subtopicId}", "domain:${domainId.split('-')[1]}"],
    "verified_against_docs": true
  }
]

## Final Instructions

Generate ${count} unique, technically accurate questions that:
1. Are based on CURRENT AWS documentation (2024-2025)
2. Follow official AWS exam question format
3. Test practical knowledge that AWS developers need
4. Include detailed explanations with documentation references
5. Avoid any deprecated features or outdated information

Generate the questions now:`;
}
