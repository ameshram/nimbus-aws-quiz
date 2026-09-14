# Nimbus AWS Quiz

![ci](https://github.com/ameshram/nimbus-aws-quiz/actions/workflows/ci.yml/badge.svg)

A full-stack AWS certification study app (React + TypeScript · Express ·
PostgreSQL · Docker), whose question and flashcard banks are produced by an
**LLM content-generation pipeline** — multi-model question research, structured
generation prompts, and an LLM validation pass — using the Anthropic Claude API.

The interesting engineering here is the **content pipeline and prompt design**,
not the quiz UI. See ["How the content pipeline works"](#how-the-content-pipeline-works).

> Demo: run it locally in ~1 minute — see [Quickstart](#quickstart).

## Features

**Study experience**
- Multiple-choice quiz for AWS DVA-C02 with domain / topic / subtopic /
  difficulty filters, shuffled per session, and per-answer explanations that
  cite AWS documentation (as authored by the generation prompts).
- Flashcard mode with 3D flip, category filters, keyboard shortcuts, and
  progress tracking.
- Progress persistence via PostgreSQL + Sequelize.

**Content pipeline (admin tools)**
- **Generate questions / flashcards** — structured, role-scoped prompts produce
  new items per subtopic/category.
- **LLM validation pass** — re-reads each question against a rubric prompt and
  flags likely technical inaccuracies and inconsistencies. See the honest
  caveat below on what this does and does not guarantee.

## How the content pipeline works

```
Research (chatgpt/claude/grok drafts)  ─►  Structured generation prompt  ─►
  question/flashcard bank (JSON)  ─►  LLM validation pass (rubric prompt)  ─►
  de-duplication + merge  ─►  public/*.json served by the app
```

- **Generation** (`server/prompts/questionGeneration.js`,
  `flashcardGeneration.js`): role-scoped prompts that emit strictly-structured
  items for a given exam / domain / subtopic.
- **Validation** (`server/prompts/questionValidation.js`): a second LLM pass
  that scores each question against a technical-accuracy rubric.
- **Assembly** (`scripts/*.cjs`): batch generation, duplicate detection, and
  bank merging.

> **Honest caveat on validation.** The validation step is an **LLM self-review
> against a rubric prompt** — the model is asked to check each question for
> technical plausibility and internal consistency. It is **not** retrieval-
> grounded fact-checking against live AWS documentation, so it cannot guarantee
> correctness. Treat generated content as a study aid, not an authoritative
> source. (Grounding the validator with real AWS-docs retrieval is the top item
> on the roadmap.)

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Backend:** Express, Anthropic Claude API, PostgreSQL + Sequelize
- **Tooling:** Vitest (tests), ESLint, GitHub Actions CI
- **Packaging/Deploy:** Docker + docker-compose

## Quickstart

```bash
npm install
npm test          # unit tests (pure quiz logic + prompt builders)
npm run dev       # Vite client + Express server (needs ANTHROPIC_API_KEY for admin tools)
```

The quiz/flashcard study modes run from the committed banks in `public/`
without an API key; the Claude API key is only needed for the admin content
pipeline. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY` to use it.

## Testing & CI

- `npm test` — Vitest unit tests for the quiz engine's pure logic
  (`src/utils/questionUtils.ts`: filtering, multi-select answer checking,
  shuffling, aggregation) and the prompt builders.
- `npm run lint` — ESLint (`eslint:recommended` + `typescript-eslint`).
- `npm run build` — strict `tsc` type-check + production Vite build.
- CI runs all four on every push (`.github/workflows/ci.yml`).

## Project structure

```
├── src/                    # React + TS frontend
│   ├── components/  hooks/  contexts/  types/
│   └── utils/              # pure quiz logic (+ questionUtils.test.ts)
├── server/                 # Express backend
│   ├── db/                 # Sequelize models
│   ├── prompts/            # generation + validation prompts (+ tests)
│   ├── routes/  utils/
├── scripts/                # batch generation / dedup / merge (.cjs)
├── public/                 # question_bank.json, flashcard_bank.json
└── .github/workflows/ci.yml
```

## API endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/topics` | GET | Quiz topics |
| `/api/flashcards` | GET | Flashcards |
| `/api/flashcard-categories` | GET | Flashcard categories |
| `/api/auto-generate` | POST | Generate questions (admin) |
| `/api/auto-validate` | POST | LLM validation pass (admin) |
| `/api/auto-generate-flashcards` | POST | Generate flashcards (admin) |

## Deployment

Containerized with Docker; `docker compose up -d` runs the app. Deploy scripts
for a single VPS are in `deploy-lightsail*.sh`. Serve behind HTTPS and put the
admin content-pipeline routes behind authentication before exposing publicly.

## Roadmap

- Ground the validation pass with real AWS-docs retrieval (RAG) so it can
  fact-check, not just self-review.
- Component/integration tests for the quiz and flashcard views.
- Auth on the admin pipeline routes.

## License

[MIT](LICENSE) © Anup Meshram
