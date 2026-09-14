import type { QuestionBank, Question, FilterState, FilterOption, Domain, Topic, Subtopic } from '../types/questionBank';

export function extractAllQuestions(questionBank: QuestionBank): Question[] {
  const questions: Question[] = [];

  for (const domain of questionBank.domains) {
    for (const topic of domain.topics) {
      for (const subtopic of topic.subtopics) {
        questions.push(...subtopic.questions);
      }
    }
  }

  return questions;
}

export function filterQuestions(
  questions: Question[],
  filters: FilterState
): Question[] {
  return questions.filter((q) => {
    if (filters.domains.length > 0 && !filters.domains.includes(q.domain)) {
      return false;
    }
    if (filters.topics.length > 0 && !filters.topics.includes(q.topic)) {
      return false;
    }
    if (filters.subtopics.length > 0 && !filters.subtopics.includes(q.subtopic)) {
      return false;
    }
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(q.difficulty_inferred)) {
      return false;
    }
    return true;
  });
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getDomainOptions(questionBank: QuestionBank): FilterOption[] {
  return questionBank.domains.map((domain) => {
    const count = countQuestionsInDomain(domain);
    return {
      id: domain.domain_id,
      name: domain.name,
      count,
    };
  });
}

export function getTopicOptions(
  questionBank: QuestionBank,
  selectedDomains: string[]
): FilterOption[] {
  const topics: FilterOption[] = [];
  const domainsToSearch = selectedDomains.length > 0
    ? questionBank.domains.filter((d) => selectedDomains.includes(d.domain_id))
    : questionBank.domains;

  for (const domain of domainsToSearch) {
    for (const topic of domain.topics) {
      const count = countQuestionsInTopic(topic);
      const existing = topics.find((t) => t.id === topic.topic_id);
      if (existing) {
        existing.count += count;
      } else {
        topics.push({
          id: topic.topic_id,
          name: topic.name,
          count,
        });
      }
    }
  }

  return topics;
}

export function getSubtopicOptions(
  questionBank: QuestionBank,
  selectedDomains: string[],
  selectedTopics: string[]
): FilterOption[] {
  const subtopics: FilterOption[] = [];
  const domainsToSearch = selectedDomains.length > 0
    ? questionBank.domains.filter((d) => selectedDomains.includes(d.domain_id))
    : questionBank.domains;

  for (const domain of domainsToSearch) {
    const topicsToSearch = selectedTopics.length > 0
      ? domain.topics.filter((t) => selectedTopics.includes(t.topic_id))
      : domain.topics;

    for (const topic of topicsToSearch) {
      for (const subtopic of topic.subtopics) {
        const existing = subtopics.find((s) => s.id === subtopic.subtopic_id);
        if (existing) {
          existing.count += subtopic.questions.length;
        } else {
          subtopics.push({
            id: subtopic.subtopic_id,
            name: subtopic.name,
            count: subtopic.questions.length,
          });
        }
      }
    }
  }

  return subtopics;
}

export function getDifficultyOptions(questions: Question[]): FilterOption[] {
  const counts = { easy: 0, medium: 0, hard: 0 };

  for (const q of questions) {
    counts[q.difficulty_inferred]++;
  }

  return [
    { id: 'easy', name: 'Easy', count: counts.easy },
    { id: 'medium', name: 'Medium', count: counts.medium },
    { id: 'hard', name: 'Hard', count: counts.hard },
  ].filter((d) => d.count > 0);
}

function countQuestionsInDomain(domain: Domain): number {
  let count = 0;
  for (const topic of domain.topics) {
    count += countQuestionsInTopic(topic);
  }
  return count;
}

function countQuestionsInTopic(topic: Topic): number {
  let count = 0;
  for (const subtopic of topic.subtopics) {
    count += countQuestionsInSubtopic(subtopic);
  }
  return count;
}

function countQuestionsInSubtopic(subtopic: Subtopic): number {
  return subtopic.questions.length;
}

export function checkAnswer(question: Question, selectedOptions: string[]): boolean {
  if (selectedOptions.length !== question.correct_options.length) {
    return false;
  }
  const sortedSelected = [...selectedOptions].sort();
  const sortedCorrect = [...question.correct_options].sort();
  return sortedSelected.every((opt, idx) => opt === sortedCorrect[idx]);
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
