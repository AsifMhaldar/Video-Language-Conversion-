# Backend Architecture

## Entry Point

### src/server.js
1. Validates required env vars (MONGODB_URI, JWT_SECRET) - exits early with a clear message if missing
2. Awaits `connectDB()` before accepting traffic
3. Imports the Express app and listens on `process.env.PORT`

### src/app.js
Express app configuration:
1. CORS (origin from `CORS_ORIGIN` env, default http://localhost:5173, credentials enabled)
2. JSON + urlencoded body parsing
3. Cookie parsing
4. Creates uploads/ directory if missing
5. Mounts route groups: `/user`, `/api/videos`, `/api/conversions`
6. 404 catch-all returning `{ success: false, message }`
7. Central error middleware (last) - always returns JSON

Redis connection code exists in config/redisDb.js but is currently disabled.

## Models

### User (models/user.model.js)
| Field | Type | Notes |
|-------|------|-------|
| firstname | String | Required, 3-30 chars |
| lastname | String | Optional, 3-30 chars |
| emailId | String | Required, unique, lowercase, immutable |
| password | String | Required (hashed with bcrypt) |
| age | Number | Optional, 6-80 |
| role | String | user or admin, default user |

Schema pre-save hook hashes password; instance method `comparePassword(candidate)` verifies it.

JWT payload shape: `{ _id, emailId, role }`, signed for 1 hour, stored in httpOnly cookie named `token` (sameSite: lax).

### Video (models/video.model.js)
| Field | Type | Notes |
|-------|------|-------|
| title | String | Required |
| description | String | Optional |
| videoUrl | String | Required (Cloudinary URL) |
| publicId | String | Required (Cloudinary public ID) |
| duration | Number | Video duration |
| format | String | e.g. mp4 |
| size | Number | File size in bytes |
| thumbnail | String | Cloudinary thumbnail URL |
| uploadedBy | ObjectId | Ref to User |

### Conversion (models/conversion.model.js)
| Field | Type | Notes |
|-------|------|-------|
| videoId | ObjectId | Ref to Video (required) |
| userId | ObjectId | Ref to User (required) |
| conversionId | String | UUID, unique (required) |
| sourceLanguage | String | Auto-detected |
| targetLanguage | String | Required |
| enableLipsync | Boolean | Default: false |
| status | String | processing, completed, failed, cancelled |
| progress | Number | 0-100 |
| currentStep | String | Human-readable step description |
| cloudinaryUrl | String | Final video URL |
| publicId | String | Cloudinary public ID |
| transcription | String | Full transcription text |
| translation | String | Full translated text |
| duration | Number | Final video duration |
| fileSize | Number | Final file size |
| error | String | Error message if failed |
| completedAt | Date | Completion timestamp |
| failedAt | Date | Failure timestamp |

## Routes

All handlers are async functions that throw `ApiError` on failure. Express 5 forwards rejected promises to the central error middleware - no try/catch needed in controllers.

### routes/auth.routes.js (/user)
| Method | Path | Handler | Auth? |
|--------|------|---------|-------|
| POST | /user/register | authController.register | No |
| POST | /user/login | authController.login | No |
| POST | /user/logout | authController.logout | Yes (authMiddleware) |

### routes/video.routes.js (/api/videos)
| Method | Path | Handler | Auth? |
|--------|------|---------|-------|
| POST | /api/videos/upload | videoController.uploadVideo | Yes (authMiddleware before multer) |
| GET | /api/videos | videoController.getAllVideos | Yes |
| GET | /api/videos/:id | videoController.getVideoById | Yes |
| PATCH | /api/videos/:id | videoController.updateVideo | Yes |
| DELETE | /api/videos/:id | videoController.deleteVideo | Yes |

### routes/conversion.routes.js (/api/conversions)
| Method | Path | Handler | Auth? |
|--------|------|---------|-------|
| POST | /api/conversions/convert | conversionController.startConversion | Yes |
| GET | /api/conversions/:id | conversionController.getConversionStatus | Yes |

## Middleware

### middlewares/auth.middleware.js
- Extracts JWT from req.cookies.token (falls back to Authorization Bearer header)
- Verifies token with process.env.JWT_SECRET
- Looks up user by `_id || userId || id` from token payload
- Sets `req.user` on success
- Throws 401 ApiError ("Token is not present" / "Invalid or expired token" / "User not found")

### middlewares/upload.middleware.js
- Multer disk storage to Backend/uploads/ directory
- Filename: video-{timestamp}-{random}.{ext}
- File filter: only allows video/mp4, video/mpeg, video/quicktime, video/x-msvideo, video/webm
- Size limit: 100MB
- Field name expected: video
- Multer errors are forwarded as ApiError (400)

### middlewares/error.middleware.js
Central handler (registered last in app.js):
- ApiError -> its own statusCode + message
- Mongoose CastError -> 400 "Invalid id format"
- Mongoose ValidationError -> 400 with first validation message
- Mongo duplicate key (code 11000) -> 409 "Already exists"
- Anything else -> 500 "Internal Server Error"
- Always responds `{ success: false, message }`; never leaks stack traces in production

## Utils

### utils/ApiError.js
```js
throw new ApiError(statusCode, message);
```
Operational errors carry an explicit HTTP status code and message.

### utils/validators.js
- Checks for required signup fields: firstname, lastname, emailId, password
- Validates email format via validator.isEmail()
- Validates password strength via validator.isStrongPassword()
- Returns a list of human-readable error strings

## Services

### services/cloudinary.service.js
All Cloudinary operations:
- uploadVideoToCloudinary(filePath) - Upload video, return URL/metadata, delete local file
- uploadCaptionedVideo(filePath, title, conversionId, userId) - Upload converted video
- uploadAudioToCloudinary(audioPath, fileName, folder) - Upload audio file
- generateThumbnailUrl(publicId, width, height) - Get thumbnail URL
- getVideoInfo(publicId) - Get video metadata from Cloudinary
- deleteVideoFromCloudinary(publicId) - Delete video
- deleteConversionFolder(userId, conversionId) - Delete conversion folder
- uploadWithProgress(filePath, options) - Upload with progress tracking

### services/pythonRunner.service.js
Wraps child_process execution of Python scripts:
- runPythonScript(scriptName, args[]) - spawns process.env.PYTHON_BIN (default `python`), collects stdout, parses the trailing JSON line, rejects with stderr details on non-zero exit
- All pipeline steps use this instead of raw exec()

### services/conversionPipeline.service.js
The full orchestration previously embedded in the routes file:
- startConversionProcess(videoDoc, user, options) - kicks off the async pipeline
- updateConversionStatus() - updates both in-memory Map and MongoDB
- downloadVideo(), extractAudio(), transcribeAudio(), translateText(), textToSpeech(), mergeAudioVideo(), cleanupTempFiles() - individual steps calling Python scripts via pythonRunner
- addCaptionsToVideo(videoPath, outputPath, transcription, sourceLang, targetLang) - receives targetLanguage explicitly (fixes a latent ReferenceError where it read an undefined variable)
- In-memory status Map keyed by conversionId UUID

## Config

### config/db.js
- Exports `connectDB()` which connects via process.env.MONGODB_URI
- Logs connection status, errors, and disconnection events
- server.js awaits it during startup

### config/cloudinary.js
- Configures the Cloudinary SDK with CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

### config/redisDb.js
- Creates a Redis client connecting to RedisLabs (DISABLED - kept for future use, commented out)
