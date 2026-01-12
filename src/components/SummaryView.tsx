import type { QuestionResult } from '../types/questionBank';
import { getDifficultyColor } from '../utils/questionUtils';

interface SummaryViewProps {
  results: QuestionResult[];
  score: number;
  totalAnswered: number;
  onReviewQuestion: (index: number) => void;
  onRestartQuiz: () => void;
  onBackToHome: () => void;
}

export function SummaryView({
  results,
  score,
  totalAnswered,
  onReviewQuestion,
  onRestartQuiz,
  onBackToHome,
}: SummaryViewProps) {
  const percentage = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const passed = percentage >= 70;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div
          className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            passed ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {passed ? (
            <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {passed ? 'Great Job!' : 'Keep Practicing!'}
        </h2>

        <p className="text-gray-600 mb-6">
          {passed
            ? 'You demonstrated a solid understanding of the material.'
            : 'Review the explanations and try again to improve your score.'}
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-aws-orange">{score}</p>
            <p className="text-sm text-gray-500">Correct</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-3xl font-bold text-gray-700">{totalAnswered - score}</p>
            <p className="text-sm text-gray-500">Incorrect</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {percentage}%
            </p>
            <p className="text-sm text-gray-500">Score</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onRestartQuiz}
            className="px-6 py-2 bg-aws-orange text-white rounded-lg font-medium hover:bg-aws-orange-dark transition-colors"
          >
            Restart Quiz
          </button>
          <button
            onClick={onBackToHome}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h3>

        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={result.question.id}
              className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
              }`}
              onClick={() => onReviewQuestion(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Q{index + 1}</span>
                    {result.isCorrect ? (
                      <span className="text-xs px-2 py-0.5 bg-green-200 text-green-800 rounded-full">
                        Correct
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded-full">
                        Incorrect
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(
                        result.question.difficulty_inferred
                      )}`}
                    >
                      {result.question.difficulty_inferred}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {result.question.stem}
                  </p>
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                    <span>{result.question.topic}</span>
                    <span>•</span>
                    <span>{result.question.subtopic}</span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
