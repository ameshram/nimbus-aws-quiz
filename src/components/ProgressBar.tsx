interface ProgressBarProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  totalAnswered: number;
  progress: number;
}

export function ProgressBar({
  currentIndex,
  totalQuestions,
  score,
  totalAnswered,
  progress,
}: ProgressBarProps) {
  const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-nimbus-border shadow-soft p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-nimbus-muted">Question</span>
            <span className="ml-2 font-medium text-nimbus-text">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          {totalAnswered > 0 && (
            <div className="text-sm">
              <span className="text-nimbus-muted">Score</span>
              <span className="ml-2 font-medium text-nimbus-text">
                {score}/{totalAnswered}
                <span
                  className={`ml-1 ${
                    percentage >= 70
                      ? 'text-green-600'
                      : percentage >= 50
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  ({percentage}%)
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="text-sm text-nimbus-muted">
          {progress}%
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div
          className="bg-aws-orange h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
