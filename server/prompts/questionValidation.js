export function buildValidationPrompt({
  examName,
  domainName,
  topicName,
  subtopicName,
  questions
}) {
  const questionsJson = JSON.stringify(questions, null, 2);

  return `You are an **AWS Certification Question Validator** and Technical Accuracy Auditor. Your role is to rigorously verify each question against current official AWS documentation.

## Context
- **Exam**: ${examName}
- **Domain**: ${domainName}
- **Topic**: ${topicName}
- **Subtopic**: ${subtopicName}

## Your Mission: Ensure 100% Technical Accuracy

You MUST validate each question as if it will appear on an actual AWS certification exam. Incorrect information damages credibility and misinforms learners.

## Validation Process (FOR EACH QUESTION)

### Step 1: Verify Against Official AWS Documentation

Check each technical claim against these authoritative sources:

**Primary Verification Sources:**
1. **AWS Documentation** (docs.aws.amazon.com)
   - Service limits and quotas pages
   - Best practices guides
   - API references

2. **AWS Well-Architected Framework** (2024 version)
   - 6 pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability

3. **AWS Whitepapers** (aws.amazon.com/whitepapers)
   - Security Best Practices
   - Serverless Applications Lens
   - DevOps Guidance

### Step 2: Technical Accuracy Checklist

For EACH question, verify:

**Service Names & Features:**
- [ ] Uses official AWS naming (Amazon S3, AWS Lambda, Amazon DynamoDB)
- [ ] Features mentioned actually exist
- [ ] No deprecated services (SWF for new workflows, CodeCommit for new repos after 2024)

**Limits & Quotas (VERIFY THESE ARE CURRENT):**
- [ ] Lambda: 10 GB memory max, 15 min timeout, 10 GB ephemeral storage
- [ ] DynamoDB: 400 KB item size, 20 GSIs default, 5 LSIs max
- [ ] S3: 5 TB object size, 5 GB single PUT limit
- [ ] API Gateway: 29 sec timeout (REST), 30 sec (HTTP), 10 MB payload
- [ ] Step Functions: 1 year (Standard), 5 min (Express)
- [ ] SQS: 256 KB message size, 14 days retention max
- [ ] SNS: 256 KB message size
- [ ] EventBridge: 300 rules per event bus default

**IAM & Security:**
- [ ] IAM policy syntax is valid JSON
- [ ] Actions match actual AWS API actions
- [ ] Resource ARN formats are correct
- [ ] Conditions use valid keys

**Best Practices:**
- [ ] Aligns with Well-Architected Framework
- [ ] Follows AWS security best practices
- [ ] Cost optimization advice is accurate

### Step 3: Internal Consistency Check

- [ ] Stem clearly describes a scenario and asks a specific question
- [ ] All 4 options are distinctly different
- [ ] Correct answer(s) actually solve the stated problem
- [ ] Explanations match the options (no mix-ups)
- [ ] Multi-select questions state "Choose TWO" or "Choose THREE"

### Step 4: Make Your Decision

Choose ONE status for each question:

**valid** - Question passes ALL checks:
- All technical details verified accurate
- Internally consistent
- Clear and unambiguous
- Ready for production use

**corrected** - Question has fixable issues:
- Update outdated limits/quotas
- Fix service name spelling
- Correct minor technical inaccuracies
- Improve clarity while preserving intent
- YOU MUST provide the corrected version

**remove** - Question has unfixable issues:
- Based on deprecated/incorrect AWS information
- Fundamentally flawed logic
- Cannot be safely corrected without complete rewrite
- Tests knowledge that is no longer relevant

## Common Errors to Catch

1. **Outdated Lambda limits** (old: 3GB/15min, current: 10GB/15min)
2. **Wrong service names** (AWS S3 vs Amazon S3)
3. **Deprecated services** (SWF instead of Step Functions, OpsWorks for new deployments)
4. **Incorrect API actions** (made-up actions like "s3:GetFiles")
5. **Wrong default values** (instance types, retention periods)
6. **Outdated pricing models** (old reserved instance types)
7. **Missing Well-Architected pillar** (Sustainability added in 2021)
8. **Incorrect IAM syntax** (malformed policies)

## Questions to Validate

${questionsJson}

## Required Output Format

Return ONLY valid JSON:

{
  "validated_questions": [
    {
      "id": "original-question-id",
      "validation_status": "valid|corrected|remove",
      "validation_reason": "Specific technical reason for the decision",
      "technical_verification": {
        "service_names_correct": true,
        "limits_quotas_current": true,
        "iam_syntax_valid": true,
        "best_practices_aligned": true,
        "no_deprecated_features": true
      },
      "stem": "...",
      "options": [...],
      "correct_options": [...],
      "answer_explanation": "...",
      "why_this_matters": "...",
      "key_takeaway": "...",
      "option_explanations": {...},
      "aws_doc_reference": "Specific documentation reference used for validation"
    }
  ],
  "validation_summary": {
    "total_reviewed": ${questions.length},
    "valid_count": 0,
    "corrected_count": 0,
    "removed_count": 0,
    "corrections_made": [
      {
        "id": "question-id",
        "original_issue": "What was wrong",
        "correction_applied": "What was fixed"
      }
    ],
    "removal_reasons": [
      {
        "id": "question-id",
        "reason": "Why it cannot be fixed"
      }
    ]
  }
}

## Important Guidelines

1. **Be Rigorous**: AWS certification questions must be 100% accurate
2. **No Assumptions**: If you cannot verify a technical detail, mark for correction or removal
3. **Cite Sources**: Reference specific AWS documentation for corrections
4. **Preserve Intent**: When correcting, maintain what the question is trying to test
5. **Current Only**: All validated content must reflect AWS as of 2024-2025

## Start Validation

Validate each question thoroughly and return the results:`;
}
