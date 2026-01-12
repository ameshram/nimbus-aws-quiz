# Nimbus AWS Quiz

An interactive AWS certification study application with quiz and flashcard modes, featuring AI-powered content generation.

**Live Demo:** http://54.83.78.220:3001

## Features

### Quiz Mode
- Multi-choice questions for AWS DVA-C02 (Developer Associate) exam
- Filter by domain, topic, subtopic, and difficulty
- Detailed answer explanations with AWS documentation references
- Progress tracking with score summary
- Questions shuffled for each session

### Flashcard Mode
- 3D flip animation for interactive studying
- Filter by category
- Keyboard shortcuts (Space to flip, Arrow keys to navigate)
- Shuffle functionality during study sessions
- Progress tracking with completion summary

### Admin Tools
- **Auto Generate Questions** - AI-powered question generation for all subtopics
- **Auto Validate Questions** - Validates questions against current AWS documentation
- **Auto Generate Flashcards** - AI-powered flashcard generation for all categories

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)

### Backend
- Express.js
- Anthropic Claude API (AI content generation)
- PostgreSQL + Sequelize ORM (progress tracking)

### Deployment
- AWS Lightsail VPS
- PM2 (process manager)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ameshram/nimbus-aws-quiz.git
cd nimbus-aws-quiz
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=your-api-key-here
```

### Development

Start the development server:
```bash
# Start backend server
npm run server

# In another terminal, start frontend
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts (Auth)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── server/                 # Backend Express server
│   ├── db/                 # Database models and config
│   ├── prompts/            # AI prompt templates
│   ├── routes/             # API routes
│   └── utils/              # Server utilities
├── public/                 # Static assets
│   ├── question_bank.json  # Quiz questions
│   └── flashcard_bank.json # Flashcards
└── scripts/                # Build and utility scripts
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/topics` | GET | Get all quiz topics |
| `/api/flashcards` | GET | Get all flashcards |
| `/api/flashcard-categories` | GET | Get flashcard categories |
| `/api/auto-generate` | POST | Generate new questions |
| `/api/auto-validate` | POST | Validate existing questions |
| `/api/auto-generate-flashcards` | POST | Generate new flashcards |

## Deployment

### AWS Lightsail VPS

```bash
# Set your Anthropic API key
export ANTHROPIC_API_KEY=your-api-key

# Deploy to Lightsail
./deploy-lightsail-instance.sh
```

### Docker

```bash
docker-compose up -d
```

## License

MIT

## Author

Anup Meshram
