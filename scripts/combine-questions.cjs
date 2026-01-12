#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../quiz_question_research');
const OUTPUT_FILE = path.join(__dirname, '../public/question_bank.json');

function loadJsonFiles(directory) {
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} JSON files: ${files.join(', ')}`);

  return files.map(file => {
    const filePath = path.join(directory, file);
    const content = fs.readFileSync(filePath, 'utf8');
    return {
      source: file.replace('.json', ''),
      data: JSON.parse(content)
    };
  });
}

function mergeQuestionBanks(sources) {
  // Use the first source as the base for metadata
  const base = sources[0].data;

  const merged = {
    exam: base.exam,
    question_bank_version: 'v1.0-combined',
    generated_at: new Date().toISOString(),
    sources: sources.map(s => s.source),
    domains: []
  };

  // Map to track domains by ID
  const domainsMap = new Map();

  for (const source of sources) {
    const sourceName = source.source;

    for (const domain of source.data.domains) {
      if (!domainsMap.has(domain.domain_id)) {
        domainsMap.set(domain.domain_id, {
          domain_id: domain.domain_id,
          name: domain.name,
          topics: new Map()
        });
      }

      const mergedDomain = domainsMap.get(domain.domain_id);

      for (const topic of domain.topics) {
        if (!mergedDomain.topics.has(topic.topic_id)) {
          mergedDomain.topics.set(topic.topic_id, {
            topic_id: topic.topic_id,
            name: topic.name,
            subtopics: new Map()
          });
        }

        const mergedTopic = mergedDomain.topics.get(topic.topic_id);

        for (const subtopic of topic.subtopics) {
          if (!mergedTopic.subtopics.has(subtopic.subtopic_id)) {
            mergedTopic.subtopics.set(subtopic.subtopic_id, {
              subtopic_id: subtopic.subtopic_id,
              name: subtopic.name,
              questions: []
            });
          }

          const mergedSubtopic = mergedTopic.subtopics.get(subtopic.subtopic_id);

          // Add questions with source tracking
          for (const question of subtopic.questions) {
            // Add source to question ID to ensure uniqueness
            const enrichedQuestion = {
              ...question,
              id: `${sourceName}-${question.id}`,
              source: sourceName
            };
            mergedSubtopic.questions.push(enrichedQuestion);
          }
        }
      }
    }
  }

  // Convert Maps back to arrays
  merged.domains = Array.from(domainsMap.values()).map(domain => ({
    domain_id: domain.domain_id,
    name: domain.name,
    topics: Array.from(domain.topics.values()).map(topic => ({
      topic_id: topic.topic_id,
      name: topic.name,
      subtopics: Array.from(topic.subtopics.values()).map(subtopic => ({
        subtopic_id: subtopic.subtopic_id,
        name: subtopic.name,
        num_questions_generated: subtopic.questions.length,
        questions: subtopic.questions
      }))
    }))
  }));

  return merged;
}

function countQuestions(questionBank) {
  let total = 0;
  const byDomain = {};
  const byTopic = {};
  const bySource = {};
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };

  for (const domain of questionBank.domains) {
    byDomain[domain.name] = 0;

    for (const topic of domain.topics) {
      byTopic[topic.name] = byTopic[topic.name] || 0;

      for (const subtopic of topic.subtopics) {
        for (const question of subtopic.questions) {
          total++;
          byDomain[domain.name]++;
          byTopic[topic.name]++;
          bySource[question.source] = (bySource[question.source] || 0) + 1;
          byDifficulty[question.difficulty_inferred]++;
        }
      }
    }
  }

  return { total, byDomain, byTopic, bySource, byDifficulty };
}

// Main execution
console.log('Combining question bank files...\n');

const sources = loadJsonFiles(INPUT_DIR);
const merged = mergeQuestionBanks(sources);
const stats = countQuestions(merged);

console.log('\n=== Question Bank Statistics ===');
console.log(`Total questions: ${stats.total}`);
console.log('\nBy Source:');
Object.entries(stats.bySource).forEach(([source, count]) => {
  console.log(`  ${source}: ${count}`);
});
console.log('\nBy Domain:');
Object.entries(stats.byDomain).forEach(([domain, count]) => {
  console.log(`  ${domain}: ${count}`);
});
console.log('\nBy Difficulty:');
Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
  console.log(`  ${diff}: ${count}`);
});
console.log('\nBy Topic:');
Object.entries(stats.byTopic).forEach(([topic, count]) => {
  console.log(`  ${topic}: ${count}`);
});

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
console.log(`\n✓ Combined question bank written to: ${OUTPUT_FILE}`);
console.log(`  File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
