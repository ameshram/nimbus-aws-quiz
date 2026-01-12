import type { Flashcard } from '../types/flashcard';

interface FlashcardCardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  currentIndex: number;
  totalCards: number;
}

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'hard':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

export function FlashcardCard({
  flashcard,
  isFlipped,
  onFlip,
  currentIndex,
  totalCards,
}: FlashcardCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyColor(flashcard.difficulty)}`}>
            {flashcard.difficulty}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
            {flashcard.category}
          </span>
        </div>
        <span className="text-sm text-nimbus-muted">
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Flip Card Container */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={onFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of Card (Question) */}
          <div
            className="w-full bg-white rounded-2xl border border-nimbus-border shadow-soft p-8 md:p-12"
            style={{
              backfaceVisibility: 'hidden',
              minHeight: '300px',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-aws-orange/10 text-aws-orange text-sm font-medium rounded-full mb-6">
                  Question
                </span>
                <p className="text-nimbus-text text-lg md:text-xl leading-relaxed">
                  {flashcard.front}
                </p>
              </div>
              <div className="mt-8 text-nimbus-muted text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Click to flip
              </div>
            </div>
          </div>

          {/* Back of Card (Answer) */}
          <div
            className="w-full bg-gradient-to-br from-aws-orange to-aws-orange-dark rounded-2xl border border-aws-orange shadow-soft p-8 md:p-12 absolute top-0 left-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              minHeight: '300px',
            }}
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full mb-6">
                  Answer
                </span>
                <p className="text-white text-lg md:text-xl leading-relaxed">
                  {flashcard.back}
                </p>
              </div>
              <div className="mt-8 text-white/70 text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Click to flip back
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tags */}
      {flashcard.tags && flashcard.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {flashcard.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-nimbus-muted rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
