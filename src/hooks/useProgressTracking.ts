import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Question, FilterState } from '../types/questionBank';
import {
  startQuizAttempt,
  submitAnswer,
  completeQuizAttempt,
  type QuizAttempt,
} from '../services/progressApi';

interface UseProgressTrackingReturn {
  currentAttempt: QuizAttempt | null;
  isTracking: boolean;
  startTracking: (examId: string, totalQuestions: number, filters?: FilterState) => Promise<void>;
  trackAnswer: (question: Question, selectedOptions: string[], isCorrect: boolean) => void;
  completeTracking: () => Promise<void>;
  resetTracking: () => void;
}

export function useProgressTracking(): UseProgressTrackingReturn {
  const { user, isAuthenticated } = useAuth();
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const questionStartTimeRef = useRef<number>(Date.now());

  // Reset tracking refs when user changes
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentAttempt(null);
    }
  }, [isAuthenticated]);

  const startTracking = useCallback(async (
    examId: string,
    totalQuestions: number,
    filters?: FilterState
  ) => {
    if (!isAuthenticated || !user) return;

    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();

    const attempt = await startQuizAttempt(
      user.id,
      examId,
      totalQuestions,
      filters as unknown as Record<string, unknown>
    );

    if (attempt) {
      setCurrentAttempt(attempt);
    }
  }, [user, isAuthenticated]);

  const trackAnswer = useCallback((
    question: Question,
    selectedOptions: string[],
    isCorrect: boolean
  ) => {
    if (!isAuthenticated || !user || !currentAttempt) return;

    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    questionStartTimeRef.current = Date.now();

    // Fire and forget - don't block the UI
    submitAnswer(user.id, currentAttempt.id, {
      questionId: question.id,
      selectedOptions,
      correctOptions: question.correct_options,
      isCorrect,
      timeSpentSeconds: timeSpent,
      domainId: question.domain,
      topicId: question.topic,
      subtopicId: question.subtopic,
      difficulty: question.difficulty_inferred,
    });
  }, [user, isAuthenticated, currentAttempt]);

  const completeTracking = useCallback(async () => {
    if (!isAuthenticated || !user || !currentAttempt) return;

    const totalTime = Math.round((Date.now() - startTimeRef.current) / 1000);
    const completedAttempt = await completeQuizAttempt(user.id, currentAttempt.id, totalTime);

    if (completedAttempt) {
      setCurrentAttempt(completedAttempt);
    }
  }, [user, isAuthenticated, currentAttempt]);

  const resetTracking = useCallback(() => {
    setCurrentAttempt(null);
    startTimeRef.current = Date.now();
    questionStartTimeRef.current = Date.now();
  }, []);

  return {
    currentAttempt,
    isTracking: !!currentAttempt,
    startTracking,
    trackAnswer,
    completeTracking,
    resetTracking,
  };
}
