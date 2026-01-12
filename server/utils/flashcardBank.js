import fs from 'fs/promises';

/**
 * Read the flashcard bank from disk
 */
export async function readFlashcardBank(flashcardBankPath) {
  const data = await fs.readFile(flashcardBankPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write the flashcard bank to disk
 */
export async function writeFlashcardBank(flashcardBankPath, flashcardBank) {
  await fs.writeFile(flashcardBankPath, JSON.stringify(flashcardBank, null, 2));
}

/**
 * Get all flashcards as a flat array
 */
export function getAllFlashcards(flashcardBank) {
  const flashcards = [];
  for (const category of flashcardBank.categories) {
    for (const flashcard of category.flashcards) {
      flashcards.push(flashcard);
    }
  }
  return flashcards;
}

/**
 * Get flashcards filtered by category
 */
export function getFlashcardsByCategory(flashcardBank, categoryId) {
  const category = flashcardBank.categories.find(c => c.category_id === categoryId);
  return category ? category.flashcards : [];
}

/**
 * Get all categories with their card counts for the API
 */
export function getCategoriesForApi(flashcardBank) {
  return flashcardBank.categories.map(category => ({
    id: category.category_id,
    name: category.name,
    count: category.flashcards.length
  }));
}

/**
 * Get flashcard statistics
 */
export function getFlashcardStats(flashcardBank) {
  const stats = {
    totalCards: flashcardBank.total_flashcards,
    totalCategories: flashcardBank.categories.length,
    byCategory: {},
    byDifficulty: { easy: 0, medium: 0, hard: 0 }
  };

  for (const category of flashcardBank.categories) {
    stats.byCategory[category.category_id] = {
      name: category.name,
      count: category.flashcards.length
    };

    for (const flashcard of category.flashcards) {
      if (flashcard.difficulty) {
        stats.byDifficulty[flashcard.difficulty]++;
      }
    }
  }

  return stats;
}

/**
 * Find a specific category by ID
 */
export function findCategory(flashcardBank, categoryId) {
  return flashcardBank.categories.find(c => c.category_id === categoryId) || null;
}

/**
 * Add a flashcard to a category
 */
export function addFlashcardToCategory(flashcardBank, categoryId, flashcard) {
  const category = flashcardBank.categories.find(c => c.category_id === categoryId);

  if (!category) {
    // Create new category if it doesn't exist
    flashcardBank.categories.push({
      category_id: categoryId,
      name: categoryId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      flashcards: [flashcard]
    });
  } else {
    category.flashcards.push(flashcard);
  }

  flashcardBank.total_flashcards++;
  return flashcardBank;
}

/**
 * Process generated flashcards and add metadata
 */
export function processGeneratedFlashcards(flashcards, { categoryId, index }) {
  const timestamp = Date.now();
  return flashcards.map((fc, i) => ({
    ...fc,
    id: `fc-gen-${timestamp}-${index}-${i}`,
    category: categoryId,
    tags: fc.tags || [categoryId],
    difficulty: fc.difficulty || 'medium',
    created_at: new Date().toISOString(),
    source: 'ai-generated'
  }));
}

/**
 * Get unvalidated flashcards
 */
export function getUnvalidatedFlashcards(flashcardBank) {
  const unvalidated = [];
  for (const category of flashcardBank.categories) {
    const cards = category.flashcards.filter(fc => !fc.validated_at);
    if (cards.length > 0) {
      unvalidated.push({
        category,
        flashcards: cards
      });
    }
  }
  return unvalidated;
}
