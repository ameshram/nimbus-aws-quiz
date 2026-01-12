import React from 'react';
import type { Question, QuestionResult } from '../types/questionBank';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { SummaryView } from './SummaryView';

interface QuizViewProps {
  quizQuestions: Question[];
  currentIndex: number;
  currentQuestion: Question | null;
  selectedAnswers: string[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
  score: number;
  totalAnswered: number;
  progress: number;
  results: QuestionResult[];
  isQuizComplete: boolean;
  onSelectAnswer: (label: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onGoToQuestion: (index: number) => void;
  onRestartQuiz: () => void;
  onBackToHome: () => void;
}

export function QuizView({
  quizQuestions,
  currentIndex,
  currentQuestion,
  selectedAnswers,
  isSubmitted,
  isCorrect,
  score,
  totalAnswered,
  progress,
  results,
  isQuizComplete,
  onSelectAnswer,
  onSubmitAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onGoToQuestion,
  onRestartQuiz,
  onBackToHome,
}: QuizViewProps) {
  const [showSummary, setShowSummary] = React.useState(false);

  React.useEffect(() => {
    if (isQuizComplete) {
      setShowSummary(true);
    }
  }, [isQuizComplete]);

  const handleReviewQuestion = (index: number) => {
    setShowSummary(false);
    onGoToQuestion(index);
  };

  const handleViewSummary = () => {
    setShowSummary(true);
  };

  if (showSummary && results.length > 0) {
    return (
      <SummaryView
        results={results}
        score={score}
        totalAnswered={totalAnswered}
        onReviewQuestion={handleReviewQuestion}
        onRestartQuiz={onRestartQuiz}
        onBackToHome={onBackToHome}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">No questions available. Please go back and select questions.</p>
        <button
          onClick={onBackToHome}
          className="mt-4 px-6 py-2 bg-aws-orange text-white rounded-lg font-medium hover:bg-aws-orange-dark transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Exit Quiz</span>
        </button>

        {totalAnswered > 0 && (
          <button
            onClick={handleViewSummary}
            className="text-aws-orange hover:text-aws-orange-dark flex items-center space-x-2"
          >
            <span>View Summary</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        )}
      </div>

      <ProgressBar
        currentIndex={currentIndex}
        totalQuestions={quizQuestions.length}
        score={score}
        totalAnswered={totalAnswered}
        progress={progress}
      />

      <QuestionCard
        question={currentQuestion}
        selectedAnswers={selectedAnswers}
        isSubmitted={isSubmitted}
        isCorrect={isCorrect}
        onSelectAnswer={onSelectAnswer}
        onSubmit={onSubmitAnswer}
        onNext={onNextQuestion}
        onPrevious={onPreviousQuestion}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < quizQuestions.length - 1}
        currentIndex={currentIndex}
        totalQuestions={quizQuestions.length}
      />

      <div className="flex justify-center">
        <div className="flex flex-wrap gap-2 max-w-2xl">
          {quizQuestions.map((_, index) => {
            const questionId = quizQuestions[index].id;
            const isAnswered = results.some((r) => r.question.id === questionId);
            const isCorrectAnswer = results.find((r) => r.question.id === questionId)?.isCorrect;
            const isCurrent = index === currentIndex;

            let buttonClass = 'w-8 h-8 rounded-full text-xs font-medium transition-colors ';
            if (isCurrent) {
              buttonClass += 'bg-aws-orange text-white ring-2 ring-aws-orange ring-offset-2';
            } else if (isAnswered) {
              buttonClass += isCorrectAnswer
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200';
            } else {
              buttonClass += 'bg-gray-100 text-gray-600 hover:bg-gray-200';
            }

            return (
              <button
                key={index}
                onClick={() => onGoToQuestion(index)}
                className={buttonClass}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
