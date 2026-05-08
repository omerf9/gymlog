# Gym Log — AI-Powered Workout Tracker

> Track your workouts, monitor progression, and get personalized AI coaching — all in one app.

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18-blue) ![AI](https://img.shields.io/badge/AI-Claude%20Vision-orange)

**🔗 Live Demo: [gymlog-orcin-psi.vercel.app](https://gymlog-orcin-psi.vercel.app)**

---

## What It Does

Gym Log is a full-featured AI fitness tracking app built as a progressive web app (PWA). It combines workout logging with AI-powered coaching, physique analysis, and progression tracking — all running in the browser with no backend required.

---

## Features

### 📋 Workout Logging
- Pre-loaded 7-day Push/Pull/Legs/Shoulders/Accessory split
- Log sets, reps, and weight for every exercise
- Daily step counter
- Visual completion tracking per exercise

### 📈 Progress Tracking
- Week-over-week weight progression charts per exercise
- Plateau detection — flags exercises with no weight increase
- Weekly volume totals (sets, reps, steps)
- Historical data across multiple weeks

### 🤖 AI Coach
- Weekly workout analysis powered by Claude AI
- Specific recommendations for next week's training
- Personalized calorie and macro targets based on body weight and goal
- Goal-based coaching (muscle gain, fat loss, recomp)

### 📸 Physique Tracker
- Weekly check-ins with front, side, and back photo uploads
- AI physique analysis — body fat estimate, muscle imbalances, posture assessment
- Monthly progression reports comparing all weekly check-ins
- Bodyweight trend tracking with visual chart

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| AI | Anthropic Claude (Vision + Text) |
| Storage | Browser localStorage |
| Deploy | Vercel |

---

## Architecture

This app runs entirely client-side — no backend server required. All workout data is stored in `localStorage` and persists across sessions. AI features call the Anthropic API directly from the browser.

```
User Action → React State
           → localStorage (persistence)
           → Anthropic API (AI features)
           → UI Update
```

---

## Local Development

### Prerequisites
- Node.js 18+

```bash
npm install
npm run dev
```

---

## Project Structure

```
gymlog/
├── src/
│   ├── App.jsx        # Full application (single-file architecture)
│   └── main.jsx       # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## Key Technical Concepts

- **RAG-adjacent architecture** — AI coach receives structured workout data as context before generating recommendations
- **Vision AI** — Claude's multimodal capabilities used for physique photo analysis
- **Progressive Web App** — installable on mobile home screen, works offline for logging
- **Client-side persistence** — localStorage used as a lightweight database

---

## Screenshots

> Workout logging, progress charts, AI coaching, and physique tracking — all in one dark, minimal UI.

---

## Built By

**Omer Yousif** — Software Engineering & AI Student

- GitHub: [@omerf9](https://github.com/omerf9)
