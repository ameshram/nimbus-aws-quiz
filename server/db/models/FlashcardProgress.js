import { DataTypes } from 'sequelize';
import { sequelize } from '../config.js';

const FlashcardProgress = sequelize.define('FlashcardProgress', {
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
  flashcardId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'flashcard_id'
  },
  timesViewed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'times_viewed'
  },
  lastViewedAt: {
    type: DataTypes.DATE,
    field: 'last_viewed_at'
  }
}, {
  tableName: 'flashcard_progress',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'flashcard_id'], unique: true },
    { fields: ['user_id'] }
  ]
});

export default FlashcardProgress;
