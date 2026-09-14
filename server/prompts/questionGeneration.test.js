import { describe, expect, it } from 'vitest'

import { buildQuestionGenerationPrompt } from './questionGeneration.js'

const args = {
  examName: 'AWS Certified Developer - Associate (DVA-C02)',
  domainName: 'Development with AWS Services',
  topicName: 'Compute',
  subtopicName: 'AWS Lambda',
  topicId: 'compute',
  subtopicId: 'lambda',
  domainId: 'domain-1',
  difficulty: 'medium',
  count: 3,
  existingQuestions: [],
}

describe('buildQuestionGenerationPrompt', () => {
  it('returns a string that embeds the exam/domain/subtopic context and count', () => {
    const prompt = buildQuestionGenerationPrompt(args)
    expect(typeof prompt).toBe('string')
    expect(prompt).toContain(args.examName)
    expect(prompt).toContain(args.subtopicName)
    expect(prompt).toContain(String(args.count))
  })

  it('does NOT instruct the model to self-stamp verified_against_docs', () => {
    // The generated bank must not carry a fabricated "verified against AWS docs"
    // claim — the questions are AI-authored and unverified (see the bank's
    // provenance block). This guards against reintroducing that stamp.
    expect(buildQuestionGenerationPrompt(args)).not.toContain('verified_against_docs')
  })

  it('is a pure, deterministic function of its inputs', () => {
    expect(buildQuestionGenerationPrompt(args)).toBe(buildQuestionGenerationPrompt(args))
  })
})
