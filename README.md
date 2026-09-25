# 🌐 VideoLang AI — Enterprise Video Dubbing Platform

> High-throughput, distributed AI video language dubbing and subtitle burning platform built with modular, enterprise-grade architecture.

---

## 🏛 System Architecture

The platform follows a **Clean Modular 3-Tier Architecture** inspired by large-scale enterprise media processing services:

```mermaid
graph TD
    A[Client Web App\nReact 19 + Vite] -->|REST API / JWT| B[API Gateway & Server\nNode.js + Express]
    B -->|Metadata & Auth| C[(MongoDB Atlas)]
    B -->|Media Storage| D[Cloudinary CDN]
    B -->|Child Process / Worker| E[AI Processing Engine\nPython Pipeline]
    
    subgraph AI Dubbing Pipeline
        E --> E1[1. Audio Extraction\nMoviePy / FFmpeg]
        E1 --> E2[2. Speech-to-Text\nLocal Whisper Model (Offline / Free)]
        E2 --> E3[3. Neural Translation\nMulti-language NLP]
        E3 --> E4[4. Voice Synthesis\ngTTS / Neural TTS]
        E4 --> E5[5. Subtitle Synchronization\nDynamic TextClip]
        E5 --> E6[6. Audio/Video Remuxing\nMoviePy Compositor]
    end

    E6 -->|Dubbed MP4| D
```

---

## 📁 Enterprise Folder Structure (MNC Standard)

```
VideoLangConver/                              # Workspace Root
├── client/                                  # Presentation Tier (React 19 + Vite)
│   ├── public/                              # Static public assets & icons
│   ├── src/
│   │   ├── api/                             # Centralized Axios API client & interceptors
│   │   ├── components/                      # UI Design System Primitives
│   │   │   ├── Sidebar.jsx                  # Persistent SaaS navigation shell
│   │   │   ├── VideoPlayerModal.jsx         # In-app media playback & actions
│   │   │   └── VideoUpload.jsx              # Drag-and-drop chunked upload modal
│   │   ├── constants/                       # Language ISO codes, status constants
│   │   ├── context/                         # AuthContext & global state providers
│   │   ├── pages/                           # Application route views
│   │   │   ├── Landings.jsx                 # Marketing & feature showcase
│   │   │   ├── SignIn.jsx / SignUp.jsx      # Authentication & session creation
│   │   │   ├── Dashboard.jsx                # Studio overview, metrics & video cards
│   │   │   ├── LanguageConverter.jsx        # 3-step AI dubbing wizard
│   │   │   └── VideoHistory.jsx             # Video library, status & export
│   │   ├── utils/                           # Byte sizing, relative time formatters
│   │   ├── App.jsx                          # Route provider & layout orchestration
│   │   ├── index.css                        # Tailwind CSS v4 design tokens
│   │   └── main.jsx                         # React root entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                                  # Orchestration & API Tier (Node.js/Express)
│   ├── src/
│   │   ├── config/                          # DB connection, Cloudinary singletons, env
│   │   ├── constants/                       # Enums, HTTP error codes, supported languages
│   │   ├── controllers/                     # HTTP Request handlers & input validation
│   │   │   ├── auth.controller.js           # User registration, login, JWT issuance
│   │   │   ├── video.controller.js          # Video CRUD & upload handling
│   │   │   └── conversion.controller.js     # Dubbing job dispatch & status polling
│   │   ├── middlewares/                     # Security, Auth token, Multer, Error handlers
│   │   ├── models/                          # Mongoose Database Schemas
│   │   │   ├── user.model.js                # User identity & credentials
│   │   │   ├── video.model.js               # Uploaded video metadata & Cloudinary assets
│   │   │   └── conversion.model.js          # Conversion jobs, progress & output URLs
│   │   ├── routes/                          # Express REST API routes
│   │   ├── services/                        # Business domain logic
│   │   │   ├── cloudinary.service.js        # Media cloud storage operations
│   │   │   ├── conversionPipeline.service.js# Pipeline coordinator & memory cache
│   │   │   └── pythonRunner.service.js      # Subprocess execution & JSON bridge
│   │   ├── utils/                           # Custom ApiError, response wrappers
│   │   ├── app.js                           # Express application configuration
│   │   └── server.js                        # HTTP server bootstrap & lifecycle
│   ├── uploads/                             # Temp upload staging buffer
│   ├── temp/                                # Job workspace directory
│   ├── .env.example                         # Environment variable definitions
│   └── package.json
│
├── ai-engine/                               # Core AI Media Processing Tier (Python)
│   ├── extract_audio.py                     # Demuxes audio track from input MP4
│   ├── audio_to_text.py                     # Whisper STT speech transcription
│   ├── translate_text.py                    # Multi-language neural translation
│   ├── text_to_speech.py                    # Voiceover generation & TTS audio synthesis
│   ├── add_captions.py                      # Subtitle burn-in & caption rendering
│   ├── merge_audio_video.py                 # Final audio/video synchronization & remux
│   └── requirements.txt                     # Python deep learning dependencies
│
├── docs/                                    # Technical Documentation & Specs
│   ├── PROJECT_OVERVIEW.md                  # System design & feature overview
│   ├── ARCHITECTURE.md                      # MNC enterprise architecture guide
│   ├── CONVERSION_PIPELINE.md               # Pipeline execution flow & stages
│   ├── BACKEND.md                           # Backend services & database models
│   ├── FRONTEND.md                          # Frontend architecture & state flow
│   └── API_REFERENCE.md                     # Comprehensive REST API specifications
│
├── .editorconfig                            # Multi-developer formatting standards
├── .gitignore                               # Enterprise git ignore policy
└── package.json                             # Monorepo root workspace orchestration
```

---

## 🚀 Quick Start Guide

### 1. Unified Root Commands

From the project root:

```bash
# Start Client (Frontend)
npm run dev:client

# Start Server (Backend)
npm run dev:server

# Build Client for Production
npm run build:client
```

### 2. Service-Specific Setup

#### Backend (`server/`):
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

#### Frontend (`client/`):
```bash
cd client
npm install
npm run dev
```

#### AI Engine (`ai-engine/`):
```bash
cd ai-engine
pip install -r requirements.txt
```

---

## 🔒 Security & Best Practices

- **Zero-Trust Token Auth**: JWTs validated on every secured endpoint.
- **Robust Subprocess Isolation**: Node orchestrates Python scripts through strict JSON STDIN/STDOUT contracts with stderr sanitization.
- **Fail-Safe Client Media**: Fallback gradient film thumbnails eliminate broken-image flashes across the dashboard.
- **Graceful Error Handling**: Centralized `ApiError` class with standardized HTTP response envelopes.
