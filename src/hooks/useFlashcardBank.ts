import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  FlashcardBank,
  Flashcard,
  FlashcardFilterState,
  FlashcardCategoryOption
} from '../types/flashcard';

interface UseFlashcardBankReturn {
  flashcardBank: FlashcardBank | null;
  allFlashcards: Flashcard[];
  filteredFlashcards: Flashcard[];
  filters: FlashcardFilterState;
  setFilters: React.Dispatch<React.SetStateAction<FlashcardFilterState>>;
  categoryOptions: FlashcardCategoryOption[];
  difficultyOptions: FlashcardCategoryOption[];
  loading: boolean;
  error: string | null;
  resetFilters: () => void;
  refreshFlashcards: () => void;
}

const initialFilters: FlashcardFilterState = {
  categories: [],
  difficulties: [],
};

export function useFlashcardBank(): UseFlashcardBankReturn {
  const [flashcardBank, setFlashcardBank] = useState<FlashcardBank | null>(null);
  const [filters, setFilters] = useState<FlashcardFilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadFlashcardBank = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Add cache-busting parameter to force fresh fetch
      const response = await fetch(`/flashcard_bank.json?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to load flashcard bank');
      }
      const data = await response.json();
      setFlashcardBank(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading flashcards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlashcardBank();
  }, [loadFlashcardBank, refreshTrigger]);

  const refreshFlashcards = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Extract all flashcards from all categories
  const allFlashcards = useMemo(() => {
    if (!flashcardBank) return [];
    const flashcards: Flashcard[] = [];
    for (const category of flashcardBank.categories) {
      flashcards.push(...category.flashcards);
    }
    return flashcards;
  }, [flashcardBank]);

  // Filter flashcards based on selected filters
  const filteredFlashcards = useMemo(() => {
    let result = allFlashcards;

    if (filters.categories.length > 0) {
      result = result.filter(fc => filters.categories.includes(fc.category));
    }

    if (filters.difficulties.length > 0) {
      result = result.filter(fc => filters.difficulties.includes(fc.difficulty));
    }

    return result;
  }, [allFlashcards, filters]);

  // Get category options with counts
  const categoryOptions = useMemo((): FlashcardCategoryOption[] => {
    if (!flashcardBank) return [];
    return flashcardBank.categories.map(cat => ({
      id: cat.category_id,
      name: cat.name,
      count: cat.flashcards.length
    }));
  }, [flashcardBank]);

  // Get difficulty options with counts
  const difficultyOptions = useMemo((): FlashcardCategoryOption[] => {
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const fc of allFlashcards) {
      if (fc.difficulty in counts) {
        counts[fc.difficulty]++;
      }
    }
    return [
      { id: 'easy', name: 'Easy', count: counts.easy },
      { id: 'medium', name: 'Medium', count: counts.medium },
      { id: 'hard', name: 'Hard', count: counts.hard }
    ].filter(opt => opt.count > 0);
  }, [allFlashcards]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    flashcardBank,
    allFlashcards,
    filteredFlashcards,
    filters,
    setFilters,
    categoryOptions,
    difficultyOptions,
    loading,
    error,
    resetFilters,
    refreshFlashcards,
  };
}
