import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const UserProgress = sequelize.define('UserProgress', {
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
  subtopicId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'subtopic_id'
  },
  totalAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_attempts'
  },
  correctAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'correct_attempts'
  },
  masteryLevel: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    field: 'mastery_level',
    comment: 'Percentage mastery 0-100'
  },
  lastAttemptAt: {
    type: DataTypes.DATE,
    field: 'last_attempt_at'
  },
  // Spaced repetition fields
  nextReviewAt: {
    type: DataTypes.DATE,
    field: 'next_review_at'
  },
  easeFactor: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 2.5,
    field: 'ease_factor',
    comment: 'SM-2 algorithm ease factor'
  },
  interval: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: 'Days until next review'
  },
  repetitions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of successful repetitions'
  }
}, {
  tableName: 'user_progress',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'exam_id'] },
    { fields: ['user_id', 'subtopic_id'], unique: true },
    { fields: ['next_review_at'] }
  ]
});

export default UserProgress;
