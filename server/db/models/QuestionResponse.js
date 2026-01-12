import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const QuestionResponse = sequelize.define('QuestionResponse', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  attemptId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'attempt_id',
    references: {
      model: 'quiz_attempts',
      key: 'id'
    }
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
  questionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'question_id',
    comment: 'Reference to question_bank.json question ID'
  },
  domainId: {
    type: DataTypes.STRING(50),
    field: 'domain_id'
  },
  topicId: {
    type: DataTypes.STRING(50),
    field: 'topic_id'
  },
  subtopicId: {
    type: DataTypes.STRING(50),
    field: 'subtopic_id'
  },
  selectedOptions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    field: 'selected_options'
  },
  correctOptions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    field: 'correct_options'
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_correct'
  },
  timeSpentSeconds: {
    type: DataTypes.INTEGER,
    field: 'time_spent_seconds'
  },
  difficulty: {
    type: DataTypes.STRING(20)
  },
  answeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'answered_at'
  }
}, {
  tableName: 'question_responses',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['question_id'] },
    { fields: ['attempt_id'] },
    { fields: ['user_id', 'question_id'] },
    { fields: ['subtopic_id'] }
  ]
});

export default QuestionResponse;
