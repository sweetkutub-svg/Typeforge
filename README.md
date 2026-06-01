# TypeForge ⌨️

Adaptive touch typing learning platform — VSCode × Duolingo aesthetic.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase credentials (optional — app works offline too)
npm run dev
```

Open http://localhost:3000

## Features

- 5 Progressive lessons (Home Row → Full Keyboard)
- Adaptive engine — weak keys appear 3× more
- 60-second live typing sessions
- Live WPM, Accuracy & Timer
- XP + Level system
- Streak tracker
- 5 Badges to earn
- Keyboard heatmap
- Session history
- WPM over time chart
- Export report as PNG
- Guest mode (localStorage) + optional Supabase auth

## Supabase Setup (Optional)

1. Create a free project at https://app.supabase.com
2. Go to SQL Editor → paste contents of `supabase_schema.sql` → Run
3. Copy your Project URL and anon key into `.env.local`

Without Supabase, all progress is saved in localStorage automatically.

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Add your environment variables in the Vercel dashboard under Settings → Environment Variables.

## File Structure

```
src/
  components/
    Keyboard.jsx       — SVG keyboard with finger colors + key highlighting
    TypingArea.jsx     — Word display with color feedback
    StatsBar.jsx       — WPM / Accuracy / Timer bar
    LessonCard.jsx     — Lesson map node card
    BadgeCard.jsx      — Badge display
    ResultScreen.jsx   — End session screen with confetti
    AuthModal.jsx      — Login/Signup/Guest modal
    KeyboardHeatmap.jsx — Per-key accuracy heatmap
    Navbar.jsx         — Top navigation
  hooks/
    useTyping.js       — Core typing logic + WPM calc
    useProgress.js     — XP, streaks, badges, localStorage
  lib/
    adaptive.js        — Lesson data + word generation + key stats
    xp.js             — XP formula, level calc, badge definitions
    supabase.js       — Supabase client
  pages/
    index.jsx          — Landing page
    lessons.jsx        — Lesson map
    practice/[id].jsx  — Pre-lesson + typing session + results
    dashboard.jsx      — Analytics dashboard
    api/
      progress.js      — Progress API route
      auth.js          — Auth API route
```

## Lesson Targets

| # | Name | WPM | Accuracy |
|---|------|-----|----------|
| 1 | Home Row | 15 | 90% |
| 2 | Top Row | 20 | 90% |
| 3 | Bottom Row | 20 | 90% |
| 4 | Full Keyboard Words | 25 | 90% |
| 5 | Sentences + Punctuation | 30 | 92% |
