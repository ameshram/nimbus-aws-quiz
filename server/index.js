import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';
import { fileURLToPath } from 'url';

import { buildQuestionGenerationPrompt } from './prompts/questionGeneration.js';
import { buildValidationPrompt } from './prompts/questionValidation.js';
import { buildFlashcardGenerationPrompt, buildTopicFlashcardPrompt } from './prompts/flashcardGeneration.js';
import {
  readQuestionBank,
  writeQuestionBank,
  getAllSubtopics,
  getSubtopicsWithUnvalidatedQuestions,
  findSubtopic,
  getTopicsForApi,
  getValidationStats,
  processGeneratedQuestions
} from './utils/questionBank.js';
import {
  readFlashcardBank,
  writeFlashcardBank,
  getAllFlashcards,
  getFlashcardsByCategory,
  getCategoriesForApi,
  getFlashcardStats
} from './utils/flashcardBank.js';

// Database and routes
import { testConnection, initDatabase } from './db/config.js';
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUESTION_BANK_PATH = path.join(__dirname, '../public/question_bank.json');
const FLASHCARD_BANK_PATH = path.join(__dirname, '../public/flashcard_bank.json');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  console.error('Error loading .env file:', envResult.error);
}

const apiKey = envResult.parsed?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  console.error('WARNING: ANTHROPIC_API_KEY not found');
} else {
  console.log('ANTHROPIC_API_KEY loaded successfully');
}

// Initialize Express and Anthropic
const app = express();
const PORT = process.env.PORT || 3001;
const anthropic = new Anthropic({ apiKey });

app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
}

// Serve question bank from public (always up-to-date)
app.get('/api/question-bank', async (req, res) => {
  try {
    const questionBank = await readQuestionBank(QUESTION_BANK_PATH);
    res.json(questionBank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Small delay to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// AUTO-GENERATE: Generate questions for all subtopics
// ============================================
app.post('/api/auto-generate', async (req, res) => {
  const { questionsPerSubtopic = 2, difficulty = 'medium' } = req.body;

  try {
    const questionBank = await readQuestionBank(QUESTION_BANK_PATH);
    const subtopics = getAllSubtopics(questionBank);

    console.log(`Auto-generating ${questionsPerSubtopic} questions for ${subtopics.length} subtopics`);

    let totalGenerated = 0;
    const results = [];

    for (let i = 0; i < subtopics.length; i++) {
      const { domain, topic, subtopic, existingQuestions } = subtopics[i];

      try {
        console.log(`[${i + 1}/${subtopics.length}] Generating for: ${subtopic.name}`);

        const prompt = buildQuestionGenerationPrompt({
          examName: questionBank.exam,
          domainName: domain.name,
          topicName: topic.name,
          subtopicName: subtopic.name,
          topicId: topic.topic_id,
          subtopicId: subtopic.subtopic_id,
          domainId: domain.domain_id,
          difficulty,
          count: questionsPerSubtopic,
          existingQuestions
        });

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        });

        const responseText = message.content[0].text;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          const generatedQuestions = JSON.parse(jsonMatch[0]);
          const processedQuestions = processGeneratedQuestions(generatedQuestions, {
            subtopicId: subtopic.subtopic_id,
            topicId: topic.topic_id,
            domainId: domain.domain_id,
            index: i
          });

          subtopic.questions.push(...processedQuestions);
          subtopic.num_questions_generated = subtopic.questions.length;
          totalGenerated += processedQuestions.length;

          results.push({ subtopic: subtopic.name, generated: processedQuestions.length, status: 'success' });
        }
      } catch (err) {
        console.error(`Error generating for ${subtopic.name}:`, err.message);
        results.push({ subtopic: subtopic.name, generated: 0, status: 'error', error: err.message });
      }

      if (i < subtopics.length - 1) await delay(500);
    }

    // Save updated question bank
    questionBank.generated_at = new Date().toISOString();
    if (!questionBank.sources.includes('ai-generated')) {
      questionBank.sources.push('ai-generated');
    }
    await writeQuestionBank(QUESTION_BANK_PATH, questionBank);

    res.json({ success: true, totalGenerated, subtopicsProcessed: subtopics.length, results });
  } catch (error) {
    console.error('Error in auto-generate:', error);
    res.status(500).json({ error: 'Auto-generate failed', details: error.message });
  }
});

// ============================================
// AUTO-VALIDATE: Validate all unvalidated questions
// ============================================
app.post('/api/auto-validate', async (req, res) => {
  const { batchSize = 5 } = req.body;

  try {
    const questionBank = await readQuestionBank(QUESTION_BANK_PATH);
    const subtopicsToValidate = getSubtopicsWithUnvalidatedQuestions(questionBank);

    console.log(`Auto-validating ${subtopicsToValidate.length} subtopics with unvalidated questions`);

    let totalValidated = 0;
    let totalCorrected = 0;
    let totalRemoved = 0;
    const results = [];

    for (let i = 0; i < subtopicsToValidate.length; i++) {
      const { domain, topic, subtopic, unvalidatedQuestions } = subtopicsToValidate[i];

      for (let batchStart = 0; batchStart < unvalidatedQuestions.length; batchStart += batchSize) {
        const batch = unvalidatedQuestions.slice(batchStart, batchStart + batchSize);

        try {
          console.log(`[${i + 1}/${subtopicsToValidate.length}] Validating ${batch.length} questions for: ${subtopic.name}`);

          const prompt = buildValidationPrompt({
            examName: questionBank.exam,
            domainName: domain.name,
            topicName: topic.name,
            subtopicName: subtopic.name,
            questions: batch
          });

          const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            messages: [{ role: 'user', content: prompt }]
          });

          const responseText = message.content[0].text;
          const jsonMatch = responseText.match(/\{[\s\S]*"validated_questions"[\s\S]*\}/);

          if (jsonMatch) {
            const validationResult = JSON.parse(jsonMatch[0]);

            for (const validatedQ of validationResult.validated_questions) {
              const questionIndex = subtopic.questions.findIndex(q => q.id === validatedQ.id);
              if (questionIndex !== -1) {
                if (validatedQ.validation_status === 'remove') {
                  subtopic.questions.splice(questionIndex, 1);
                  totalRemoved++;
                } else {
                  subtopic.questions[questionIndex] = {
                    ...subtopic.questions[questionIndex],
                    ...validatedQ,
                    validated_at: new Date().toISOString()
                  };
                  if (validatedQ.validation_status === 'valid') totalValidated++;
                  if (validatedQ.validation_status === 'corrected') totalCorrected++;
                }
              }
            }
          }
        } catch (err) {
          console.error(`Error validating batch for ${subtopic.name}:`, err.message);
        }

        await delay(500);
      }

      subtopic.num_questions_generated = subtopic.questions.length;
      results.push({ subtopic: subtopic.name, processed: unvalidatedQuestions.length });
    }

    questionBank.last_validated = new Date().toISOString();
    await writeQuestionBank(QUESTION_BANK_PATH, questionBank);

    res.json({ success: true, totalValidated, totalCorrected, totalRemoved, subtopicsProcessed: subtopicsToValidate.length, results });
  } catch (error) {
    console.error('Error in auto-validate:', error);
    res.status(500).json({ error: 'Auto-validate failed', details: error.message });
  }
});

// ============================================
// GET TOPICS: List all available topics
// ============================================
app.get('/api/topics', async (req, res) => {
  try {
    const questionBank = await readQuestionBank(QUESTION_BANK_PATH);
    const topics = getTopicsForApi(questionBank);
    res.json({ topics });
  } catch (error) {
    console.error('Error reading topics:', error);
    res.status(500).json({ error: 'Failed to read topics' });
  }
});

// ============================================
// GET VALIDATION STATS: Stats for all subtopics
// ============================================
app.get('/api/validation-stats', async (req, res) => {
  try {
    const questionBank = await readQuestionBank(QUESTION_BANK_PATH);
    const stats = getValidationStats(questionBank);
    res.json({ stats });
  } catch (error) {
    console.error('Error getting validation stats:', error);
    res.status(500).json({ error: 'Failed to get validation stats' });
  }
});

// ============================================
// FLASHCARD ENDPOINTS
// ============================================

// GET all flashcards (with optional category filter)
app.get('/api/flashcards', async (req, res) => {
  try {
    const { category } = req.query;
    const flashcardBank = await readFlashcardBank(FLASHCARD_BANK_PATH);

    let flashcards;
    if (category) {
      flashcards = getFlashcardsByCategory(flashcardBank, category);
    } else {
      flashcards = getAllFlashcards(flashcardBank);
    }

    res.json({
      flashcards,
      total: flashcards.length,
      exam: flashcardBank.exam
    });
  } catch (error) {
    console.error('Error reading flashcards:', error);
    res.status(500).json({ error: 'Failed to read flashcards' });
  }
});

// GET all flashcard categories
app.get('/api/flashcard-categories', async (req, res) => {
  try {
    const flashcardBank = await readFlashcardBank(FLASHCARD_BANK_PATH);
    const categories = getCategoriesForApi(flashcardBank);
    res.json({
      categories,
      totalCategories: categories.length,
      totalFlashcards: flashcardBank.total_flashcards
    });
  } catch (error) {
    console.error('Error reading flashcard categories:', error);
    res.status(500).json({ error: 'Failed to read flashcard categories' });
  }
});

// GET flashcard statistics
app.get('/api/flashcard-stats', async (req, res) => {
  try {
    const flashcardBank = await readFlashcardBank(FLASHCARD_BANK_PATH);
    const stats = getFlashcardStats(flashcardBank);
    res.json({ stats });
  } catch (error) {
    console.error('Error getting flashcard stats:', error);
    res.status(500).json({ error: 'Failed to get flashcard stats' });
  }
});

// ============================================
// AUTO-GENERATE FLASHCARDS: Generate flashcards for all categories
// ============================================
app.post('/api/auto-generate-flashcards', async (req, res) => {
  const { cardsPerCategory = 5 } = req.body;

  try {
    const flashcardBank = await readFlashcardBank(FLASHCARD_BANK_PATH);
    const categories = flashcardBank.categories;

    console.log(`Auto-generating ${cardsPerCategory} flashcards for ${categories.length} categories`);

    let totalGenerated = 0;
    const results = [];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      try {
        console.log(`[${i + 1}/${categories.length}] Generating for: ${category.name}`);

        // Get existing flashcard fronts to avoid duplicates
        const existingFlashcards = category.flashcards.map(fc => fc.front);

        const prompt = buildFlashcardGenerationPrompt({
          examName: flashcardBank.exam,
          categoryName: category.name,
          categoryId: category.category_id,
          count: cardsPerCategory,
          existingFlashcards
        });

        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        });

        const responseText = message.content[0].text;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          const generatedFlashcards = JSON.parse(jsonMatch[0]);

          // Process and add IDs to new flashcards
          const processedFlashcards = generatedFlashcards.map((fc, idx) => ({
            id: `fc-${category.category_id}-${Date.now()}-${idx}`,
            front: fc.front,
            back: fc.back,
            category: category.category_id,
            tags: fc.tags || [category.category_id],
            difficulty: fc.difficulty || 'medium',
            created_at: new Date().toISOString()
          }));

          category.flashcards.push(...processedFlashcards);
          totalGenerated += processedFlashcards.length;

          results.push({
            category: category.name,
            generated: processedFlashcards.length,
            status: 'success'
          });
        }
      } catch (err) {
        console.error(`Error generating for ${category.name}:`, err.message);
        results.push({
          category: category.name,
          generated: 0,
          status: 'error',
          error: err.message
        });
      }

      // Delay between categories to avoid rate limiting
      if (i < categories.length - 1) await delay(500);
    }

    // Update total count and save
    flashcardBank.total_flashcards = categories.reduce(
      (sum, cat) => sum + cat.flashcards.length,
      0
    );
    flashcardBank.generated_at = new Date().toISOString();
    await writeFlashcardBank(FLASHCARD_BANK_PATH, flashcardBank);

    res.json({
      success: true,
      totalGenerated,
      categoriesProcessed: categories.length,
      results
    });
  } catch (error) {
    console.error('Error in auto-generate-flashcards:', error);
    res.status(500).json({ error: 'Auto-generate flashcards failed', details: error.message });
  }
});

// ============================================
// GENERATE FOR SPECIFIC TOPIC: Generate questions for a specific topic/subtopic
// ============================================
app.post('/api/generate-for-topic', async (req, res) => {
  const { domainId, topicId, subtopicId, topicName, subtopicName, count = 3 } = req.body;

  if (!domainId || !topicId || !subtopicId) {
    return res.status(400).json({ error: 'Missing required fields: domainId, topicId, subtopicId' });
  }

  try {
    const questionBank = await readQuestionBank(QUESTION_BANK_PATH);

    // Find or create domain
    let domain = questionBank.domains.find(d => d.domain_id === domainId);
    if (!domain) {
      const domainNames = {
        'domain-1-development': 'Development with AWS Services',
        'domain-2-security': 'Security',
        'domain-3-deployment': 'Deployment',
        'domain-4-troubleshooting': 'Troubleshooting and Optimization'
      };
      domain = { domain_id: domainId, name: domainNames[domainId] || domainId, topics: [] };
      questionBank.domains.push(domain);
    }

    // Find or create topic
    let topic = domain.topics.find(t => t.topic_id === topicId);
    if (!topic) {
      topic = { topic_id: topicId, name: topicName || topicId, subtopics: [] };
      domain.topics.push(topic);
    }

    // Find or create subtopic
    let subtopic = topic.subtopics.find(s => s.subtopic_id === subtopicId);
    if (!subtopic) {
      subtopic = { subtopic_id: subtopicId, name: subtopicName || subtopicId, num_questions_generated: 0, questions: [] };
      topic.subtopics.push(subtopic);
    }

    // Get existing questions to avoid duplicates
    const existingQuestions = subtopic.questions.map(q => q.stem.substring(0, 100));

    console.log(`Generating ${count} questions for ${topicId}/${subtopicId}`);

    const prompt = buildQuestionGenerationPrompt({
      examName: questionBank.exam,
      domainName: domain.name,
      topicName: topic.name,
      subtopicName: subtopic.name,
      topicId: topicId,
      subtopicId: subtopicId,
      domainId: domainId,
      difficulty: 'medium',
      count: count,
      existingQuestions
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const generatedQuestions = JSON.parse(jsonMatch[0]);
      const timestamp = Date.now();

      const processedQuestions = generatedQuestions.map((q, idx) => ({
        id: `${topicId}-${subtopicId}-${timestamp}-${idx}`,
        ...q,
        topic: topicId,
        subtopic: subtopicId,
        domain: domainId,
        created_at: new Date().toISOString()
      }));

      subtopic.questions.push(...processedQuestions);
      subtopic.num_questions_generated = subtopic.questions.length;

      questionBank.generated_at = new Date().toISOString();
      await writeQuestionBank(QUESTION_BANK_PATH, questionBank);

      res.json({
        success: true,
        generated: processedQuestions.length,
        topicId,
        subtopicId,
        totalInSubtopic: subtopic.questions.length
      });
    } else {
      res.status(500).json({ error: 'Failed to parse generated questions' });
    }
  } catch (error) {
    console.error(`Error generating for ${topicId}/${subtopicId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// GENERATE FLASHCARDS FOR TOPIC: Generate flashcards for a specific topic/subtopic
// ============================================
app.post('/api/generate-flashcards-for-topic', async (req, res) => {
  const { categoryId, categoryName, subtopicId, subtopicName, count = 5 } = req.body;

  if (!categoryId || !subtopicId) {
    return res.status(400).json({ error: 'Missing required fields: categoryId, subtopicId' });
  }

  try {
    const flashcardBank = await readFlashcardBank(FLASHCARD_BANK_PATH);

    // Find or create category
    let category = flashcardBank.categories.find(c => c.category_id === categoryId);
    if (!category) {
      category = { category_id: categoryId, name: categoryName || categoryId, flashcards: [] };
      flashcardBank.categories.push(category);
    }

    console.log(`Generating ${count} flashcards for ${categoryId}/${subtopicId}`);

    const prompt = buildTopicFlashcardPrompt({
      examName: flashcardBank.exam || 'AWS Certified Developer – Associate (DVA-C02)',
      categoryName: category.name,
      categoryId: categoryId,
      subtopicName: subtopicName || subtopicId,
      subtopicId: subtopicId,
      count: count
    });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const generatedFlashcards = JSON.parse(jsonMatch[0]);
      const timestamp = Date.now();

      const processedFlashcards = generatedFlashcards.map((fc, idx) => ({
        id: `fc-${categoryId}-${subtopicId}-${timestamp}-${idx}`,
        front: fc.front,
        back: fc.back,
        category: categoryId,
        subtopic: subtopicId,
        tags: fc.tags || [categoryId, subtopicId],
        difficulty: fc.difficulty || 'medium',
        created_at: new Date().toISOString()
      }));

      category.flashcards.push(...processedFlashcards);

      flashcardBank.generated_at = new Date().toISOString();
      flashcardBank.total_flashcards = flashcardBank.categories.reduce((sum, c) => sum + c.flashcards.length, 0);
      await writeFlashcardBank(FLASHCARD_BANK_PATH, flashcardBank);

      res.json({
        success: true,
        generated: processedFlashcards.length,
        categoryId,
        subtopicId,
        totalInCategory: category.flashcards.length
      });
    } else {
      res.status(500).json({ error: 'Failed to parse generated flashcards' });
    }
  } catch (error) {
    console.error(`Error generating flashcards for ${categoryId}/${subtopicId}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SPA fallback for production
// ============================================
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ============================================
// Start server
// ============================================
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (dbConnected) {
      // Initialize database tables
      await initDatabase();
      console.log('Database initialized successfully');
    } else {
      console.warn('Running without database - progress tracking disabled');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Nimbus API server running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
