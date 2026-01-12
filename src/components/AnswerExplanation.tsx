import type { Question } from '../types/questionBank';
import { getDifficultyColor } from '../utils/questionUtils';

interface AnswerExplanationProps {
  question: Question;
  userAnswers: string[];
  isCorrect: boolean;
}

export function AnswerExplanation({ question, userAnswers, isCorrect }: AnswerExplanationProps) {
  return (
    <div className="mt-6 space-y-4">
      <div
        className={`p-4 rounded-lg ${
          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}
      >
        <div className="flex items-center space-x-2 mb-2">
          {isCorrect ? (
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </span>
        </div>
        {!isCorrect && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Your answer:</span> {userAnswers.join(', ')}
            <br />
            <span className="font-medium">Correct answer:</span> {question.correct_options.join(', ')}
          </p>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
          <svg className="w-5 h-5 mr-2 text-aws-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Explanation
        </h4>
        <p className="text-gray-700 text-sm leading-relaxed">{question.answer_explanation}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            🧠 Exam Signal
          </h4>
          <p className="text-blue-900 text-sm leading-relaxed">{question.why_this_matters}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            🎯 Decision Rule
          </h4>
          <p className="text-purple-900 text-sm leading-relaxed">{question.key_takeaway}</p>
        </div>
      </div>

      {question.option_explanations && Object.keys(question.option_explanations).length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Option Breakdown</h4>
          <div className="space-y-2">
            {question.options.map((option) => {
              const isCorrectOption = question.correct_options.includes(option.label);
              const wasSelected = userAnswers.includes(option.label);
              const explanation = question.option_explanations[option.label];

              return (
                <div
                  key={option.label}
                  className={`p-3 rounded-lg text-sm ${
                    isCorrectOption
                      ? 'bg-green-100 border border-green-300'
                      : wasSelected
                      ? 'bg-red-100 border border-red-300'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <span
                      className={`font-semibold ${
                        isCorrectOption
                          ? 'text-green-700'
                          : wasSelected
                          ? 'text-red-700'
                          : 'text-gray-600'
                      }`}
                    >
                      {option.label}.
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-700">{option.text}</p>
                      {explanation && (
                        <p className="mt-1 text-gray-600 italic">{explanation}</p>
                      )}
                    </div>
                    {isCorrectOption && (
                      <span className="text-green-600 text-xs font-medium bg-green-200 px-2 py-0.5 rounded">
                        Correct
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty_inferred)}`}>
          {question.difficulty_inferred}
        </span>
        {question.tags.slice(0, 5).map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
