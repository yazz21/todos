# Daily To-Do App with Capacitor & Cloud CI Build

## 1. Project Overview & Architecture
This project is an offline-first, lightweight mobile To-Do application built using modern web technologies (Vite + React + Tailwind CSS) and wrapped with **Capacitor.js**.

- **Runtime & Platform:** Android (via Capacitor native shell).
- **Local Notifications:** Handled client-side via `@capacitor/local-notifications` utilizing Android’s native `AlarmManager`. No backend, external push service, or API server is required.
- **Data Persistence:** LocalStorage / IndexedDB (purely on-device) or sqlite.
- **Tooling & Build:** Built and orchestrated inside **Google Antigravity IDE**. Compiled into an installable Android `.apk` via **GitHub Actions**—eliminating the need for a local Android Studio, Gradle, or Android SDK setup.

---

## 2. Technical Specifications

| Component | Choice |
| :--- | :--- |
| **Language & Framework** | TypeScript, React 19 / 18, Vite |
| **Styling** | Tailwind CSS (mobile-first layout, touch targets $\ge$ 48px) |
| **Mobile Runtime** | `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` |
| **Notification Engine** | `@capacitor/local-notifications` |
| **Build Target** | Android API 24+ (Android 7.0 through Android 15+) |
| **CI/CD Pipeline** | GitHub Actions (`ubuntu-latest` running Temurin JDK 17) |

---

## 3. Directory Structure

```text
todo-capacitor-app/
├── .github/
│   └── workflows/
│       └── build-apk.yml       # Cloud APK compilation pipeline
├── src/
│   ├── components/
│   │   ├── TaskInput.tsx       # Form to add title and target time
│   │   ├── TaskList.tsx        # Render list of tasks with toggle/delete
│   │   └── SettingsModal.tsx   # Configure recurring daily review time
│   ├── services/
│   │   ├── storage.ts          # LocalStorage CRUD helpers
│   │   └── notifications.ts    # Capacitor notification scheduler
│   ├── types/
│   │   └── index.ts            # Task and Notification models
│   ├── App.tsx                 # Main application view
│   ├── main.tsx                # Entrypoint
│   └── index.css               # Tailwind CSS directives
├── capacitor.config.ts         # Capacitor project configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind styling rules
├── package.json
└── tsconfig.json