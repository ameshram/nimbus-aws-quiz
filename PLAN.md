# Flashcard Generation Feature Implementation Plan

## Overview

Add AI-powered flashcard generation similar to the existing question generation feature. This will allow admins to generate new flashcards for each category automatically.

## Current Architecture

**Question Generation Flow:**
1. `POST /api/auto-generate` endpoint
2. Uses `buildQuestionGenerationPrompt()` from `server/prompts/questionGeneration.js`
3. Calls Claude API for each subtopic
4. Parses JSON response and saves to `question_bank.json`
5. AdminTools UI triggers the endpoint

**Flashcard Structure:**
```json
{
  "id": "fc-category-001",
  "front": "Question text",
  "back": "Answer text",
  "category": "api-gateway",
  "tags": ["api-gateway", "service:api-gateway"],
  "difficulty": "medium",
  "created_at": "2026-01-12T..."
}
```

## Implementation Steps

### Step 1: Create Flashcard Generation Prompt
**File:** `server/prompts/flashcardGeneration.js`

Create a prompt that:
- Takes category name and existing flashcards as context
- Generates concise Q&A pairs focused on key facts, limits, best practices
- References AWS documentation for accuracy
- Returns JSON array of flashcards

### Step 2: Add API Endpoint
**File:** `server/index.js`

Add `POST /api/auto-generate-flashcards` endpoint that:
- Accepts `{ cardsPerCategory: number }` in request body
- Iterates through each category in flashcard_bank.json
- Calls Claude API with flashcard generation prompt
- Parses response and adds new flashcards to each category
- Saves updated flashcard_bank.json

### Step 3: Update AdminTools UI
**File:** `src/components/AdminTools.tsx`

Add a new "Auto Generate Flashcards" button:
- Similar styling to existing generate/validate buttons
- Calls `/api/auto-generate-flashcards`
- Shows progress and results

### Step 4: Add Flashcard Validation (Optional)
**File:** `server/prompts/flashcardValidation.js`

Create validation prompt to verify flashcard accuracy against AWS docs.

## Detailed Implementation

### Flashcard Generation Prompt Structure

```javascript
export function buildFlashcardGenerationPrompt({
  examName,
  categoryName,
  categoryId,
  count,
  existingFlashcards
}) {
  return `You are an AWS certification study material creator...

  ## Category: ${categoryName}

  ## Requirements
  - Generate ${count} concise flashcards
  - Focus on key facts, limits, best practices
  - Front: Clear question or fill-in-the-blank
  - Back: Concise, accurate answer

  ## Existing Flashcards (Avoid Duplicates)
  ${existingFlashcards}

  ## Output Format
  [
    {
      "front": "What is the maximum...",
      "back": "The answer is...",
      "difficulty": "easy|medium|hard",
      "tags": ["tag1", "tag2"]
    }
  ]
  `;
}
```

### API Endpoint Structure

```javascript
app.post('/api/auto-generate-flashcards', async (req, res) => {
  const { cardsPerCategory = 5 } = req.body;

  const flashcardBank = await readFlashcardBank(FLASHCARD_BANK_PATH);

  for (const category of flashcardBank.categories) {
    // Get existing flashcard fronts to avoid duplicates
    const existingFronts = category.flashcards.map(fc => fc.front);

    // Build and send prompt
    const prompt = buildFlashcardGenerationPrompt({...});
    const response = await anthropic.messages.create({...});

    // Parse and add new flashcards
    const newFlashcards = parseAndProcess(response);
    category.flashcards.push(...newFlashcards);
  }

  await writeFlashcardBank(FLASHCARD_BANK_PATH, flashcardBank);
  res.json({ success: true, totalGenerated });
});
```

### AdminTools UI Addition

```tsx
{/* Auto Generate Flashcards Card */}
<button onClick={handleAutoGenerateFlashcards}>
  <h3>Auto Generate Flashcards</h3>
  <p>Generate 5 new flashcards for every category</p>
</button>
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `server/prompts/flashcardGeneration.js` | CREATE | Flashcard generation prompt |
| `server/index.js` | MODIFY | Add `/api/auto-generate-flashcards` endpoint |
| `src/components/AdminTools.tsx` | MODIFY | Add flashcard generation button |

## Implementation Order

1. Create `server/prompts/flashcardGeneration.js`
2. Add API endpoint to `server/index.js`
3. Update `AdminTools.tsx` with new button
4. Build and test locally
5. Deploy to Lightsail

## Flashcard Types to Generate

For each category, generate flashcards covering:
- **Limits & Quotas** - "What is the max size of a Lambda function?"
- **Key Concepts** - "What is eventual consistency in DynamoDB?"
- **Best Practices** - "When should you use provisioned vs on-demand capacity?"
- **Comparisons** - "What's the difference between SQS and SNS?"
- **Fill-in-the-blank** - "The default Lambda timeout is _____ seconds."
- **Definitions** - "What is a VPC endpoint?"
