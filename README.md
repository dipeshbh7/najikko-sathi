# Najik ko Sathi

*नजिकको साथी — your nearby companion for home repairs in Nepal.*

Najik ko Sathi is a mobile-first React + Capacitor app that lets users get an AI-generated diagnosis of a household problem from a photo, book a matching technician (electrician, plumber, handyman, pest control, home care, or general consultation), and track the job through to completion — with full English/Nepali bilingual support throughout.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor)

## Overview

The app is a single-page React client served by a small Express server. The server also exposes two API routes that call the Gemini API to analyze photos of household issues — one for initial diagnosis, one for verifying finished repair work. If no Gemini API key is configured, both routes fall back to a set of realistic canned responses so the app stays fully usable in a demo environment.

Everything else — bookings, technician assignment, job tracking, notifications — runs on local component state with seeded mock data (`src/data.ts`). There is no persistence layer or real backend for these features; a page refresh resets the session.

## Screenshots

No screenshots are currently committed to this repository. Add images to an `app_ss/` (or `screenshots/`) folder and reference them here, for example:

```markdown
| Home | Booking | AI Sathi |
|------|---------|----------|
| ![Home](app_ss/home.png) | ![Booking](app_ss/booking.png) | ![AI Sathi](app_ss/ai-sathi.png) |
```

## Features

- **AI Sathi diagnostics** — capture or upload a photo of a household issue; the backend calls Gemini (`gemini-3.5-flash`) to return a structured diagnosis: problem description, estimated cost in NPR, recommended technician category, severity, and immediate mitigation steps
- **Graceful AI fallback** — if `GEMINI_API_KEY` is missing or the API call fails, the server returns high-quality mock diagnostics for common presets (leaky tap, exposed wire, broken AC, termite damage) so the flow never breaks
- **Service booking** — six service categories (Electrician, Plumber, Handyman, Pest Control, Home Care, Consultation) with a manual booking form and automatic technician assignment from a seeded provider list
- **Job tracking** — a tracking screen with a live Google Map, simulated technician movement, ETA, and job status progression (Dispatched → Arriving → Arrived → In Progress → Completed)
- **Bilingual UI** — full English and Nepali translations across onboarding, auth, booking, tracking, and support screens, with a persistent language toggle
- **In-app customer support** — a scripted chat assistant with keyword-based canned responses, plus a call-support entry point
- **Maintenance reminders** — a simulated notification (e.g. geyser servicing due) is triggered client-side after login to demonstrate the reminder flow
- **Onboarding & auth screens** — splash screen, onboarding carousel, and a login/signup UI (client-side only — no backend authentication or persistence)

## Not yet implemented

- Real user authentication and account persistence
- A `/api/verify-repair` endpoint exists on the server (Gemini-based repair quality check) but is not yet wired into any UI screen
- Real-time technician location (tracking currently uses simulated coordinates)
- Push notifications (the in-app reminder is simulated, not device-level)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4, Framer Motion (`motion`), Lucide icons |
| Backend | Express 4 (serves the Vite app and two API routes), `tsx` for dev, `esbuild` for the production server bundle |
| AI | Google Gemini API via `@google/genai` |
| Maps | Google Maps via `@vis.gl/react-google-maps` |
| Mobile | Capacitor 8 (Android) |

## Project structure

```text
najik-ko-sathi/
├── android/                  # Capacitor Android native project
├── assets/                   # AI Studio project metadata (not app assets)
├── src/
│   ├── assets/images/        # App images and splash logo
│   ├── components/
│   │   ├── AuthView.tsx          # Login / signup UI (client-side only)
│   │   ├── HomeView.tsx          # Service category grid, entry to booking
│   │   ├── BookingsView.tsx      # Manual booking form + booking list
│   │   ├── TrackingView.tsx      # Google Map job tracking + status timeline
│   │   ├── FixitAI.tsx           # Camera capture → AI diagnosis flow
│   │   ├── CustomerSupport.tsx   # Scripted support chat + call entry point
│   │   ├── NavigationSidebar.tsx
│   │   └── OnboardingView.tsx
│   ├── App.tsx                # Root component, view routing, app state
│   ├── data.ts                 # Seeded categories, providers, translations
│   ├── types.ts                 # Shared TypeScript types
│   └── main.tsx
├── server.ts                  # Express server: static/Vite serving + Gemini API routes
├── capacitor.config.ts
├── vite.config.ts
└── .env.example
```

## Installation & setup

### Prerequisites

- Node.js and npm
- A Gemini API key (optional — the app runs in fallback mode without one)
- A Google Maps Platform API key (optional — used by the tracking screen)

### Setup

```bash
git clone <repo-url>
cd najik-ko-sathi
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values you have:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Enables live AI diagnostics via Gemini. Without it, the server returns mock diagnostic data. |
| `APP_URL` | URL the app is hosted at (used for self-referential links). |
| `GOOGLE_MAPS_PLATFORM_KEY` | Google Maps Platform key used by the job-tracking map. |

## Development

```bash
npm run dev     # Starts the Express server (via tsx) with Vite in middleware mode
```

The app runs at `http://localhost:3000`.

## Build & production

```bash
npm run build   # Builds the client with Vite and bundles server.ts with esbuild
npm run start   # Runs the production server bundle (dist/server.cjs)
npm run lint     # Type-checks the project with tsc --noEmit
npm run clean    # Removes build output
```

## Android / Capacitor

The `android/` native project is already part of the repository (`appId: com.najikkosathi.app`). After building the web app:

```bash
npm run build
npx cap sync android
npx cap open android
```

This opens the project in Android Studio, where you can run it on a device/emulator or build a signed APK/AAB through the standard Android build tooling.

## Roadmap

- [ ] Wire up the existing `/api/verify-repair` endpoint to a UI flow
- [ ] Real backend authentication and booking persistence
- [ ] Live technician location tracking
- [ ] Device push notifications for maintenance reminders

## Contributing

Issues and pull requests are welcome. Please describe the change and the reasoning behind it clearly.

## License

MIT — see [LICENSE](LICENSE).