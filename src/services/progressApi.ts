const API_BASE = '/api/progress';

export interface QuizAttempt {
  id: string;
  userId: string;
  examId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  score: number;
  timeSpentSeconds: number;
  filters: Record<string, unknown>;
  status: 'in_progress' | 'completed' | 'abandoned';
  completedAt: string | null;
  createdAt: string;
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedOptions: string[];
  correctOptions: string[];
  isCorrect: boolean;
  timeSpentSeconds: number;
  domainId?: string;
  topicId?: string;
  subtopicId?: string;
  difficulty?: string;
}

export interface UserStats {
  progress: Array<{
    subtopicId: string;
    masteryLevel: number;
    totalAttempts: number;
  }>;
  attemptStats: {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  };
  subtopicStats: Array<{
    subtopicId: string;
    totalAnswered: number;
    correctAnswers: number;
  }>;
}

function getHeaders(userId: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

export async function startQuizAttempt(
  userId: string,
  examId: string,
  totalQuestions: number,
  filters?: Record<string, unknown>
): Promise<QuizAttempt | null> {
  try {
    const response = await fetch(`${API_BASE}/attempts`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ examId, totalQuestions, filters }),
    });

    if (!response.ok) {
      console.error('Failed to start quiz attempt');
      return null;
    }

    const data = await response.json();
    return data.attempt;
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    return null;
  }
}

export async function submitAnswer(
  userId: string,
  attemptId: string,
  payload: SubmitAnswerPayload
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/attempts/${attemptId}/answers`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Error submitting answer:', error);
    return false;
  }
}

export async function completeQuizAttempt(
  userId: string,
  attemptId: string,
  timeSpentSeconds: number
): Promise<QuizAttempt | null> {
  try {
    const response = await fetch(`${API_BASE}/attempts/${attemptId}/complete`, {
      method: 'PUT',
      headers: getHeaders(userId),
      body: JSON.stringify({ timeSpentSeconds }),
    });

    if (!response.ok) {
      console.error('Failed to complete quiz attempt');
      return null;
    }

    const data = await response.json();
    return data.attempt;
  } catch (error) {
    console.error('Error completing quiz attempt:', error);
    return null;
  }
}

export async function getQuizHistory(
  userId: string,
  examId?: string,
  limit = 20,
  offset = 0
): Promise<{ attempts: QuizAttempt[]; total: number }> {
  try {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (examId) params.set('examId', examId);

    const response = await fetch(`${API_BASE}/attempts?${params}`, {
      headers: getHeaders(userId),
    });

    if (!response.ok) {
      return { attempts: [], total: 0 };
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    return { attempts: [], total: 0 };
  }
}

export async function getUserStats(userId: string, examId: string): Promise<UserStats | null> {
  try {
    const response = await fetch(`${API_BASE}/stats/${examId}`, {
      headers: getHeaders(userId),
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }
}

export async function getWeakAreas(
  userId: string,
  examId: string,
  threshold = 70
): Promise<Array<{ subtopicId: string; masteryLevel: number }>> {
  try {
    const response = await fetch(`${API_BASE}/weak-areas/${examId}?threshold=${threshold}`, {
      headers: getHeaders(userId),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.weakAreas;
  } catch (error) {
    console.error('Error fetching weak areas:', error);
    return [];
  }
}

export async function getDueForReview(
  userId: string,
  examId: string
): Promise<Array<{ subtopicId: string; nextReviewAt: string }>> {
  try {
    const response = await fetch(`${API_BASE}/due-review/${examId}`, {
      headers: getHeaders(userId),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.dueForReview;
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    return [];
  }
}
