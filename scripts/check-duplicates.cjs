const fs = require('fs');
const data = JSON.parse(fs.readFileSync('public/question_bank.json', 'utf8'));

const allQuestions = [];
for (const domain of data.domains) {
  for (const topic of domain.topics) {
    for (const subtopic of topic.subtopics) {
      for (const q of subtopic.questions) {
        allQuestions.push(q);
      }
    }
  }
}

console.log('Total questions:', allQuestions.length);
console.log('');

// Check for duplicate IDs
const idCounts = {};
for (const q of allQuestions) {
  idCounts[q.id] = (idCounts[q.id] || 0) + 1;
}
const duplicateIds = Object.entries(idCounts).filter(x => x[1] > 1);
console.log('=== Duplicate IDs ===');
console.log('Count:', duplicateIds.length);
duplicateIds.forEach(x => console.log('  -', x[0], ':', x[1], 'times'));

// Check for duplicate stems (similar questions by content)
const stemMap = {};
for (const q of allQuestions) {
  const key = q.stem.toLowerCase().trim().substring(0, 100);
  if (!stemMap[key]) stemMap[key] = [];
  stemMap[key].push(q.id);
}
const dupStems = Object.entries(stemMap).filter(x => x[1].length > 1);
console.log('');
console.log('=== Similar Stems (first 100 chars match) ===');
console.log('Count:', dupStems.length);
dupStems.forEach(x => {
  console.log('  - "' + x[0].substring(0, 60) + '..."');
  console.log('    IDs:', x[1].join(', '));
});

if (duplicateIds.length === 0 && dupStems.length === 0) {
  console.log('');
  console.log('✓ No duplicates found!');
}
