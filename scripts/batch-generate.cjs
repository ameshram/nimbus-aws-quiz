const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://54.83.78.220:3001';
const MISSING_TOPICS_FILE = path.join(__dirname, 'missing-topics.json');
const PROGRESS_FILE = path.join(__dirname, 'generation-progress.json');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateForTopic(topic) {
  const response = await fetch(`${SERVER_URL}/api/generate-for-topic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      domainId: topic.domainId,
      topicId: topic.topicId,
      subtopicId: topic.subtopicId,
      topicName: topic.topicName,
      subtopicName: topic.subtopicName,
      count: 3
    })
  });

  return response.json();
}

async function main() {
  const missingTopics = JSON.parse(fs.readFileSync(MISSING_TOPICS_FILE, 'utf8'));

  // Load progress if exists
  let progress = { completed: [], failed: [] };
  if (fs.existsSync(PROGRESS_FILE)) {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }

  const completedKeys = new Set(progress.completed.map(t => `${t.topicId}/${t.subtopicId}`));
  const remainingTopics = missingTopics.filter(t => !completedKeys.has(`${t.topicId}/${t.subtopicId}`));

  console.log(`Total missing: ${missingTopics.length}`);
  console.log(`Already completed: ${progress.completed.length}`);
  console.log(`Remaining: ${remainingTopics.length}`);
  console.log('');

  let totalGenerated = 0;

  for (let i = 0; i < remainingTopics.length; i++) {
    const topic = remainingTopics[i];
    const key = `${topic.topicId}/${topic.subtopicId}`;

    try {
      console.log(`[${i + 1}/${remainingTopics.length}] Generating for: ${key}`);

      const result = await generateForTopic(topic);

      if (result.success) {
        console.log(`  ✓ Generated ${result.generated} questions`);
        totalGenerated += result.generated;
        progress.completed.push({ ...topic, generated: result.generated });
      } else {
        console.log(`  ✗ Error: ${result.error}`);
        progress.failed.push({ ...topic, error: result.error });
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`);
      progress.failed.push({ ...topic, error: err.message });
    }

    // Save progress after each topic
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

    // Delay to avoid rate limiting
    if (i < remainingTopics.length - 1) {
      await sleep(1000);
    }
  }

  console.log('');
  console.log('=== Summary ===');
  console.log(`Topics processed: ${progress.completed.length}`);
  console.log(`Topics failed: ${progress.failed.length}`);
  console.log(`Total questions generated this run: ${totalGenerated}`);
}

main().catch(console.error);
