const fs = require('fs');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../quiz_question_research');
const MAIN_BANK_PATH = path.join(__dirname, '../public/question_bank.json');

// Read main question bank
const mainBank = JSON.parse(fs.readFileSync(MAIN_BANK_PATH, 'utf8'));

// Collect existing question IDs
const existingIds = new Set();
for (const domain of mainBank.domains) {
  for (const topic of domain.topics) {
    for (const subtopic of topic.subtopics) {
      for (const q of subtopic.questions) {
        existingIds.add(q.id);
      }
    }
  }
}
console.log(`Existing questions in main bank: ${existingIds.size}`);

// Collect all questions from research files
const allNewQuestions = [];

// Get all JSON files
const files = fs.readdirSync(RESEARCH_DIR).filter(f => f.endsWith('.json'));
console.log(`\nProcessing ${files.length} files...`);

for (const file of files) {
  const filePath = path.join(RESEARCH_DIR, file);
  console.log(`\n--- ${file} ---`);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(`  ERROR parsing: ${e.message}`);
    continue;
  }

  let questionsFromFile = [];

  // Handle nested domains structure
  if (data.domains && Array.isArray(data.domains)) {
    for (const domain of data.domains) {
      if (domain.topics) {
        for (const topic of domain.topics) {
          if (topic.subtopics) {
            for (const subtopic of topic.subtopics) {
              if (subtopic.questions) {
                questionsFromFile.push(...subtopic.questions);
              }
            }
          }
        }
      }
    }
  }

  // Handle flat questions array
  if (data.questions && Array.isArray(data.questions)) {
    questionsFromFile.push(...data.questions);
  }

  console.log(`  Found ${questionsFromFile.length} questions`);

  // Filter out existing questions
  const newQuestions = questionsFromFile.filter(q => !existingIds.has(q.id));
  console.log(`  New questions (not in main bank): ${newQuestions.length}`);

  // Add to collection and mark as seen
  for (const q of newQuestions) {
    if (!existingIds.has(q.id)) {
      existingIds.add(q.id);
      allNewQuestions.push(q);
    }
  }
}

console.log(`\n=== Total new unique questions to add: ${allNewQuestions.length} ===\n`);

// Helper to find or create domain
function findOrCreateDomain(domainId) {
  let domain = mainBank.domains.find(d => d.domain_id === domainId);
  if (!domain) {
    // Map domain IDs to names
    const domainNames = {
      'domain-1-development': 'Development with AWS Services',
      'domain-1': 'Development with AWS Services',
      'domain-2-security': 'Security',
      'domain-2': 'Security',
      'domain-3-deployment': 'Deployment',
      'domain-3': 'Deployment',
      'domain-4-troubleshooting': 'Troubleshooting and Optimization',
      'domain-4': 'Troubleshooting and Optimization'
    };
    domain = {
      domain_id: domainId,
      name: domainNames[domainId] || domainId,
      topics: []
    };
    mainBank.domains.push(domain);
    console.log(`Created new domain: ${domainId}`);
  }
  return domain;
}

// Helper to find or create topic
function findOrCreateTopic(domain, topicId, topicName) {
  let topic = domain.topics.find(t => t.topic_id === topicId);
  if (!topic) {
    topic = {
      topic_id: topicId,
      name: topicName || topicId,
      subtopics: []
    };
    domain.topics.push(topic);
    console.log(`  Created new topic: ${topicId}`);
  }
  return topic;
}

// Helper to find or create subtopic
function findOrCreateSubtopic(topic, subtopicId, subtopicName) {
  let subtopic = topic.subtopics.find(s => s.subtopic_id === subtopicId);
  if (!subtopic) {
    subtopic = {
      subtopic_id: subtopicId,
      name: subtopicName || subtopicId,
      num_questions_generated: 0,
      questions: []
    };
    topic.subtopics.push(subtopic);
    console.log(`    Created new subtopic: ${subtopicId}`);
  }
  return subtopic;
}

// Add questions to main bank
let addedCount = 0;
for (const q of allNewQuestions) {
  // Normalize domain ID
  let domainId = q.domain || 'domain-1-development';
  if (domainId === '1' || domainId === 'domain-1') domainId = 'domain-1-development';
  if (domainId === '2' || domainId === 'domain-2') domainId = 'domain-2-security';
  if (domainId === '3' || domainId === 'domain-3') domainId = 'domain-3-deployment';
  if (domainId === '4' || domainId === 'domain-4') domainId = 'domain-4-troubleshooting';

  const topicId = q.topic || 'general';
  const subtopicId = q.subtopic || 'general';

  const domain = findOrCreateDomain(domainId);
  const topic = findOrCreateTopic(domain, topicId, q.topic);
  const subtopic = findOrCreateSubtopic(topic, subtopicId, q.subtopic);

  subtopic.questions.push(q);
  subtopic.num_questions_generated = subtopic.questions.length;
  addedCount++;
}

// Update metadata
mainBank.generated_at = new Date().toISOString();

// Count total questions
let totalQuestions = 0;
for (const domain of mainBank.domains) {
  for (const topic of domain.topics) {
    for (const subtopic of topic.subtopics) {
      totalQuestions += subtopic.questions.length;
    }
  }
}

// Save
fs.writeFileSync(MAIN_BANK_PATH, JSON.stringify(mainBank, null, 2));

console.log(`\n=== Summary ===`);
console.log(`Questions added: ${addedCount}`);
console.log(`Total questions now: ${totalQuestions}`);
