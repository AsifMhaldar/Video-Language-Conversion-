# VideoLang AI - Project Overview

## What is VideoLang AI?

VideoLang AI is a **video language translation and dubbing platform**. Users upload a video, pick a target language, and the system automatically:

1. Extracts audio from the video
2. Transcribes the audio to text
3. Detects the source language
4. Translates the text to the target language
5. Generates dubbed audio via Text-to-Speech
6. Merges the translated audio back into the video
7. Uploads the final result to Cloudinary

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 7 + Tailwind CSS 4 |
| **Backend** | Node.js + Express 5 |
| **Database** | MongoDB (Mongoose 9) |
| **Cloud Storage** | Cloudinary |
| **Auth** | JWT + bcrypt (httpOnly cookie) |
| **File Upload** | Multer (disk storage, 100MB limit) |
| **Video Processing** | Python 3.11 (MoviePy, FFmpeg, gTTS, googletrans) |
| **Transcription** | OpenAI Whisper API |
| **Linting** | ESLint 9 (flat config, react-hooks v7) |
| **Build/Dev** | Vite, nodemon |

## Project Structure

```
VideoLangConver/
├── docs/                              # Documentation (this folder)
├── Backend/                           # Node.js backend
│   ├── .env                           # Environment variables (see .env.example)
│   ├── .env.example                   # Template for required env vars
│   ├── package.json                   # Backend dependencies + start/dev scripts
│   ├── temp/                          # Temporary files during conversion (gitignored)
│   └── src/
│       ├── server.js                  # Entry: validates env, connects DB, starts app
│       ├── app.js                     # Express app: CORS, parsers, routes, error handler
│       ├── config/
│       │   ├── db.js                  # connectDB() mongoose helper
│       │   ├── cloudinary.js          # Cloudinary SDK config
│       │   └── redisDb.js             # Redis client (currently DISABLED/commented out)
│       ├── constants/
│       │   └── index.js               # Shared constants (temp dir, allowed origins, languages)
│       ├── routes/
│       │   ├── auth.routes.js         # /user routes
│       │   ├── video.routes.js        # /api/videos routes
│       │   └── conversion.routes.js   # /api/conversions routes
│       ├── controllers/
│       │   ├── auth.controller.js     # register / login / logout
│       │   ├── video.controller.js    # upload / list / get / update / delete
│       │   └── conversion.controller.js # convert / status
│       ├── services/
│       │   ├── conversionPipeline.service.js  # 9-step pipeline orchestration
│       │   ├── pythonRunner.service.js        # child_process wrapper for Python scripts
│       │   └── cloudinary.service.js          # All Cloudinary operations
│       ├── middlewares/
│       │   ├── auth.middleware.js     # Cookie-JWT verification -> req.user
│       │   ├── upload.middleware.js   # Multer disk storage config
│       │   └── error.middleware.js    # Central JSON error handler (last middleware)
│       ├── models/
│       │   ├── user.model.js
│       │   ├── video.model.js
│       │   └── conversion.model.js
│       ├── utils/
│       │   ├── ApiError.js            # Operational error class
│       │   ├── validators.js          # Signup field validation helpers
│       │   └── dbValidatorHelpers.js  # Legacy regex helpers
│       └── python/
│           ├── extract_audio.py
│           ├── audio_to_text.py       # Normalizes Whisper language names -> ISO codes
│           ├── translate_text.py
│           ├── text_to_speech.py      # Maps zh -> zh-CN for gTTS
│           ├── add_captions.py
│           └── merge_audio_video.py
└── VideoLangConver/                   # React frontend
    ├── .env.example                   # Template (VITE_API_URL)
    ├── eslint.config.js               # ESLint flat config
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                   # React entry
        ├── App.jsx                    # Routes
        ├── index.css                  # Global styles
        ├── api/
        │   ├── client.js              # Axios instance (VITE_API_URL, withCredentials)
        │   ├── auth.api.js            # register / login / logout calls
        │   ├── video.api.js           # upload / list / get / update / delete calls
        │   └── conversion.api.js      # convert / status calls
        ├── context/
        │   └── AuthContext.jsx        # Auth state (lazy-persisted user in localStorage)
        ├── constants/
        │   └── languages.js           # Shared 16-language list
        ├── utils/
        │   └── format.js              # formatFileSize / formatDate
        ├── pages/
        │   ├── Landings.jsx
        │   ├── SignUp.jsx
        │   ├── SignIn.jsx
        │   ├── Dashboard.jsx
        │   ├── LanguageConverter.jsx
        │   └── VideoHistory.jsx
        └── components/
            └── VideoUpload.jsx
```

## Supported Languages (16)

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Bengali, Telugu, Marathi, Tamil

## How It Works (High Level)

```
User uploads video
        │
        ▼
Video stored on Cloudinary
        │
        ▼
User selects target language
        │
        ▼
Backend kicks off pipeline (Python scripts via pythonRunner service):
  1. Download video from Cloudinary
  2. Extract audio (MoviePy)
  3. Transcribe audio (OpenAI Whisper API)
  4. Auto-detect source language
  5. Translate text (googletrans)
  6. Generate TTS audio (gTTS)
  7. Merge new audio into video (MoviePy)
  8. Upload result to Cloudinary
        │
        ▼
Frontend polls status every 2 seconds
        │
        ▼
User sees completed video
```

## Quick Start

### Backend
```bash
cd Backend
npm install
copy .env.example .env    # then fill in values
npm run dev               # nodemon src/server.js
```

### Frontend
```bash
cd VideoLangConver
npm install
copy .env.example .env    # set VITE_API_URL=http://localhost:3000
npm run dev
npm run lint              # ESLint check
```

### Python Dependencies
```bash
pip install moviepy gTTS googletrans==4.0.0-rc1 requests numpy python-dotenv
```

## Environment Variables (.env)

Backend (`Backend/.env`, see `Backend/.env.example`):

| Variable | Description |
|----------|------------|
| `PORT` | Server port (default: 3000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for JWT signing (**required** - server refuses to start without it) |
| `CORS_ORIGIN` | Allowed browser origin (default: http://localhost:5173) |
| `PYTHON_BIN` | Python executable used by the pipeline (default: `python`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `OPENAI_API_KEY` | OpenAI API key (for Whisper transcription) |

Frontend (`VideoLangConver/.env`, see `VideoLangConver/.env.example`):

| Variable | Description |
|----------|------------|
| `VITE_API_URL` | Backend base URL (default: http://localhost:3000) |

## Conventions

- **All API responses are JSON**: success shape `{ success: true, message?, data? }`, error shape `{ success: false, message }`.
- **Auth is cookie-based**: backend sets an httpOnly `token` cookie; frontend uses `withCredentials: true`. No Authorization headers.
- **Errors are thrown as `ApiError`** from controllers/services and handled by the central error middleware.

## Key Documentation Files

- [BACKEND.md](./BACKEND.md) - Server setup, routes, models, middleware, services
- [FRONTEND.md](./FRONTEND.md) - React pages, components, context, API layer
- [CONVERSION_PIPELINE.md](./CONVERSION_PIPELINE.md) - Python scripts and processing flow
- [API_REFERENCE.md](./API_REFERENCE.md) - All API endpoints
