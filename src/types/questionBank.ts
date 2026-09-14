// ============================================
// Exam Metadata Types
// ============================================

export interface Exam {
  id: string;                    // e.g., "dva-c02"
  code: string;                  // e.g., "DVA-C02"
  name: string;                  // e.g., "AWS Certified Developer – Associate"
  shortName: string;             // e.g., "Developer Associate"
  description: string;           // Brief exam description
  category: 'foundational' | 'associate' | 'professional' | 'specialty';
  questionBankPath: string;      // e.g., "/question_banks/dva-c02.json"
  icon?: string;                 // Optional emoji or icon identifier
  color?: string;                // Optional theme color
}

export interface ExamCatalog {
  exams: Exam[];
  defaultExamId: string;
}

// ============================================
// Question & Content Types
// ============================================

export interface Option {
  label: string;
  text: string;
}

export interface OptionExplanations {
  [key: string]: string;
}

export interface Question {
  id: string;
  concept_id: string;
  variant_index: number;
  topic: string;
  subtopic: string;
  domain: string;
  difficulty_inferred: 'easy' | 'medium' | 'hard';
  question_type: 'single' | 'multi';
  stem: string;
  options: Option[];
  correct_options: string[];
  answer_explanation: string;
  why_this_matters: string;
  key_takeaway: string;
  option_explanations: OptionExplanations;
  tags: string[];
}

export interface Subtopic {
  subtopic_id: string;
  name: string;
  num_questions_generated: number;
  questions: Question[];
}

export interface Topic {
  topic_id: string;
  name: string;
  subtopics: Subtopic[];
}

export interface Domain {
  domain_id: string;
  name: string;
  topics: Topic[];
}

export interface QuestionBank {
  exam: string;
  question_bank_version: string;
  generated_at: string;
  domains: Domain[];
}

export interface FilterState {
  domains: string[];
  topics: string[];
  subtopics: string[];
  difficulties: ('easy' | 'medium' | 'hard')[];
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Map<string, string[]>;
  submitted: Map<string, boolean>;
  score: number;
  completed: boolean;
}

export interface FilterOption {
  id: string;
  name: string;
  count: number;
}

export interface QuestionResult {
  question: Question;
  userAnswer: string[];
  isCorrect: boolean;
}
