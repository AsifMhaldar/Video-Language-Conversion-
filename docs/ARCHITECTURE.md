# 🏛 Enterprise System Architecture Document (MNC Standards)

## 1. System Overview

VideoLang AI is an asynchronous video dubbing platform that translates video speech into 50+ languages while preserving natural cadence, generating synthetic voiceovers, burning synchronized subtitle captions, and remuxing high-definition media.

The architecture is divided into three distinct, decoupled tiers:
1. **Presentation Tier (`client/`)**: High-performance Single Page Application (SPA) built with React 19, Vite, Tailwind CSS v4, and Framer Motion.
2. **Orchestration & Business Logic Tier (`server/`)**: Secure REST API built with Node.js, Express, MongoDB Atlas, and Cloudinary CDN.
3. **Media & AI Processing Tier (`ai-engine/`)**: Python-based pipeline integrating OpenAI Whisper, Neural Machine Translation, Google Text-to-Speech (gTTS), and MoviePy video compositing.

---

## 2. Decoupled Service Topology

```
+-------------------------------------------------------------+
|                      Client (Web App)                       |
|  - React 19 / Vite SPA                                      |
|  - SaaS Dashboard, Video Studio & Player                    |
|  - Real-time Polling Engine                                 |
+------------------------------+------------------------------+
                               | HTTPS / JSON
                               v
+-------------------------------------------------------------+
|                     Server (Node.js API)                    |
|  - Auth & JWT Middleware                                    |
|  - Video Ingestion & Metadata (MongoDB Atlas)               |
|  - Pipeline Orchestration & Memory Cache                    |
+--------------+-------------------------------+--------------+
               |                               |
    Asset Sync | Cloudinary CDN     Subprocess | JSON Contract
               v                               v
+------------------------------+ +----------------------------+
|       Cloud Storage          | |      AI Engine (Python)    |
|  - Raw & Dubbed Videos       | |  1. Audio Extraction       |
|  - Thumbnails                | |  2. Whisper STT            |
|  - Audio Tracks              | |  3. Neural Translation     |
|                              | |  4. TTS Speech Synthesis   |
|                              | |  5. Subtitle Rendering     |
|                              | |  6. Media Remuxing         |
+------------------------------+ +----------------------------+
```

---

## 3. Design Principles Applied

### A. Separation of Concerns (SoC)
- Frontend handles purely visual presentation, responsive layout, state management, and user interactions.
- Backend owns validation, data persistence, and pipeline job dispatch.
- AI Engine is dedicated strictly to compute-intensive speech processing and video rendering.

### B. Resilience & Fallback Tolerance
- If Cloudinary or video thumbnails are inaccessible or slow to resolve, the UI implements an automated CSS gradient film card fallback, ensuring zero UI layout shifts or broken-image icons.
- Subprocess communication uses sanitized JSON parsing over stdout/stderr to prevent pipeline silent failures.

### C. Scalability & Extensibility
- Standardized directory layout enables teams to containerize `client`, `server`, and `ai-engine` with independent Dockerfiles or deploy `ai-engine` as a standalone GPU worker pool (e.g. Celery / Redis queue) without altering client contracts.

---

## 4. REST API Endpoint Contracts

| Method | Endpoint | Description | Protected |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | No |
| `GET` | `/api/auth/profile` | Retrieve authenticated user profile | Yes |
| `GET` | `/api/videos` | Fetch all videos uploaded by user | Yes |
| `POST` | `/api/videos/upload` | Upload new video file (multipart) | Yes |
| `DELETE`| `/api/videos/:id` | Delete video & Cloudinary asset | Yes |
| `POST` | `/api/conversions/convert` | Dispatch AI dubbing pipeline job | Yes |
| `GET` | `/api/conversions/:id` | Poll pipeline status & progress % | Yes |
