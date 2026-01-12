import { useState, useEffect, useMemo, useCallback } from 'react';
import type { QuestionBank, Question, FilterState, FilterOption, Exam } from '../types/questionBank';
import {
  extractAllQuestions,
  filterQuestions,
  getDomainOptions,
  getTopicOptions,
  getSubtopicOptions,
  getDifficultyOptions,
} from '../utils/questionUtils';

interface UseQuestionBankReturn {
  questionBank: QuestionBank | null;
  allQuestions: Question[];
  filteredQuestions: Question[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  domainOptions: FilterOption[];
  topicOptions: FilterOption[];
  subtopicOptions: FilterOption[];
  difficultyOptions: FilterOption[];
  loading: boolean;
  error: string | null;
  resetFilters: () => void;
  refreshQuestions: () => void;
}

const initialFilters: FilterState = {
  domains: [],
  topics: [],
  subtopics: [],
  difficulties: [],
};

export function useQuestionBank(exam: Exam): UseQuestionBankReturn {
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadQuestionBank = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Add cache-busting parameter to force fresh fetch
      const response = await fetch(`${exam.questionBankPath}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to load question bank for ${exam.code}`);
      }
      const data = await response.json();
      setQuestionBank(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading questions');
    } finally {
      setLoading(false);
    }
  }, [exam.questionBankPath, exam.code]);

  useEffect(() => {
    setQuestionBank(null);
    setFilters(initialFilters);
    loadQuestionBank();
  }, [exam.id, loadQuestionBank, refreshTrigger]);

  const refreshQuestions = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const allQuestions = useMemo(() => {
    if (!questionBank) return [];
    return extractAllQuestions(questionBank);
  }, [questionBank]);

  const filteredQuestions = useMemo(() => {
    return filterQuestions(allQuestions, filters);
  }, [allQuestions, filters]);

  const domainOptions = useMemo(() => {
    if (!questionBank) return [];
    return getDomainOptions(questionBank);
  }, [questionBank]);

  const topicOptions = useMemo(() => {
    if (!questionBank) return [];
    return getTopicOptions(questionBank, filters.domains);
  }, [questionBank, filters.domains]);

  const subtopicOptions = useMemo(() => {
    if (!questionBank) return [];
    return getSubtopicOptions(questionBank, filters.domains, filters.topics);
  }, [questionBank, filters.domains, filters.topics]);

  const difficultyOptions = useMemo(() => {
    return getDifficultyOptions(allQuestions);
  }, [allQuestions]);

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    questionBank,
    allQuestions,
    filteredQuestions,
    filters,
    setFilters,
    domainOptions,
    topicOptions,
    subtopicOptions,
    difficultyOptions,
    loading,
    error,
    resetFilters,
    refreshQuestions,
  };
}
