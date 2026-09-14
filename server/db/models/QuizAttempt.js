import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  examId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'exam_id'
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_questions'
  },
  correctAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'correct_answers'
  },
  incorrectAnswers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'incorrect_answers'
  },
  skippedQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'skipped_questions'
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    field: 'time_spent_seconds'
  },
  filters: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Filters applied: domains, topics, subtopics, difficulties'
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    defaultValue: 'in_progress'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  }
}, {
  tableName: 'quiz_attempts',
  timestamps: true,
  underscored: true
});

export default QuizAttempt;
