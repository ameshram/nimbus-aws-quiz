import { describe, expect, it } from 'vitest'

import { buildValidationPrompt } from './questionValidation.js'

const args = {
  examName: 'AWS Certified Developer - Associate (DVA-C02)',
  domainName: 'Development with AWS Services',
  topicName: 'Compute',
  subtopicName: 'AWS Lambda',
  questions: [{ id: 'q-123', stem: 'What is the Lambda timeout limit?' }],
}

describe('buildValidationPrompt', () => {
  it('returns a string that embeds the exam context and the questions', () => {
    const prompt = buildValidationPrompt(args)
    expect(typeof prompt).toBe('string')
    expect(prompt).toContain(args.examName)
    expect(prompt).toContain(args.subtopicName)
    expect(prompt).toContain('q-123') // the questions are serialized into the prompt
  })

  it('is a pure, deterministic function of its inputs', () => {
    expect(buildValidationPrompt(args)).toBe(buildValidationPrompt(args))
  })
})
