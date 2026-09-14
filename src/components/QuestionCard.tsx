import type { Question } from '../types/questionBank';
import { AnswerExplanation } from './AnswerExplanation';
import { getDifficultyColor } from '../utils/questionUtils';

interface QuestionCardProps {
  question: Question;
  selectedAnswers: string[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (label: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  selectedAnswers,
  isSubmitted,
  isCorrect,
  onSelectAnswer,
  onSubmit,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  currentIndex,
  totalQuestions,
}: QuestionCardProps) {
  const isMultiSelect = question.question_type === 'multi';

  return (
    <div className="bg-white rounded-xl border border-nimbus-border shadow-soft p-6 md:p-8">
      {/* Question Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getDifficultyColor(question.difficulty_inferred)}`}>
            {question.difficulty_inferred}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-nimbus-muted">
            {question.topic}
          </span>
          {isMultiSelect && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
              Select multiple
            </span>
          )}
        </div>
        <span className="text-sm text-nimbus-muted">
          {currentIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Question Stem */}
      <div className="mb-8">
        <p className="text-nimbus-text text-lg leading-relaxed whitespace-pre-wrap">{question.stem}</p>
      </div>

      {/* Answer Options */}
      <div className="space-y-3 mb-8">
        {question.options.map((option) => {
          const isSelected = selectedAnswers.includes(option.label);
          const isCorrectOption = question.correct_options.includes(option.label);
          const showCorrect = isSubmitted && isCorrectOption;
          const showIncorrect = isSubmitted && isSelected && !isCorrectOption;

          let optionClasses = 'border rounded-xl p-4 cursor-pointer transition-all';

          if (isSubmitted) {
            if (showCorrect) {
              optionClasses += ' border-green-400 bg-green-50';
            } else if (showIncorrect) {
              optionClasses += ' border-red-400 bg-red-50';
            } else {
              optionClasses += ' border-gray-100 bg-gray-50 cursor-default opacity-60';
            }
          } else if (isSelected) {
            optionClasses += ' border-aws-orange bg-aws-orange/5';
          } else {
            optionClasses += ' border-nimbus-border hover:border-gray-300 hover:bg-gray-50';
          }

          return (
            <div
              key={option.label}
              className={optionClasses}
              onClick={() => !isSubmitted && onSelectAnswer(option.label)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {isMultiSelect ? (
                    <div
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        showCorrect
                          ? 'border-green-500 bg-green-500'
                          : showIncorrect
                          ? 'border-red-500 bg-red-500'
                          : isSelected
                          ? 'border-aws-orange bg-aws-orange'
                          : 'border-gray-300'
                      }`}
                    >
                      {(isSelected || showCorrect) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                        showCorrect
                          ? 'border-green-500'
                          : showIncorrect
                          ? 'border-red-500'
                          : isSelected
                          ? 'border-aws-orange'
                          : 'border-gray-300'
                      }`}
                    >
                      {(isSelected || (showCorrect && !isSelected)) && (
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            showCorrect
                              ? 'bg-green-500'
                              : showIncorrect
                              ? 'bg-red-500'
                              : 'bg-aws-orange'
                          }`}
                        />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`font-medium mr-2 ${
                      showCorrect
                        ? 'text-green-700'
                        : showIncorrect
                        ? 'text-red-700'
                        : isSelected
                        ? 'text-aws-orange'
                        : 'text-nimbus-muted'
                    }`}
                  >
                    {option.label}.
                  </span>
                  <span className="text-nimbus-text">{option.text}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-nimbus-border">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasPrevious
              ? 'text-nimbus-text hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          Previous
        </button>

        {!isSubmitted ? (
          <button
            onClick={onSubmit}
            disabled={selectedAnswers.length === 0}
            className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
              selectedAnswers.length > 0
                ? 'bg-aws-orange text-white hover:bg-aws-orange-dark shadow-soft'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-6 py-2.5 rounded-xl font-medium bg-aws-orange text-white hover:bg-aws-orange-dark shadow-soft transition-all"
          >
            {hasNext ? 'Next' : 'Finish'}
          </button>
        )}

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasNext
              ? 'text-nimbus-text hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          Skip
        </button>
      </div>

      {/* Explanation */}
      {isSubmitted && isCorrect !== null && (
        <AnswerExplanation
          question={question}
          userAnswers={selectedAnswers}
          isCorrect={isCorrect}
        />
      )}
    </div>
  );
}
