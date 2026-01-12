// ============================================
// Flashcard Types
// ============================================

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}

export interface FlashcardCategory {
  category_id: string;
  name: string;
  flashcards: Flashcard[];
}

export interface FlashcardBank {
  exam: string;
  flashcard_bank_version: string;
  generated_at: string;
  categories: FlashcardCategory[];
  total_flashcards: number;
}

// ============================================
// Study Session Types
// ============================================

export interface FlashcardStudyState {
  flashcards: Flashcard[];
  currentIndex: number;
  isFlipped: boolean;
  studiedCount: number;
  completed: boolean;
}

export interface FlashcardProgress {
  id: number;
  user_id: number;
  flashcard_id: string;
  times_viewed: number;
  last_viewed_at: string;
  created_at: string;
}

export interface FlashcardSession {
  id: number;
  user_id: number;
  category: string | null;
  cards_studied: number;
  started_at: string;
  completed_at: string | null;
}

// ============================================
// Filter & UI Types
// ============================================

export interface FlashcardFilterState {
  categories: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
}

export interface FlashcardCategoryOption {
  id: string;
  name: string;
  count: number;
}
