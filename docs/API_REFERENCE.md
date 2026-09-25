# API Reference

Base URL: configured via `VITE_API_URL` on the frontend (default: http://localhost:3000)

**Auth:** All protected endpoints use the httpOnly `token` cookie (JWT, 1 hour expiry). The frontend axios client sends it automatically via `withCredentials: true`.

**Error shape:** Every error response is `{ "success": false, "message": "..." }`. Success responses are `{ "success": true, ... }`.

## Authentication

### POST /user/register
Register a new user.

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "emailId": "john@example.com",
  "password": "StrongPass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User register successfully",
  "data": { "_id": "...", "firstname": "John", "emailId": "john@example.com", ... }
}
```
**Sets cookie:** token (JWT, 1 hour expiry)

**Validation errors (400):**
- Missing field: "firstname is required" etc.
- Invalid email format
- Weak password

---

### POST /user/login
Login an existing user.

**Request Body:**
```json
{
  "emailId": "john@example.com",
  "password": "StrongPass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User Logged In Successfully"
}
```
**Sets cookie:** token (JWT, 1 hour expiry)

**Errors:**
- 401: "Invalid credentials"

---

### POST /user/logout
Logout current user.

**Auth:** Required (cookie JWT)

**Response (200):**
```json
{ "success": true, "message": "User logout successfully" }
```
**Clears cookie:** token

**Errors:**
- 401: "Token is not present" / "Invalid or expired token" / "User not found"

---

## Videos

All video endpoints require auth. Requests with a missing/invalid cookie receive:
```json
{ "success": false, "message": "Token is not present" }
```
with status 401.

### POST /api/videos/upload
Upload a video file.

**Content-Type:** multipart/form-data

**Form Fields:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| video | File | Yes | Video file, max 100MB |
| title | String | Yes | Video title |
| description | String | No | Video description |

**Accepted video types:** video/mp4, video/mpeg, video/quicktime, video/x-msvideo, video/webm

**Response (201):**
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "_id": "...",
    "title": "My Video",
    "description": "A test video",
    "videoUrl": "https://res.cloudinary.com/...",
    "publicId": "videos/...",
    "duration": 120,
    "format": "mp4",
    "size": 10485760,
    "thumbnail": "https://res.cloudinary.com/...",
    "uploadedBy": "...",
    "createdAt": "2026-08-21T..."
  }
}
```

---

### GET /api/videos
Get all videos, sorted by newest first.

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

---

### GET /api/videos/:id
Get a single video by MongoDB ObjectId.

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

**Errors:**
- 400: "Invalid id format"
- 404: "Video not found"

---

### PATCH /api/videos/:id
Update video title and/or description.

**Request Body:**
```json
{
  "title": "New Title",
  "description": "New description"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Video updated successfully",
  "data": { ... }
}
```

---

### DELETE /api/videos/:id
Delete video from both Cloudinary and MongoDB.

**Response (200):**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

**Errors:**
- 404: "Video not found"

---

## Conversions

Both endpoints require auth.

### POST /api/conversions/convert
Start a language conversion pipeline.

**Request Body:**
```json
{
  "videoId": "mongo ObjectId",
  "targetLanguage": "hi",
  "enableLipsync": false
}
```

**Supported target languages:**
en, es, fr, de, it, pt, ru, ja, ko, zh, ar, hi, bn, te, mr, ta

**Response (200):**
```json
{
  "success": true,
  "message": "Conversion started successfully",
  "data": {
    "conversionId": "uuid-v4-string",
    "message": "Conversion is being processed. Use the conversion ID to check status."
  }
}
```

**Errors:**
- 400: "Video ID is required" / "Target language is required"
- 404: "Video not found"

---

### GET /api/conversions/:id
Check conversion status by conversionId (UUID).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "videoId": "...",
    "targetLanguage": "hi",
    "status": "processing",
    "progress": 40,
    "currentStep": "Detected language: en. Translating to hi...",
    "sourceLanguage": "en",
    "cloudinaryUrl": null,
    "createdAt": "2026-08-21T...",
    "updatedAt": "2026-08-21T..."
  }
}
```

**Status values:** processing, completed, failed, cancelled

**Progress values:** 0-100 (increments at each pipeline step)

**When completed, additional fields:**
```json
{
  "cloudinaryUrl": "https://res.cloudinary.com/...",
  "transcription": "Full transcribed text...",
  "translation": "Full translated text..."
}
```

**Errors:**
- 404: "Conversion not found"
