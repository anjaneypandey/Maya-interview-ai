# Maya AI Interview Screener

Live Demo: https://maya-interview-ai-frontend.onrender.com

## Overview

Maya AI Interview Screener is a voice-based interview app built for tutor screening. Candidates speak naturally to Maya, an AI interviewer, and receive a structured assessment report after the session.

The project includes:
- `frontend/`: React + Vite application for the interview UI and transcript flow.
- `backend/`: Express API that evaluates transcripts using Google Gemini or a fallback scoring heuristic.

## Key Features

- Voice-first interview experience with a friendly AI interviewer.
- Real-time transcript capture for both Maya and the candidate.
- Backend assessment endpoint at `/api/assess`.
- Intelligent scoring with PASS / HOLD / REJECT recommendation.
- Detailed report page with dimension breakdown and strengths/concerns.
- Print/download report support.

## Tech Stack

- Frontend: React 19, Vite, `@vapi-ai/web`
- Backend: Express 5, CORS, dotenv
- AI assessment: `@google/generative-ai` (Gemini) with fallback transcript analyzer

## Repository Structure

- `frontend/`
  - `src/App.jsx` — controls landing, interview, and report stages.
  - `src/Interview.jsx` — handles voice session, transcript aggregation, and assessment requests.
  - `src/Report.jsx` — renders assessment results and score cards.
  - `index.html` — frontend entry page.
- `backend/`
  - `server.js` — Express server with `/api/assess` and fallback scoring.
  - `interviewPrompt.js` — prompt templates for Maya and transcript assessment.

## Local Setup

### Backend

```bash
cd backend
npm install
```

Create a `.env` file with your Gemini API key (optional):

```env
GEMINI_API_KEY=your_api_key_here
```

Start the backend:

```bash
npm start
```

The backend listens on port `3001` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local app at `http://localhost:5173`.

## Production Build

```bash
cd frontend
npm run build
npm run preview
```

## Deployment Notes

- Frontend is deployed at: `https://maya-interview-ai-frontend.onrender.com`
- The frontend is configured to send transcripts to the backend URL hard-coded in `frontend/src/Interview.jsx`.
- If you deploy the backend separately, make sure the backend CORS whitelist includes your frontend origin.

## Environment Variables

- `GEMINI_API_KEY` — optional key used by `@google/generative-ai` for transcript assessment.

If Gemini is unavailable or returns invalid JSON, the backend falls back to a built-in transcript analysis function for evaluation.

## Usage Flow

1. Candidate opens the frontend.
2. Candidate starts the voice interview with Maya.
3. The conversation transcript is captured and sent to the backend.
4. The backend returns an assessment object.
5. The app displays a recommendation report.

## Notes

- The app is optimized for a short 8–10 minute screening conversation.
- Transcripts are evaluated on communication clarity, warmth, patience, simplification ability, and English fluency.
- The frontend uses a public VAPI key and assistant ID to power the voice interview experience.
