# Skills & Architecture Reference: Gamified Daily To-Do & Routines App

## 1. Project Overview & Architecture
This project is an offline-first, lightweight, gamified mobile task & routine tracking application built with **React 19 + TypeScript + Vite + Tailwind CSS** and packaged natively via **Capacitor.js** for Android.

- **Platform & Runtime:** Android (API 24+) via Capacitor native shell (`@capacitor/android`, `@capacitor/core`, `@capacitor/cli`).
- **Local Notifications:** Client-side scheduling via `@capacitor/local-notifications` utilizing Android’s native `AlarmManager`. Zero backend/push servers needed.
- **Data Persistence:** Pure offline on-device storage with JSON serialization (`localStorage`), separating active tasks, recurring routines, and historical archives.
- **CI/CD Cloud Build:** Automated compilation to installable Android `.apk` via **GitHub Actions** (`ubuntu-latest` running Temurin JDK 17).

---

## 2. Gamification & Motivation Engine (Game Strategies & Tactics)

To create a powerful habit loop that maximizes engagement and dopamine release:

### A. Core Progression & Stats
1. **XP (Experience Points) & Level System:**
   - Normal task completion: **+25 XP**
   - Routine task completion: **+35 XP**
   - Completing a streak day or daily quest: **+50 XP**
   - Dynamic Level scaling: `Level = Math.floor(Math.sqrt(XP / 50)) + 1` with progress bar toward next level.
2. **Streak Counter (🔥 Fire Streak):**
   - Tracks consecutive days with at least 1 completed task.
   - Streak protection and bonus multiplier for multi-day streaks.
3. **Gold Coins (🪙 Currency System):**
   - Earned alongside XP (+10 coins per task, +15 coins per routine).
   - Spendable in a **Rewards Vault** (e.g. create custom real-world rewards like "1 Hr Gaming", "Movie Night", "Guilt-free Break", or unlock badge titles).
4. **Challenges & Quests:**
   - Daily quests (e.g., "Complete 3 tasks today", "Conquer a routine", "Morning Warrior").
   - Custom challenges created by the user with deadlines and coin/XP payouts.

### B. Visceral Strike Satisfaction (The Dopamine Hit)
- **Instant Audio Feedback:** Web Audio API synthesized chimes (crystal ping, retro coin chime, level-up fanfare) requiring 0 audio files.
- **Visual Explosion:** Confetti and sparkling particle burst on task completion.
- **Floating Reward Floating HUD:** Instant floating numbers (`+25 XP`, `+10 🪙`) bouncing up from the completed item.
- **Card Haptic Feel:** Satisfying checkbox scale-bounce, gradient stroke animation, and smooth strike-through.

---

## 3. Recurring Routines Engine

Supports tasks that repeat at structured intervals:
- **Interval Types:** `hourly`, `daily`, `weekly`, or custom interval hours/days.
- **Auto-Reset & Scheduling:**
  - When marked done, routine awards immediate XP and coins, records completion in history, and calculates the next scheduled due time (`nextDueAt`).
  - Dedicated Routines tab / section to keep daily one-off to-dos distinct from perpetual habit routines.

---

## 4. Engaging Game Color Palette

- **Canvas Background:** Deep Space Obsidian (`#090d16` / `#050811`)
- **Primary XP & Mystic:** Electric Violet / Cyberpunk Neon (`#8B5CF6`, `#A855F7`, `#7C3AED`)
- **Rewards & Coins:** Radiant Gold / Amber (`#F59E0B`, `#FBBF24`, `#FFD700`)
- **Energy & Routines:** Neon Cyan / Aqua (`#06B6D4`, `#22D3EE`, `#00F0FF`)
- **Success & Striking:** Vivid Emerald (`#10B981`, `#34D399`)
- **Streaks & Overdue:** Blaze Orange / Flame (`#F97316`, `#EF4444`)

---

## 5. Technical Specifications & Directory Structure

```text
todo-capacitor-app/
├── .github/
│   └── workflows/
│       └── build-apk.yml       # Cloud APK compilation pipeline
├── src/
│   ├── components/
│   │   ├── TaskInput.tsx       # Form to add title, time, routines & rewards
│   │   ├── TaskList.tsx        # Render list of tasks with toggle/delete/missed days
│   │   ├── RoutineList.tsx     # Repeating interval routines manager
│   │   ├── GameStatsHeader.tsx # Level, XP bar, Coins, and Fire Streak HUD
│   │   ├── QuestsModal.tsx     # Challenges, daily quests & rewards vault
│   │   ├── HistoryModal.tsx    # Searchable archive & JSON export
│   │   └── SettingsModal.tsx   # Daily review time, permissions & sound toggles
│   ├── services/
│   │   ├── storage.ts          # LocalStorage CRUD helpers for tasks, routines & user profile
│   │   ├── sound.ts            # Web Audio API procedural sound synthesizer (coins, fanfare)
│   │   ├── notifications.ts    # Capacitor notification scheduler
│   │   └── gamification.ts     # XP calculations, levels, quests & streaks
│   ├── types/
│   │   └── index.ts            # Task, Routine, Quest, Reward, and UserProfile models
│   ├── App.tsx                 # Main application view with tab navigation
│   ├── main.tsx                # Entrypoint
│   └── index.css               # Tailwind CSS directives & game glow animations
├── capacitor.config.ts         # Capacitor project configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind styling rules
├── package.json
└── tsconfig.json
```
