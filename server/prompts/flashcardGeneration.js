export function buildFlashcardGenerationPrompt({
  examName,
  categoryName,
  categoryId,
  count,
  existingFlashcards
}) {
  return `You are an expert AWS certification study material creator. Your task is to generate ${count} high-quality, concise flashcards for the ${examName} certification exam.

## Context
- **Category**: ${categoryName}
- **Category ID**: ${categoryId}

## MANDATORY: Reference Current AWS Documentation

Base all flashcards on the LATEST official AWS sources (2024-2025):

### Primary Sources
1. **AWS Official Documentation** (docs.aws.amazon.com)
   - Service User Guides and Developer Guides
   - Service quotas and limits pages
   - Best practices guides

2. **AWS Whitepapers** (aws.amazon.com/whitepapers)
   - AWS Well-Architected Framework (ALL 6 pillars)
   - Security Best Practices
   - Serverless Applications Lens

3. **AWS FAQs** (aws.amazon.com/faqs) - Service-specific FAQs

## Flashcard Types to Generate

Create a mix of these flashcard styles:

1. **Limits & Quotas**: "What is the maximum size of a Lambda deployment package?"
2. **Key Concepts**: "What is eventual consistency in DynamoDB?"
3. **Best Practices**: "When should you use provisioned vs on-demand capacity?"
4. **Comparisons**: "What's the difference between SQS and SNS?"
5. **Fill-in-the-blank**: "The default Lambda timeout is _____ seconds."
6. **Definitions**: "What is a VPC endpoint?"
7. **Acronyms**: "What does IAM stand for?"
8. **Service Purposes**: "What is the primary use case for AWS Step Functions?"

## Flashcard Requirements

### Front (Question)
- Clear, concise question or fill-in-the-blank
- Under 150 characters when possible
- Focus on one specific fact or concept
- No ambiguity - one clear answer expected

### Back (Answer)
- Concise, accurate answer (1-3 sentences)
- Include specific numbers/values when applicable
- Add brief context if helpful for memorization
- Under 300 characters when possible

### Difficulty Levels
- **easy**: Basic facts, common limits, definitions
- **medium**: Service integrations, best practices, comparisons
- **hard**: Edge cases, complex limits, architectural trade-offs

## Technical Accuracy Requirements

### Current AWS Limits (2024-2025) - Verify Before Using

**Lambda:**
- Memory: 128 MB to 10,240 MB (10 GB)
- Timeout: Up to 15 minutes (900 seconds)
- Default timeout: 3 seconds
- Deployment package: 50 MB zipped, 250 MB unzipped
- Ephemeral storage: 512 MB to 10,240 MB
- Concurrent executions: 1,000 default

**DynamoDB:**
- Item size: 400 KB max
- Partition key: 2048 bytes max
- Sort key: 1024 bytes max
- GSIs per table: 20 (default)
- LSIs per table: 5 (at table creation only)

**S3:**
- Object size: 5 TB max
- Single PUT: 5 GB max (use multipart for larger)
- Bucket name: 3-63 characters

**API Gateway:**
- REST API timeout: 29 seconds
- HTTP API timeout: 30 seconds
- Payload size: 10 MB max
- Default throttling: 10,000 RPS

**SQS:**
- Standard: unlimited throughput, at-least-once delivery
- FIFO: 300 msg/sec (batching: 3,000 msg/sec)
- Message retention: 1 minute to 14 days (default: 4 days)
- Message size: 256 KB max

**SNS:**
- Message size: 256 KB max
- Topic subscriptions: 12,500,000

**Step Functions:**
- Standard: up to 1 year execution
- Express: up to 5 minutes

## Existing Flashcards (Avoid Duplicates)

These flashcard topics already exist - generate DIFFERENT content:
${existingFlashcards.map((fc, i) => `${i + 1}. ${fc.substring(0, 80)}...`).join('\n')}

## Output Format

Return ONLY a valid JSON array with NO markdown formatting:

[
  {
    "front": "What is the maximum memory allocation for an AWS Lambda function?",
    "back": "10,240 MB (10 GB). Lambda memory can be configured from 128 MB to 10 GB in 1 MB increments.",
    "difficulty": "easy",
    "tags": ["${categoryId}", "limits"]
  },
  {
    "front": "What is the default timeout for a Lambda function?",
    "back": "3 seconds. The maximum timeout can be set up to 15 minutes (900 seconds).",
    "difficulty": "easy",
    "tags": ["${categoryId}", "limits"]
  },
  {
    "front": "When should you use DynamoDB on-demand vs provisioned capacity?",
    "back": "Use on-demand for unpredictable workloads or new tables. Use provisioned for predictable, steady-state workloads where you can forecast capacity needs.",
    "difficulty": "medium",
    "tags": ["${categoryId}", "best-practices"]
  }
]

## Final Instructions

Generate ${count} unique, technically accurate flashcards that:
1. Cover different aspects of ${categoryName}
2. Are based on CURRENT AWS documentation (2024-2025)
3. Are concise and memorable
4. Avoid duplicating the existing flashcards listed above
5. Include a good mix of difficulty levels

Generate the flashcards now:`;
}

export function buildTopicFlashcardPrompt({
  examName,
  categoryName,
  categoryId,
  subtopicName,
  subtopicId,
  count
}) {
  return `You are an expert AWS instructor and certification coach.

Using the full exam guide for the **${examName}**, generate ${count} flashcards for the following topic:

**Category**: ${categoryName}
**Subtopic**: ${subtopicName}

Flashcards must be **exam-focused**, with the core objective of helping candidates **learn, remember, and efficiently recall** information for the certification.

## Requirements:
- Identify the highest-yield concepts, patterns, trade-offs, and common pitfalls for this subtopic
- Each flashcard should focus on exactly ONE key idea
- Phrased in clear, exam-style language
- Front: a short, recall-focused prompt (question, scenario, "what/why/how", or fill-in-the-blank)
- Back: a concise, technically accurate answer aligned with current AWS documentation and best practices
- Prioritize understanding and recall of core concepts over obscure trivia
- Only use in-scope AWS services and features for DVA-C02

## Difficulty Levels
- **easy**: Basic facts, common limits, definitions, acronyms
- **medium**: Service integrations, best practices, comparisons, when to use what
- **hard**: Edge cases, architectural trade-offs, complex scenarios

## Output Format

Return ONLY a valid JSON array with NO markdown formatting:

[
  {
    "front": "Question or fill-in-the-blank here",
    "back": "Concise, accurate answer here",
    "difficulty": "easy|medium|hard",
    "tags": ["${categoryId}", "${subtopicId}"]
  }
]

Generate ${count} flashcards for "${subtopicName}" now:`;
}
