import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const FlashcardSession = sequelize.define('FlashcardSession', {
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
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Category filter used (null = all categories)'
  },
  cardsStudied: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'cards_studied'
  },
  totalCards: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_cards'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'started_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completed_at'
  }
}, {
  tableName: 'flashcard_sessions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['started_at'] }
  ]
});

export default FlashcardSession;
