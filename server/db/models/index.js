import User from './User.js';
import QuizAttempt from './QuizAttempt.js';
import QuestionResponse from './QuestionResponse.js';
import UserProgress from './UserProgress.js';
import FlashcardProgress from './FlashcardProgress.js';
import FlashcardSession from './FlashcardSession.js';

// Define relationships

// User has many QuizAttempts
User.hasMany(QuizAttempt, {
  foreignKey: 'userId',
  as: 'quizAttempts'
});
QuizAttempt.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User has many QuestionResponses
User.hasMany(QuestionResponse, {
  foreignKey: 'userId',
  as: 'questionResponses'
});
QuestionResponse.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// QuizAttempt has many QuestionResponses
QuizAttempt.hasMany(QuestionResponse, {
  foreignKey: 'attemptId',
  as: 'responses'
});
QuestionResponse.belongsTo(QuizAttempt, {
  foreignKey: 'attemptId',
  as: 'attempt'
});

// User has many UserProgress records
User.hasMany(UserProgress, {
  foreignKey: 'userId',
  as: 'progress'
});
UserProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User has many FlashcardProgress records
User.hasMany(FlashcardProgress, {
  foreignKey: 'userId',
  as: 'flashcardProgress'
});
FlashcardProgress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User has many FlashcardSessions
User.hasMany(FlashcardSession, {
  foreignKey: 'userId',
  as: 'flashcardSessions'
});
FlashcardSession.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

export {
  User,
  QuizAttempt,
  QuestionResponse,
  UserProgress,
  FlashcardProgress,
  FlashcardSession
};

export default {
  User,
  QuizAttempt,
  QuestionResponse,
  UserProgress,
  FlashcardProgress,
  FlashcardSession
};
