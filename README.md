# AI Digital Product Research Agent

Agentic web app for market and product research. Enter a product idea or niche and receive a structured, deeply reasoned report: problems, ICP, demand signals, competitors, pricing ladders, distribution, risks, validation plan, and MVP concepts. Supports optional web-backed research via Tavily.

## 🚀 Quickstart

### Requirements
- Node.js 18+
- npm
- OpenAI API key (`OPENAI_API_KEY`)
- Optional: Tavily API key (`TAVILY_API_KEY`) for web search context

### Setup
```bash
npm install
cp .env.example .env # add your keys
npm run dev
```
Open http://localhost:3000 and run your research.

### Build & Start
```bash
npm run build
npm start
```

## Environment Variables
- `OPENAI_API_KEY` (required) — used for generating reports
- `TAVILY_API_KEY` (optional) — improves results with live web context

## Tech Stack
- Next.js 14 (App Router)
- React 18
- OpenAI SDK (streaming)

## Deployment (Vercel)
This repo is ready for Vercel. After setting environment variables in your Vercel project, deploy:
```bash
npx vercel deploy --prod --yes --name agentic-15cbba9d
```

## Notes
- If `TAVILY_API_KEY` is not set, the agent will still produce reports using model knowledge.