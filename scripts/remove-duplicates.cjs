const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/question_bank.json', 'utf8'));

// Collect all questions with their locations
const seenStems = new Set();
let removedCount = 0;

for (const domain of data.domains) {
  for (const topic of domain.topics) {
    for (const subtopic of topic.subtopics) {
      const uniqueQuestions = [];

      for (const q of subtopic.questions) {
        // Normalize stem for comparison
        const normalizedStem = q.stem.toLowerCase().trim().substring(0, 100);

        if (!seenStems.has(normalizedStem)) {
          seenStems.add(normalizedStem);
          uniqueQuestions.push(q);
        } else {
          removedCount++;
          console.log(`Removed duplicate: ${q.id}`);
        }
      }

      subtopic.questions = uniqueQuestions;
      subtopic.num_questions_generated = uniqueQuestions.length;
    }
  }
}

// Count total remaining
let totalQuestions = 0;
for (const domain of data.domains) {
  for (const topic of domain.topics) {
    for (const subtopic of topic.subtopics) {
      totalQuestions += subtopic.questions.length;
    }
  }
}

// Update timestamp
data.generated_at = new Date().toISOString();

// Save
fs.writeFileSync('public/question_bank.json', JSON.stringify(data, null, 2));

console.log('');
console.log('=== Summary ===');
console.log('Duplicates removed:', removedCount);
console.log('Questions remaining:', totalQuestions);
