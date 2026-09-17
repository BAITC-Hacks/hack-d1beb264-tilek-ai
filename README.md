# TILEK-AI

TILEK-AI turns a lecture transcript into grounded study materials for students, supporting Russian and Kazakh text.

## Features

- Lecture input, preprocessing and deterministic chunking
- OpenAI knowledge extraction
- Structured summary, key theses, quiz and flashcards
- Source attribution for every generated item
- Interactive quizzes and flip cards

## Architecture \ Архитектура

```
Lecture → Preprocessing → Chunking → Knowledge extraction → Material generation
                                                ↓
                     Summary · Theses · Quiz · Flashcards
```

## Run locally \ Локальный запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_OPENAI_API_KEY` in `.env`. This is a frontend-only hackathon MVP: `VITE_` variables are exposed to browsers, so production should use a server-side proxy or Vercel serverless function.
