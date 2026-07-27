# Najikko Sathi

Najikko Sathi is a mobile-first home services companion for Nepal that helps users diagnose household problems, connect with trusted service providers, track repairs, and stay on top of routine maintenance — all through a polished React and Capacitor experience.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express)
![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?logo=capacitor)
![Android](https://img.shields.io/badge/Android-Ready-3DDC84?logo=android)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Enabled-8E75F5?logo=google)

## Why this project exists

Najikko Sathi combines a friendly user experience with practical home-service workflows for everyday problems such as plumbing issues, electrical concerns, appliance maintenance, and general repairs. The app is designed to feel local, helpful, and fast for users in Nepal.

## Key features

- AI-powered diagnostics for household issues
- Multi-language support in English and Nepali
- Booking flow for service categories and technicians
- Live job tracking and status updates
- Customer support and in-app notifications
- Routine maintenance reminders for common appliances

## Tech stack

- Frontend: React, TypeScript, Vite, Tailwind-inspired UI components
- Backend: Express server with API routes
- Mobile packaging: Capacitor for Android
- AI integration: Google Gemini API
- Runtime: Node.js

## Quick start

### Prerequisites

- Node.js 18+ and npm
- A valid Gemini API key for the AI diagnostics features

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy the example environment file and update it with your own values:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
copy .env.example .env
```

Then edit the file and set at least:

- `GEMINI_API_KEY` for the AI diagnosis routes
- `GOOGLE_MAPS_PLATFORM_KEY` if you plan to use map-based features

### 3) Run the app locally

```bash
npm run dev
```

The web app will be available at http://localhost:3000.

### 4) Build for Android (optional)

```bash
npm run build
npx cap sync android
npx cap open android
```

## Project structure

```text
android/            # Capacitor Android project
assets/             # Static app assets
server.ts           # Express server and AI API routes
src/
  components/       # UI screens and feature modules
  data.ts           # Seed content and service data
  types.ts          # Shared TypeScript types
capacitor.config.ts # Capacitor app configuration
vite.config.ts      # Vite configuration
```

## Contributing

Contributions are welcome. If you would like to improve the experience, please open an issue or submit a pull request with a clear description of the change.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
