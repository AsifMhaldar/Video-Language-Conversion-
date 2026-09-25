# Frontend Architecture

## Tech Stack
- React 19 + Vite 7
- Tailwind CSS 4 (via @tailwindcss/vite)
- React Router DOM 7
- Framer Motion (animations)
- React Icons (HeroIcons, FontAwesome, Google Icons)
- Axios (single shared instance)

## Entry: src/main.jsx
- Renders App inside BrowserRouter
- Wrapped in AuthProvider for auth context

## Routes (src/App.jsx)
| Route | Component | Description |
|-------|-----------|-------------|
| / | Landings | Marketing landing page |
| /signup | SignUp | Registration form |
| /signin | SignIn | Login form |
| /dashboard | Dashboard | Main dashboard |
| /video-history | VideoHistory | Video gallery grid |
| /language-converter | LanguageConverter | 3-step conversion wizard |
| * | Redirect to / | Catch-all |

## Reusable UI Design System (`src/shared/`)

Enterprise reusable component library exports:
```javascript
// Direct from shared:
import { Button, Badge, Card, Modal, Input, Spinner } from '../shared';

// Or from shared/components:
import { Button, Badge, Card, Modal, Input, Spinner } from '../shared/components';
```

| Component | File | Description | Supported Variants / Props |
|---|---|---|---|
| **Button** | `Button.jsx` | Polymorphic button with loading spinner & icon slots | `primary`, `secondary`, `outline`, `danger`, `ghost` (sizes: `sm`, `md`, `lg`) |
| **Badge** | `Badge.jsx` | Status tag / language format badge | `blue`, `purple`, `green`, `amber`, `red`, `neutral` (sizes: `sm`, `md`) |
| **Card** | `Card.jsx` | Glassmorphic container with hover glow effects | `glow: blue, purple, green, amber`, subcomponents: `Card.Header`, `Card.Body`, `Card.Footer` |
| **Modal** | `Modal.jsx` | Accessible dialog with backdrop blur & Escape listener | `maxWidth: sm, md, lg, xl, 3xl, 4xl`, `title`, `footer` slots |
| **Input** | `Input.jsx` | Input field with prefix/suffix icons & error states | `icon`, `iconPosition`, `label`, `error`, `helperText` |
| **Spinner** | `Spinner.jsx`| Animated glowing loader for async operations | `sizes: sm, md, lg, xl`, `colors: blue, purple, white` |

Route guards are implicit: pages check `user` from useAuth() and navigate to /signin when absent.

## API Layer (src/api/)

### client.js
Axios instance:
- `baseURL`: `import.meta.env.VITE_API_URL` or http://localhost:3000
- `withCredentials: true` - sends the httpOnly `token` cookie on every request
- No Authorization headers anywhere; auth is purely cookie-based

### auth.api.js
| Function | Endpoint |
|----------|----------|
| registerUser(data) | POST /user/register |
| loginUser(data) | POST /user/login |
| logoutUser() | POST /user/logout |

### video.api.js
| Function | Endpoint |
|----------|----------|
| uploadVideo(formData, onProgress) | POST /api/videos/upload |
| fetchVideos() | GET /api/videos |
| getVideoById(id) | GET /api/videos/:id |
| updateVideo(id, data) | PATCH /api/videos/:id |
| deleteVideoById(id) | DELETE /api/videos/:id |

### conversion.api.js
| Function | Endpoint |
|----------|----------|
| startConversion(payload) | POST /api/conversions/convert |
| getConversionStatus(conversionId) | GET /api/conversions/:id |

## Context: src/context/AuthContext.jsx

- User is restored synchronously from localStorage via a lazy useState initializer (no setState-in-effect flash)
- After register/login, the user object is persisted from `{ success, data }` response shape

| Function | Details |
|----------|---------|
| register(userData) | POST /user/register - sends firstname, lastname, emailId, password |
| login(credentials) | POST /user/login - sends emailId, password |
| logout() | POST /user/logout + clears localStorage |

Exports: `{ user, loading, register, login, logout }` plus the `useAuth()` hook.

Errors surface as strings via thrown `extractErrorMessage(error)` results, which pages display inline.

## Pages

### Landings.jsx
Marketing landing page with hero, features, how-it-works, supported languages, pricing, FAQ, and CTA sections. Animated particle background is generated once at module level.

### SignUp.jsx
Registration form with fields:
- First name, Last name
- Email, Password, Confirm password
- Terms acceptance checkbox
- Client-side validation mirrors backend validators
- Calls register() from AuthContext; redirects to /dashboard on success

### SignIn.jsx
Login form with email/password and a remember-me checkbox.
Calls login() from AuthContext; redirects to /dashboard on success. Errors display inline.

### Dashboard.jsx
Main authenticated dashboard:
- Navbar with branding, user avatar/name, logout
- Welcome section greeting user
- Stats grid: Videos Uploaded, Formats count, Total Size
- Your Videos list (fetched via fetchVideos())
- Quick Actions: Upload New Video, View History
- VideoUpload modal component
- Shared formatters imported from utils/format.js

### LanguageConverter.jsx
Three-step conversion wizard:

**Step 1 - Select Video:**
- Fetches videos via fetchVideos()
- Displays grid of user videos; user picks one

**Step 2 - Choose Target Language:**
- Shows selected video preview
- Grid of 16 language options from constants/languages.js
- Source language auto-detected by backend

**Step 3 - Processing:**
- POSTs via startConversion()
- Polls getConversionStatus() every 2 seconds using a ref-held interval id (proper cleanup on unmount/reset)
- Shows progress bar, current step, detected source language
- Handles completed, failed, cancelled states; failed sets an inline error instead of alert-only
- On 401/403 during polling: stops polling, alerts, redirects to /signin

All requests go through the cookie-authenticated axios client - no manual token handling.

### VideoHistory.jsx
Video history/gallery page:
- Stats bar: Total Videos, Total Size, Formats, This Week
- 3-column responsive video grid
- Each card: thumbnail, hover overlay (View, Download, Delete), title, description, date, format, size
- Delete confirmation modal with animation
- Empty state with illustration

## Components

### VideoUpload.jsx
Modal video upload component. Props: isOpen, onClose, onUploadSuccess.

Features:
- Drag and drop zone (or file browser)
- Validates file MIME type starts with video/
- File info display with remove button
- Form: required "Video Title" input, optional "Description" textarea
- Upload via uploadVideo() with multipart/form-data and progress callback
- Upload progress bar with animated gradient
- Success state with green checkmark animation (2 seconds)
- Error handling with API response messages
- Max file note: "Max 100MB" (no client-side enforcement)

## Directory Structure
```
src/
├── main.jsx                    # React DOM entry
├── App.jsx                     # Route definitions
├── index.css                   # Global styles
├── api/
│   ├── client.js               # Axios instance (VITE_API_URL, withCredentials)
│   ├── auth.api.js             # Register/login/logout calls
│   ├── video.api.js            # Video CRUD calls
│   └── conversion.api.js       # Conversion calls
├── context/
│   └── AuthContext.jsx         # Auth state + persistence
├── constants/
│   └── languages.js            # Shared language list
├── utils/
│   └── format.js               # formatFileSize / formatDate
├── pages/
│   ├── Landings.jsx            # Landing page
│   ├── SignUp.jsx              # Registration
│   ├── SignIn.jsx              # Login
│   ├── Dashboard.jsx           # Main dashboard
│   ├── LanguageConverter.jsx   # Conversion wizard
│   └── VideoHistory.jsx        # Video gallery
└── components/
    └── VideoUpload.jsx         # Upload modal
```

## Linting

`npm run lint` runs ESLint 9 (flat config):
- eslint-plugin-react-hooks (flat recommended, includes React purity rules)
- eslint-plugin-react-refresh
- eslint-plugin-react with jsx-uses-vars enabled so JSX identifiers resolve correctly
- Context files exempt from react-refresh/only-export-components (standard context pattern)

Current status: **0 errors, 0 warnings**.
