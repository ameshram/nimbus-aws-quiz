import type { Flashcard } from '../types/flashcard';
import { FlashcardCard } from './FlashcardCard';

interface FlashcardStudyViewProps {
  flashcards: Flashcard[];
  currentIndex: number;
  currentFlashcard: Flashcard | null;
  isFlipped: boolean;
  progress: number;
  totalCards: number;
  viewedCards: Set<string>;
  isStudyComplete: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onShuffle: () => void;
  onExit: () => void;
  onRestart: () => void;
}

export function FlashcardStudyView({
  currentIndex,
  currentFlashcard,
  isFlipped,
  progress,
  totalCards,
  viewedCards,
  isStudyComplete,
  onFlip,
  onNext,
  onPrevious,
  onShuffle,
  onExit,
  onRestart,
}: FlashcardStudyViewProps) {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalCards - 1;

  // Study Complete Summary
  if (isStudyComplete) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-nimbus-border shadow-soft p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-nimbus-text mb-2">
            Study Session Complete!
          </h2>
          <p className="text-nimbus-muted mb-8">
            You've reviewed all {totalCards} flashcards in this session.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-aws-orange">{totalCards}</div>
                <div className="text-sm text-nimbus-muted">Cards Studied</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">100%</div>
                <div className="text-sm text-nimbus-muted">Progress</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-aws-orange text-white rounded-xl font-medium hover:bg-aws-orange-dark transition-colors"
            >
              Study Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 bg-gray-100 text-nimbus-text rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Flashcards
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentFlashcard) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-white rounded-xl border border-nimbus-border shadow-soft p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="text-nimbus-muted hover:text-nimbus-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="text-nimbus-text font-medium">
              Flashcard Study
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-nimbus-muted">
            <span>{viewedCards.size} of {totalCards} viewed</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-aws-orange h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <FlashcardCard
        flashcard={currentFlashcard}
        isFlipped={isFlipped}
        onFlip={onFlip}
        currentIndex={currentIndex}
        totalCards={totalCards}
      />

      {/* Navigation Controls */}
      <div className="bg-white rounded-xl border border-nimbus-border shadow-soft p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasPrevious
                ? 'text-nimbus-text hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onShuffle}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-nimbus-muted hover:bg-gray-100 transition-colors"
              title="Shuffle cards"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Shuffle
            </button>
          </div>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              hasNext
                ? 'text-nimbus-text hover:bg-gray-100'
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            Next
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-sm text-nimbus-muted">
        <span className="hidden sm:inline">
          Use <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">Space</kbd> to flip,{' '}
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">←</kbd>{' '}
          <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs">→</kbd> to navigate
        </span>
      </div>
    </div>
  );
}
