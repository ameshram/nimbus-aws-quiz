import { useState, useCallback, useMemo } from 'react';
import type { Question, QuestionResult } from '../types/questionBank';
import { shuffleArray, checkAnswer } from '../utils/questionUtils';

interface UseQuizEngineReturn {
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
  startQuiz: (questions: Question[], shuffle?: boolean, limit?: number) => void;
  selectAnswer: (label: string) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  resetQuiz: () => void;
  goToQuestion: (index: number) => void;
}

export function useQuizEngine(): UseQuizEngineReturn {
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState<Map<string, string[]>>(new Map());
  const [submittedMap, setSubmittedMap] = useState<Map<string, boolean>>(new Map());
  const [resultsMap, setResultsMap] = useState<Map<string, boolean>>(new Map());

  const currentQuestion = quizQuestions[currentIndex] || null;

  const selectedAnswers = useMemo(() => {
    if (!currentQuestion) return [];
    return answersMap.get(currentQuestion.id) || [];
  }, [currentQuestion, answersMap]);

  const isSubmitted = useMemo(() => {
    if (!currentQuestion) return false;
    return submittedMap.get(currentQuestion.id) || false;
  }, [currentQuestion, submittedMap]);

  const isCorrect = useMemo(() => {
    if (!currentQuestion || !isSubmitted) return null;
    return resultsMap.get(currentQuestion.id) || false;
  }, [currentQuestion, isSubmitted, resultsMap]);

  const score = useMemo(() => {
    let correct = 0;
    resultsMap.forEach((result) => {
      if (result) correct++;
    });
    return correct;
  }, [resultsMap]);

  const totalAnswered = submittedMap.size;

  const progress = useMemo(() => {
    if (quizQuestions.length === 0) return 0;
    return Math.round((totalAnswered / quizQuestions.length) * 100);
  }, [totalAnswered, quizQuestions.length]);

  const results: QuestionResult[] = useMemo(() => {
    return quizQuestions
      .filter((q) => submittedMap.has(q.id))
      .map((q) => ({
        question: q,
        userAnswer: answersMap.get(q.id) || [],
        isCorrect: resultsMap.get(q.id) || false,
      }));
  }, [quizQuestions, answersMap, submittedMap, resultsMap]);

  const isQuizComplete = totalAnswered === quizQuestions.length && quizQuestions.length > 0;

  const startQuiz = useCallback((questions: Question[], shuffle = true, limit?: number) => {
    let selectedQuestions = shuffle ? shuffleArray(questions) : [...questions];
    if (limit && limit < selectedQuestions.length) {
      selectedQuestions = selectedQuestions.slice(0, limit);
    }
    setQuizQuestions(selectedQuestions);
    setCurrentIndex(0);
    setAnswersMap(new Map());
    setSubmittedMap(new Map());
    setResultsMap(new Map());
  }, []);

  const selectAnswer = useCallback((label: string) => {
    if (!currentQuestion || isSubmitted) return;

    setAnswersMap((prev) => {
      const newMap = new Map(prev);
      const currentAnswers = newMap.get(currentQuestion.id) || [];

      if (currentQuestion.question_type === 'single') {
        newMap.set(currentQuestion.id, [label]);
      } else {
        if (currentAnswers.includes(label)) {
          newMap.set(
            currentQuestion.id,
            currentAnswers.filter((a) => a !== label)
          );
        } else {
          newMap.set(currentQuestion.id, [...currentAnswers, label]);
        }
      }

      return newMap;
    });
  }, [currentQuestion, isSubmitted]);

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || isSubmitted || selectedAnswers.length === 0) return;

    const correct = checkAnswer(currentQuestion, selectedAnswers);

    setSubmittedMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.id, true);
      return newMap;
    });

    setResultsMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.id, correct);
      return newMap;
    });
  }, [currentQuestion, isSubmitted, selectedAnswers]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, quizQuestions.length]);

  const previousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < quizQuestions.length) {
      setCurrentIndex(index);
    }
  }, [quizQuestions.length]);

  const resetQuiz = useCallback(() => {
    setQuizQuestions([]);
    setCurrentIndex(0);
    setAnswersMap(new Map());
    setSubmittedMap(new Map());
    setResultsMap(new Map());
  }, []);

  return {
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
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    goToQuestion,
  };
}
