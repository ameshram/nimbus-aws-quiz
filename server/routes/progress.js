import { Router } from 'express';
import { Op } from 'sequelize';
import { QuizAttempt, QuestionResponse, UserProgress, User } from '../db/models/index.js';
import { sequelize } from '../db/config.js';

const router = Router();

// Middleware to check user authentication
const requireAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.userId = userId;
  next();
};

// ============================================
// QUIZ ATTEMPTS
// ============================================

// Start a new quiz attempt
router.post('/attempts', requireAuth, async (req, res) => {
  try {
    const { examId, totalQuestions, filters } = req.body;

    const attempt = await QuizAttempt.create({
      userId: req.userId,
      examId,
      totalQuestions,
      filters: filters || {},
      status: 'in_progress'
    });

    res.json({ success: true, attempt });
  } catch (error) {
    console.error('Error creating attempt:', error);
    res.status(500).json({ error: 'Failed to create quiz attempt' });
  }
});

// Submit answer for a question
router.post('/attempts/:attemptId/answers', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, correctOptions, isCorrect, timeSpentSeconds, domainId, topicId, subtopicId, difficulty } = req.body;

    // Verify attempt belongs to user
    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId: req.userId }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Create question response
    const response = await QuestionResponse.create({
      attemptId,
      userId: req.userId,
      questionId,
      selectedOptions,
      correctOptions,
      isCorrect,
      timeSpentSeconds,
      domainId,
      topicId,
      subtopicId,
      difficulty
    });

    // Update attempt counters
    if (isCorrect) {
      await attempt.increment('correctAnswers');
    } else {
      await attempt.increment('incorrectAnswers');
    }

    // Update user progress for this subtopic
    await updateUserProgress(req.userId, attempt.examId, subtopicId, isCorrect);

    res.json({ success: true, response });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

// Complete a quiz attempt
router.put('/attempts/:attemptId/complete', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { timeSpentSeconds } = req.body;

    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId: req.userId }
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    // Calculate score
    const score = attempt.totalQuestions > 0
      ? (attempt.correctAnswers / attempt.totalQuestions) * 100
      : 0;

    // Calculate skipped
    const answered = attempt.correctAnswers + attempt.incorrectAnswers;
    const skipped = attempt.totalQuestions - answered;

    await attempt.update({
      score,
      skippedQuestions: skipped,
      timeSpentSeconds,
      status: 'completed',
      completedAt: new Date()
    });

    res.json({ success: true, attempt });
  } catch (error) {
    console.error('Error completing attempt:', error);
    res.status(500).json({ error: 'Failed to complete attempt' });
  }
});

// Get user's quiz history
router.get('/attempts', requireAuth, async (req, res) => {
  try {
    const { examId, limit = 20, offset = 0 } = req.query;

    const where = { userId: req.userId };
    if (examId) where.examId = examId;

    const attempts = await QuizAttempt.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      attempts: attempts.rows,
      total: attempts.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Get single attempt with responses
router.get('/attempts/:attemptId', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findOne({
      where: { id: attemptId, userId: req.userId },
      include: [{
        model: QuestionResponse,
        as: 'responses'
      }]
    });

    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    res.json({ attempt });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({ error: 'Failed to fetch attempt' });
  }
});

// ============================================
// USER PROGRESS & ANALYTICS
// ============================================

// Get overall progress for an exam
router.get('/stats/:examId', requireAuth, async (req, res) => {
  try {
    const { examId } = req.params;

    // Get all progress records for this exam
    const progress = await UserProgress.findAll({
      where: { userId: req.userId, examId }
    });

    // Get attempt statistics
    const attemptStats = await QuizAttempt.findAll({
      where: { userId: req.userId, examId, status: 'completed' },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalAttempts'],
        [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
        [sequelize.fn('MAX', sequelize.col('score')), 'bestScore'],
        [sequelize.fn('SUM', sequelize.col('time_spent_seconds')), 'totalTimeSpent']
      ],
      raw: true
    });

    // Get questions answered by subtopic
    const subtopicStats = await QuestionResponse.findAll({
      where: { userId: req.userId },
      attributes: [
        'subtopicId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalAnswered'],
        [sequelize.fn('SUM', sequelize.literal('CASE WHEN is_correct THEN 1 ELSE 0 END')), 'correctAnswers']
      ],
      group: ['subtopicId'],
      raw: true
    });

    res.json({
      progress,
      attemptStats: attemptStats[0] || {},
      subtopicStats
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get weak areas (subtopics with low mastery)
router.get('/weak-areas/:examId', requireAuth, async (req, res) => {
  try {
    const { examId } = req.params;
    const { threshold = 70 } = req.query;

    const weakAreas = await UserProgress.findAll({
      where: {
        userId: req.userId,
        examId,
        masteryLevel: { [Op.lt]: threshold },
        totalAttempts: { [Op.gt]: 0 }
      },
      order: [['masteryLevel', 'ASC']],
      limit: 10
    });

    res.json({ weakAreas });
  } catch (error) {
    console.error('Error fetching weak areas:', error);
    res.status(500).json({ error: 'Failed to fetch weak areas' });
  }
});

// Get questions due for review (spaced repetition)
router.get('/due-review/:examId', requireAuth, async (req, res) => {
  try {
    const { examId } = req.params;

    const dueForReview = await UserProgress.findAll({
      where: {
        userId: req.userId,
        examId,
        nextReviewAt: { [Op.lte]: new Date() }
      },
      order: [['nextReviewAt', 'ASC']],
      limit: 20
    });

    res.json({ dueForReview });
  } catch (error) {
    console.error('Error fetching due reviews:', error);
    res.status(500).json({ error: 'Failed to fetch due reviews' });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function updateUserProgress(userId, examId, subtopicId, isCorrect) {
  if (!subtopicId) return;

  try {
    let progress = await UserProgress.findOne({
      where: { userId, subtopicId }
    });

    if (!progress) {
      progress = await UserProgress.create({
        userId,
        examId,
        subtopicId,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        masteryLevel: isCorrect ? 100 : 0,
        lastAttemptAt: new Date()
      });
    } else {
      const newTotal = progress.totalAttempts + 1;
      const newCorrect = progress.correctAttempts + (isCorrect ? 1 : 0);
      const newMastery = (newCorrect / newTotal) * 100;

      // SM-2 spaced repetition algorithm
      let { easeFactor, interval, repetitions } = progress;

      if (isCorrect) {
        repetitions += 1;
        if (repetitions === 1) {
          interval = 1;
        } else if (repetitions === 2) {
          interval = 6;
        } else {
          interval = Math.round(interval * easeFactor);
        }
        easeFactor = Math.max(1.3, easeFactor + 0.1);
      } else {
        repetitions = 0;
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
      }

      const nextReviewAt = new Date();
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);

      await progress.update({
        totalAttempts: newTotal,
        correctAttempts: newCorrect,
        masteryLevel: newMastery,
        lastAttemptAt: new Date(),
        easeFactor,
        interval,
        repetitions,
        nextReviewAt
      });
    }
  } catch (error) {
    console.error('Error updating progress:', error);
  }
}

export default router;
