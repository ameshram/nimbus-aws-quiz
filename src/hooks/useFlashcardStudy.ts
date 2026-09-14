import { useState, useCallback, useMemo } from 'react';
import type { Flashcard } from '../types/flashcard';

interface UseFlashcardStudyReturn {
  studyFlashcards: Flashcard[];
  currentIndex: number;
  currentFlashcard: Flashcard | null;
  isFlipped: boolean;
  progress: number;
  totalCards: number;
  viewedCards: Set<string>;
  isStudyComplete: boolean;
  startStudy: (flashcards: Flashcard[], shuffle?: boolean, limit?: number) => void;
  flipCard: () => void;
  nextCard: () => void;
  previousCard: () => void;
  goToCard: (index: number) => void;
  shuffleCards: () => void;
  resetStudy: () => void;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function useFlashcardStudy(): UseFlashcardStudyReturn {
  const [studyFlashcards, setStudyFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<string>>(new Set());

  const currentFlashcard = studyFlashcards[currentIndex] || null;
  const totalCards = studyFlashcards.length;

  const progress = useMemo(() => {
    if (totalCards === 0) return 0;
    return Math.round((viewedCards.size / totalCards) * 100);
  }, [viewedCards.size, totalCards]);

  const isStudyComplete = viewedCards.size === totalCards && totalCards > 0;

  const startStudy = useCallback((flashcards: Flashcard[], shuffle = true, limit?: number) => {
    let selectedCards = shuffle ? shuffleArray(flashcards) : [...flashcards];
    if (limit && limit < selectedCards.length) {
      selectedCards = selectedCards.slice(0, limit);
    }
    setStudyFlashcards(selectedCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set());
  }, []);

  const flipCard = useCallback(() => {
    setIsFlipped(prev => !prev);

    // Mark card as viewed when flipped to back
    if (!isFlipped && currentFlashcard) {
      setViewedCards(prev => {
        const newSet = new Set(prev);
        newSet.add(currentFlashcard.id);
        return newSet;
      });
    }
  }, [isFlipped, currentFlashcard]);

  const nextCard = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, totalCards]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const goToCard = useCallback((index: number) => {
    if (index >= 0 && index < totalCards) {
      setCurrentIndex(index);
      setIsFlipped(false);
    }
  }, [totalCards]);

  const shuffleCards = useCallback(() => {
    setStudyFlashcards(prev => shuffleArray(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const resetStudy = useCallback(() => {
    setStudyFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set());
  }, []);

  return {
    studyFlashcards,
    currentIndex,
    currentFlashcard,
    isFlipped,
    progress,
    totalCards,
    viewedCards,
    isStudyComplete,
    startStudy,
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    shuffleCards,
    resetStudy,
  };
}
