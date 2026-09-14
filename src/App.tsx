import { useState, useEffect, useCallback } from 'react';
import type { Exam } from './types/questionBank';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { QuizView } from './components/QuizView';
import { FlashcardView } from './components/FlashcardView';
import { FlashcardStudyView } from './components/FlashcardStudyView';
import { useQuestionBank } from './hooks/useQuestionBank';
import { useQuizEngine } from './hooks/useQuizEngine';
import { useFlashcardBank } from './hooks/useFlashcardBank';
import { useFlashcardStudy } from './hooks/useFlashcardStudy';
import { useProgressTracking } from './hooks/useProgressTracking';
import { useAuth } from './contexts/AuthContext';
import { getDefaultExam } from './config/exams';

type AppMode = 'quiz' | 'flashcards';
type AppView = 'home' | 'quiz' | 'flashcard-study';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('quiz');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [currentExam, setCurrentExam] = useState<Exam>(getDefaultExam);
  const { isAuthenticated } = useAuth();

  // Quiz hooks
  const {
    filteredQuestions,
    filters: quizFilters,
    setFilters: setQuizFilters,
    domainOptions,
    topicOptions,
    subtopicOptions,
    difficultyOptions,
    loading: quizLoading,
    error: quizError,
    resetFilters: resetQuizFilters,
    refreshQuestions,
  } = useQuestionBank(currentExam);

  const {
    quizQuestions,
    currentIndex: quizCurrentIndex,
    currentQuestion,
    selectedAnswers,
    isSubmitted,
    isCorrect,
    score,
    totalAnswered,
    progress: quizProgress,
    results,
    isQuizComplete,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    goToQuestion,
  } = useQuizEngine();

  // Flashcard hooks
  const {
    filteredFlashcards,
    filters: flashcardFilters,
    setFilters: setFlashcardFilters,
    categoryOptions,
    difficultyOptions: flashcardDifficultyOptions,
    loading: flashcardLoading,
    error: flashcardError,
    resetFilters: resetFlashcardFilters,
    allFlashcards,
  } = useFlashcardBank();

  const {
    studyFlashcards,
    currentIndex: flashcardCurrentIndex,
    currentFlashcard,
    isFlipped,
    progress: flashcardProgress,
    totalCards,
    viewedCards,
    isStudyComplete,
    startStudy,
    flipCard,
    nextCard,
    previousCard,
    shuffleCards,
    resetStudy,
  } = useFlashcardStudy();

  const {
    startTracking,
    trackAnswer,
    completeTracking,
    resetTracking,
  } = useProgressTracking();

  // Track answer submission when user submits
  const handleSubmitWithTracking = useCallback(() => {
    submitAnswer();

    // After submitting, track the answer if user is authenticated
    if (isAuthenticated && currentQuestion) {
      const correct = currentQuestion.correct_options.sort().join(',') ===
        selectedAnswers.sort().join(',');
      trackAnswer(currentQuestion, selectedAnswers, correct);
    }
  }, [submitAnswer, isAuthenticated, currentQuestion, selectedAnswers, trackAnswer]);

  // Complete tracking when quiz is complete
  useEffect(() => {
    if (isQuizComplete && isAuthenticated) {
      completeTracking();
    }
  }, [isQuizComplete, isAuthenticated, completeTracking]);

  // Keyboard shortcuts for flashcards
  useEffect(() => {
    if (currentView !== 'flashcard-study') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        flipCard();
      } else if (e.key === 'ArrowRight') {
        nextCard();
      } else if (e.key === 'ArrowLeft') {
        previousCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, flipCard, nextCard, previousCard]);

  const handleExamChange = (exam: Exam) => {
    resetQuiz();
    resetTracking();
    resetStudy();
    setCurrentView('home');
    setCurrentExam(exam);
  };

  const handleModeChange = (mode: AppMode) => {
    resetQuiz();
    resetTracking();
    resetStudy();
    setCurrentView('home');
    setCurrentMode(mode);
  };

  const handleStartQuiz = async (limit?: number) => {
    const questionLimit = limit || filteredQuestions.length;
    startQuiz(filteredQuestions, true, limit);
    setCurrentView('quiz');

    // Start tracking if user is authenticated
    if (isAuthenticated) {
      await startTracking(currentExam.id, questionLimit, quizFilters);
    }
  };

  const handleStartFlashcardStudy = (limit?: number) => {
    startStudy(filteredFlashcards, true, limit);
    setCurrentView('flashcard-study');
  };

  const handleBackToHome = () => {
    resetQuiz();
    resetTracking();
    resetStudy();
    setCurrentView('home');
  };

  const handleRestartQuiz = async () => {
    resetTracking();
    startQuiz(filteredQuestions, true, quizQuestions.length);

    // Start new tracking session
    if (isAuthenticated) {
      await startTracking(currentExam.id, quizQuestions.length, quizFilters);
    }
  };

  const handleRestartFlashcards = () => {
    startStudy(filteredFlashcards, true, studyFlashcards.length);
  };

  const loading = currentMode === 'quiz' ? quizLoading : flashcardLoading;
  const error = currentMode === 'quiz' ? quizError : flashcardError;

  if (loading) {
    return (
      <Layout currentExam={currentExam} onExamChange={handleExamChange}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-aws-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">
              Loading {currentMode === 'quiz' ? `${currentExam.code} question bank` : 'flashcards'}...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout currentExam={currentExam} onExamChange={handleExamChange}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Content</h2>
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentExam={currentExam} onExamChange={handleExamChange}>
      {/* Mode Toggle - Only show on home view */}
      {currentView === 'home' && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleModeChange('quiz')}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${currentMode === 'quiz'
                  ? 'bg-white text-nimbus-text shadow-soft'
                  : 'text-nimbus-muted hover:text-nimbus-text'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Quiz
            </button>
            <button
              onClick={() => handleModeChange('flashcards')}
              className={`
                px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${currentMode === 'flashcards'
                  ? 'bg-white text-nimbus-text shadow-soft'
                  : 'text-nimbus-muted hover:text-nimbus-text'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Flashcards
            </button>
          </div>
        </div>
      )}

      {/* Content based on mode and view */}
      {currentView === 'home' && currentMode === 'quiz' && (
        <Home
          exam={currentExam}
          filters={quizFilters}
          onFilterChange={setQuizFilters}
          domainOptions={domainOptions}
          topicOptions={topicOptions}
          subtopicOptions={subtopicOptions}
          difficultyOptions={difficultyOptions}
          filteredCount={filteredQuestions.length}
          onResetFilters={resetQuizFilters}
          onStartQuiz={handleStartQuiz}
          onRefreshQuestions={refreshQuestions}
        />
      )}

      {currentView === 'home' && currentMode === 'flashcards' && (
        <FlashcardView
          filters={flashcardFilters}
          onFilterChange={setFlashcardFilters}
          categoryOptions={categoryOptions}
          difficultyOptions={flashcardDifficultyOptions}
          filteredCount={filteredFlashcards.length}
          totalCount={allFlashcards.length}
          onResetFilters={resetFlashcardFilters}
          onStartStudy={handleStartFlashcardStudy}
        />
      )}

      {currentView === 'quiz' && (
        <QuizView
          quizQuestions={quizQuestions}
          currentIndex={quizCurrentIndex}
          currentQuestion={currentQuestion}
          selectedAnswers={selectedAnswers}
          isSubmitted={isSubmitted}
          isCorrect={isCorrect}
          score={score}
          totalAnswered={totalAnswered}
          progress={quizProgress}
          results={results}
          isQuizComplete={isQuizComplete}
          onSelectAnswer={selectAnswer}
          onSubmitAnswer={handleSubmitWithTracking}
          onNextQuestion={nextQuestion}
          onPreviousQuestion={previousQuestion}
          onGoToQuestion={goToQuestion}
          onRestartQuiz={handleRestartQuiz}
          onBackToHome={handleBackToHome}
        />
      )}

      {currentView === 'flashcard-study' && (
        <FlashcardStudyView
          flashcards={studyFlashcards}
          currentIndex={flashcardCurrentIndex}
          currentFlashcard={currentFlashcard}
          isFlipped={isFlipped}
          progress={flashcardProgress}
          totalCards={totalCards}
          viewedCards={viewedCards}
          isStudyComplete={isStudyComplete}
          onFlip={flipCard}
          onNext={nextCard}
          onPrevious={previousCard}
          onShuffle={shuffleCards}
          onExit={handleBackToHome}
          onRestart={handleRestartFlashcards}
        />
      )}
    </Layout>
  );
}

export default App;
