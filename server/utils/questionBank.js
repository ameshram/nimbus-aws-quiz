import fs from 'fs/promises';

/**
 * Read the question bank from disk
 */
export async function readQuestionBank(questionBankPath) {
  const data = await fs.readFile(questionBankPath, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write the question bank to disk
 */
export async function writeQuestionBank(questionBankPath, questionBank) {
  await fs.writeFile(questionBankPath, JSON.stringify(questionBank, null, 2));
}

/**
 * Get all subtopics with their parent domain/topic info
 */
export function getAllSubtopics(questionBank) {
  const subtopics = [];
  for (const domain of questionBank.domains) {
    for (const topic of domain.topics) {
      for (const subtopic of topic.subtopics) {
        subtopics.push({
          domain,
          topic,
          subtopic,
          existingQuestions: subtopic.questions.map(q => q.stem).slice(0, 3)
        });
      }
    }
  }
  return subtopics;
}

/**
 * Get subtopics with unvalidated questions
 */
export function getSubtopicsWithUnvalidatedQuestions(questionBank) {
  const subtopicsToValidate = [];
  for (const domain of questionBank.domains) {
    for (const topic of domain.topics) {
      for (const subtopic of topic.subtopics) {
        const unvalidated = subtopic.questions.filter(q => q.validation_status !== 'valid');
        if (unvalidated.length > 0) {
          subtopicsToValidate.push({
            domain,
            topic,
            subtopic,
            unvalidatedQuestions: unvalidated
          });
        }
      }
    }
  }
  return subtopicsToValidate;
}

/**
 * Find a specific subtopic by ID
 */
export function findSubtopic(questionBank, subtopicId) {
  for (const domain of questionBank.domains) {
    for (const topic of domain.topics) {
      for (const subtopic of topic.subtopics) {
        if (subtopic.subtopic_id === subtopicId) {
          return { domain, topic, subtopic };
        }
      }
    }
  }
  return null;
}

/**
 * Get all topics with their subtopics for the API
 */
export function getTopicsForApi(questionBank) {
  const topics = [];
  for (const domain of questionBank.domains) {
    for (const topic of domain.topics) {
      topics.push({
        domainId: domain.domain_id,
        domainName: domain.name,
        topicId: topic.topic_id,
        topicName: topic.name,
        subtopics: topic.subtopics.map(st => ({
          subtopicId: st.subtopic_id,
          subtopicName: st.name,
          questionCount: st.questions.length
        }))
      });
    }
  }
  return topics;
}

/**
 * Get validation stats for all subtopics
 */
export function getValidationStats(questionBank) {
  const stats = [];
  for (const domain of questionBank.domains) {
    for (const topic of domain.topics) {
      for (const subtopic of topic.subtopics) {
        const total = subtopic.questions.length;
        const valid = subtopic.questions.filter(q => q.validation_status === 'valid').length;
        const corrected = subtopic.questions.filter(q => q.validation_status === 'corrected').length;
        const unvalidated = total - valid - corrected;

        stats.push({
          domainId: domain.domain_id,
          domainName: domain.name,
          topicId: topic.topic_id,
          topicName: topic.name,
          subtopicId: subtopic.subtopic_id,
          subtopicName: subtopic.name,
          total,
          valid,
          corrected,
          unvalidated
        });
      }
    }
  }
  return stats;
}

/**
 * Process generated questions and add metadata
 */
export function processGeneratedQuestions(questions, { subtopicId, topicId, domainId, index }) {
  const timestamp = Date.now();
  return questions.map((q, i) => ({
    ...q,
    id: `ai-gen-${timestamp}-${index}-${i}`,
    concept_id: `c-${subtopicId}-${timestamp}-${i}`,
    variant_index: 0,
    topic: topicId,
    subtopic: subtopicId,
    domain: domainId,
    source: 'ai-generated',
    generated_at: new Date().toISOString()
  }));
}
