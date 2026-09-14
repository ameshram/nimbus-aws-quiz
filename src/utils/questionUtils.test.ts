import { describe, expect, it } from 'vitest'

import type { Question, QuestionBank } from '../types/questionBank'
import {
  checkAnswer,
  extractAllQuestions,
  filterQuestions,
  getDifficultyOptions,
  getDomainOptions,
  shuffleArray,
} from './questionUtils'

// ---- fixtures ------------------------------------------------------------
function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    concept_id: 'c1',
    variant_index: 0,
    topic: 't1',
    subtopic: 's1',
    domain: 'd1',
    difficulty_inferred: 'easy',
    question_type: 'single',
    stem: 'What is S3?',
    options: [
      { label: 'A', text: 'Object storage' },
      { label: 'B', text: 'A database' },
    ],
    correct_options: ['A'],
    answer_explanation: '...',
    why_this_matters: '...',
    key_takeaway: '...',
    option_explanations: {},
    tags: [],
    ...overrides,
  }
}

function makeBank(): QuestionBank {
  return {
    exam: 'dva-c02',
    question_bank_version: '1.0',
    generated_at: '2026-01-01',
    domains: [
      {
        domain_id: 'd1',
        name: 'Development',
        topics: [
          {
            topic_id: 't1',
            name: 'Compute',
            subtopics: [
              {
                subtopic_id: 's1',
                name: 'Lambda',
                num_questions_generated: 2,
                questions: [
                  makeQuestion({ id: 'q1', difficulty_inferred: 'easy' }),
                  makeQuestion({ id: 'q2', difficulty_inferred: 'hard', domain: 'd1', topic: 't1', subtopic: 's1' }),
                ],
              },
            ],
          },
        ],
      },
      {
        domain_id: 'd2',
        name: 'Security',
        topics: [
          {
            topic_id: 't2',
            name: 'IAM',
            subtopics: [
              {
                subtopic_id: 's2',
                name: 'Policies',
                num_questions_generated: 1,
                questions: [makeQuestion({ id: 'q3', domain: 'd2', topic: 't2', subtopic: 's2', difficulty_inferred: 'medium' })],
              },
            ],
          },
        ],
      },
    ],
  }
}

// ---- extractAllQuestions -------------------------------------------------
describe('extractAllQuestions', () => {
  it('flattens every question across domains/topics/subtopics', () => {
    const all = extractAllQuestions(makeBank())
    expect(all.map((q) => q.id).sort()).toEqual(['q1', 'q2', 'q3'])
  })
})

// ---- filterQuestions -----------------------------------------------------
describe('filterQuestions', () => {
  const all = extractAllQuestions(makeBank())

  it('returns everything when no filters are set', () => {
    expect(filterQuestions(all, { domains: [], topics: [], subtopics: [], difficulties: [] })).toHaveLength(3)
  })

  it('filters by domain', () => {
    const out = filterQuestions(all, { domains: ['d2'], topics: [], subtopics: [], difficulties: [] })
    expect(out.map((q) => q.id)).toEqual(['q3'])
  })

  it('filters by difficulty', () => {
    const out = filterQuestions(all, { domains: [], topics: [], subtopics: [], difficulties: ['hard'] })
    expect(out.map((q) => q.id)).toEqual(['q2'])
  })

  it('combines filters conjunctively', () => {
    const out = filterQuestions(all, { domains: ['d1'], topics: [], subtopics: [], difficulties: ['medium'] })
    expect(out).toHaveLength(0) // d1 has no medium questions
  })
})

// ---- checkAnswer ---------------------------------------------------------
describe('checkAnswer', () => {
  it('accepts the correct single answer', () => {
    expect(checkAnswer(makeQuestion({ correct_options: ['A'] }), ['A'])).toBe(true)
  })

  it('rejects a wrong answer', () => {
    expect(checkAnswer(makeQuestion({ correct_options: ['A'] }), ['B'])).toBe(false)
  })

  it('is order-independent for multi-select', () => {
    const q = makeQuestion({ question_type: 'multi', correct_options: ['A', 'C'] })
    expect(checkAnswer(q, ['C', 'A'])).toBe(true)
  })

  it('rejects when the selection count differs', () => {
    const q = makeQuestion({ question_type: 'multi', correct_options: ['A', 'C'] })
    expect(checkAnswer(q, ['A'])).toBe(false)
    expect(checkAnswer(q, ['A', 'C', 'B'])).toBe(false)
  })
})

// ---- shuffleArray --------------------------------------------------------
describe('shuffleArray', () => {
  it('preserves length and elements, and does not mutate the input', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    const out = shuffleArray(input)
    expect(out).toHaveLength(input.length)
    expect([...out].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5])
    expect(input).toEqual(copy) // original untouched
  })
})

// ---- option aggregation --------------------------------------------------
describe('option counts', () => {
  it('getDomainOptions counts questions per domain', () => {
    const opts = getDomainOptions(makeBank())
    expect(opts.find((o) => o.id === 'd1')?.count).toBe(2)
    expect(opts.find((o) => o.id === 'd2')?.count).toBe(1)
  })

  it('getDifficultyOptions counts and omits empty buckets', () => {
    const opts = getDifficultyOptions(extractAllQuestions(makeBank()))
    const byId = Object.fromEntries(opts.map((o) => [o.id, o.count]))
    expect(byId).toEqual({ easy: 1, medium: 1, hard: 1 })
  })
})
