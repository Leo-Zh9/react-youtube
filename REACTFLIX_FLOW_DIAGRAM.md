# ReactFlix (react-youtube) - Complete Flow Diagram

## 📋 Table of Contents
1. [All Routes](#all-routes)
2. [All React Components](#all-react-components)
3. [Component Hierarchy](#component-hierarchy)
4. [All API Calls by File](#all-api-calls-by-file)
5. [Data Flow by Page](#data-flow-by-page)
6. [Context Providers & Custom Hooks](#context-providers--custom-hooks)

---

## 🛣️ All Routes

| Path | Component | Protection | Description |
|------|-----------|------------|-------------|
| `/` | `HomePage` | Public | Main landing page with video carousels |
| `/watch/:id` | `VideoPlayerPage` | Public | Watch video with player, comments, recommendations |
| `/search` | `SearchPage` | Public | Search videos with filters |
| `/login` | `LoginPage` | Public | User login |
| `/register` | `RegisterPage` | Public | User registration |
| `/forgot-password` | `ForgotPasswordPage` | Public | Request password reset email |
| `/reset-password/:token` | `ResetPasswordPage` | Public | Reset password with token |
| `/upload` | `UploadPage` | **Protected** | Upload new videos |
| `/uploads` | `UploadsPage` | **Protected** | View user's uploaded videos |
| `/playlists` | `PlaylistsPage` | **Protected** | Manage user playlists |

---

## 📦 All React Components

### Pages (10)
| Component | Path | Type | Key Features |
|-----------|------|------|--------------|
| `HomePage` | `/pages/HomePage.jsx` | Page | Featured hero, trending carousel, new releases, browse all |
| `VideoPlayerPage` | `/pages/VideoPlayerPage.jsx` | Page | Video player, view tracking, likes, comments, playlists |
| `SearchPage` | `/pages/SearchPage.jsx` | Page | Search bar, filters, results grid |
| `UploadPage` | `/pages/UploadPage.jsx` | Page | Video upload form with S3 integration |
| `UploadsPage` | `/pages/UploadsPage.jsx` | Page | User's uploaded videos management |
| `PlaylistsPage` | `/pages/PlaylistsPage.jsx` | Page | Create, edit, delete playlists |
| `LoginPage` | `/pages/LoginPage.jsx` | Page | Login form with password toggle |
| `RegisterPage` | `/pages/RegisterPage.jsx` | Page | Registration form |
| `ForgotPasswordPage` | `/pages/ForgotPasswordPage.jsx` | Page | Request password reset |
| `ResetPasswordPage` | `/pages/ResetPasswordPage.jsx` | Page | Reset password with token |

### Layout Components (2)
| Component | Path | Type | Used In |
|-----------|------|------|---------|
| `Navbar` | `/components/Navbar.jsx` | Layout | All pages (via individual imports) |
| `ErrorBoundary` | `/components/ErrorBoundary.jsx` | Layout | App.jsx (wraps entire app) |

### UI Components (10)
| Component | Path | Type | Purpose |
|-----------|------|------|---------|
| `VideoCard` | `/components/VideoCard.jsx` | UI | Display video thumbnail with metadata |
| `Carousel` | `/components/Carousel.jsx` | UI | Horizontal scrolling video carousel (Swiper.js) |
| `HeroSection` | `/components/HeroSection.jsx` | UI | Featured video banner on homepage |
| `CommentsSection` | `/components/CommentsSection.jsx` | UI | Comments list and input |
| `PlaylistModal` | `/components/PlaylistModal.jsx` | Modal | Add video to playlists |
| `EditPlaylistModal` | `/components/EditPlaylistModal.jsx` | Modal | Edit playlist name and thumbnail |
| `ToastContainer` | `/components/ToastContainer.jsx` | UI | Global toast notifications |
| `ProtectedRoute` | `/components/ProtectedRoute.jsx` | HOC | Route authentication wrapper |
| `LoadingSkeleton` | `/components/LoadingSkeleton.jsx` | UI | Loading placeholder |
| `ErrorRetry` | `/components/ErrorRetry.jsx` | UI | Error message with retry button |

---

## 🌳 Component Hierarchy

### HomePage
```
HomePage
├── Navbar
│   └── (Search, Upload, Login/User Menu)
├── HeroSection
│   └── Featured Video (play buttons)
├── Carousel (Trending Now)
│   └── VideoCard[]
├── Carousel (New Releases)
│   └── VideoCard[]
└── Browse All Grid
    └── VideoCard[]
```

### VideoPlayerPage
```
VideoPlayerPage
├── Navbar
├── Video Player
│   └── <video> element with controls
├── Video Metadata
│   ├── Like Button (toggleLike)
│   ├── Save Button → PlaylistModal
│   └── Share Button
├── CommentsSection
│   ├── Comment Input (addComment)
│   └── Comment List (deleteComment)
├── Recommended Videos Sidebar
│   └── VideoCard[]
└── PlaylistModal (conditional)
    └── Create/Add to playlists
```

### PlaylistsPage
```
PlaylistsPage
├── Navbar
├── Playlist Cards Grid
│   └── Each Playlist Card
│       ├── Thumbnail (custom or default)
│       ├── Edit Button → EditPlaylistModal
│       └── Delete Button
└── EditPlaylistModal (conditional)
    └── Rename & Upload Thumbnail
```

### SearchPage
```
SearchPage
├── Navbar
├── Search Bar
├── Filters (Category, Year, Rating, Sort)
└── Results Grid
    └── VideoCard[]
```

### UploadPage
```
UploadPage
├── Navbar
└── Upload Form
    ├── Video File Input
    ├── Thumbnail File Input
    ├── Metadata Fields
    └── Progress Bar
```

---

## 🔌 All API Calls by File

### `/services/api.js` - Main API Service
**Base URL:** `import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'`

#### Video Endpoints
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getHomeData()` | GET | `/videos/home?limit=100` | Combined home data (all + new releases) |
| `getAllVideos()` | GET | `/videos?page=1&limit=24&sort=createdAt` | Paginated videos |
| `getNewReleases()` | GET | `/videos/new?limit=20` | Newest videos |
| `getVideoById()` | GET | `/videos/:id` | Single video details |
| `getRecommendedVideos()` | GET | `/videos?limit=100` | Filtered recommendations |
| `incrementViewCount()` | PATCH | `/videos/:id/view` | Increment video views |
| `deleteVideo()` | DELETE | `/videos/:id` | Delete video (owner only) |

#### Likes & Comments
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `toggleLike()` | POST | `/videos/:id/like` | Toggle like on video |
| `getLikesInfo()` | GET | `/videos/:id/likes` | Get likes count and user status |
| `getComments()` | GET | `/videos/:id/comments?cursor=&limit=20` | Paginated comments |
| `addComment()` | POST | `/videos/:id/comments` | Add new comment |
| `deleteComment()` | DELETE | `/comments/:id` | Delete comment |

#### Playlist Endpoints
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getUserPlaylists()` | GET | `/playlists` | User's playlists |
| `getPlaylist()` | GET | `/playlists/:pid` | Single playlist with videos |
| `createPlaylist()` | POST | `/playlists` | Create new playlist |
| `updatePlaylist()` | PATCH | `/playlists/:pid` | Update playlist name |
| `uploadPlaylistThumbnail()` | POST | `/playlists/:pid/upload-thumbnail` | Upload thumbnail to S3 |
| `addToPlaylist()` | POST | `/playlists/:pid/add` | Add video to playlist |
| `removeFromPlaylist()` | POST | `/playlists/:pid/remove` | Remove video from playlist |
| `deletePlaylist()` | DELETE | `/playlists/:pid` | Delete playlist |

#### Search
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `searchVideos()` | GET | `/videos/search?q=&category=&year=&rating=&sort=` | Search with filters |
| `getSearchFilters()` | GET | `/videos/search/filters` | Available filter options |

### `/services/authService.js` - Authentication
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `register()` | POST | `/auth/register` | Create new account |
| `login()` | POST | `/auth/login` | Login and get JWT token |
| `forgotPassword()` | POST | `/auth/forgot-password` | Request password reset |
| `resetPassword()` | POST | `/auth/reset-password/:token` | Reset password with token |
| `logout()` | - | Local only | Clear localStorage |
| `isAuthenticated()` | - | Local only | Check token validity |
| `getUser()` | - | Local only | Get user from localStorage |
| `getToken()` | - | Local only | Get JWT token |

### `/services/uploadService.js` - File Upload
| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `uploadVideoFile()` | POST | `/upload` | Upload video & thumbnail to S3 |
| `checkUploadStatus()` | GET | `/upload/status` | Check S3 configuration |

---

## 📊 Data Flow by Page

### 1. HomePage (`/`)
**API Calls:**
- `getHomeData(100)` → Returns { allVideos, newReleases }

**Data Flow:**
```
Mount → getHomeData() 
      → Set videos & newReleases state
      → Organize by category (trending, featured)
      → Filter by search query
      → Render:
         - HeroSection (featured video)
         - Carousel (Trending Now → VideoCard[])
         - Carousel (New Releases → VideoCard[])
         - Grid (Browse All → VideoCard[])
```

**Components Rendered:**
- Navbar (search functionality)
- HeroSection (videos[0])
- Carousel × 2 (trending, new releases)
- VideoCard × ~100 (in carousels & grid)

---

### 2. VideoPlayerPage (`/watch/:id`)
**API Calls:**
- `getVideoById(id)` → Video details
- `getRecommendedVideos(id, 12)` → Suggested videos
- `getLikesInfo(id)` → Likes count & user status
- `incrementViewCount(id)` → Track view (after threshold)
- `toggleLike(id)` → When user clicks like
- `getComments(id)` → Load comments (via CommentsSection)
- `addComment(id, text)` → Post comment (via CommentsSection)

**Data Flow:**
```
Mount → Promise.all([getVideoById, getRecommendedVideos, getLikesInfo])
      → Set video, recommendations, likes state
      → Setup view tracking (on video play)
      → User interactions:
         - Play video → incrementViewCount() after threshold
         - Click like → toggleLike()
         - Click save → Open PlaylistModal
         - Add comment → addComment()
      → Render:
         - Video player with metadata
         - Like/Save/Share buttons
         - CommentsSection
         - Recommended sidebar (VideoCard[])
```

**Components Rendered:**
- Navbar
- Video player (<video> element)
- PlaylistModal (conditional)
- CommentsSection
- VideoCard × 12 (recommended sidebar)

---

### 3. SearchPage (`/search`)
**API Calls:**
- `searchVideos(params)` → Filtered results
- `getSearchFilters()` → Available filters

**Data Flow:**
```
Mount → getSearchFilters()
      → Parse URL query params
      → searchVideos({ q, category, year, rating, sort })
      → Render results grid
User changes filters → searchVideos() with new params
```

**Components Rendered:**
- Navbar
- Filter controls
- VideoCard[] (search results)

---

### 4. UploadPage (`/upload`)
**API Calls:**
- `checkUploadStatus()` → Verify S3 config
- `uploadVideoFile(video, metadata, thumbnail)` → Upload to S3

**Data Flow:**
```
Mount → checkUploadStatus()
      → Show upload form
User submits → uploadVideoFile() with FormData
             → Progress tracking
             → On success → Navigate to homepage
```

**Components Rendered:**
- Navbar
- Upload form
- Progress bar

---

### 5. PlaylistsPage (`/playlists`)
**API Calls:**
- `getUserPlaylists()` → User's playlists
- `getPlaylist(id)` → Playlist details (when viewing)
- `deletePlaylist(id)` → Delete playlist
- `updatePlaylist(id, updates)` → Update name (via EditPlaylistModal)
- `uploadPlaylistThumbnail(id, file)` → Upload image (via EditPlaylistModal)

**Data Flow:**
```
Mount → getUserPlaylists()
      → Render playlist cards
Click playlist → getPlaylist(id) → Show videos
Click edit → Open EditPlaylistModal
           → updatePlaylist() & uploadPlaylistThumbnail()
Click delete → deletePlaylist()
```

**Components Rendered:**
- Navbar
- Playlist cards with thumbnails
- EditPlaylistModal (conditional)
- VideoCard[] (when viewing playlist)

---

### 6. UploadsPage (`/uploads`)
**API Calls:**
- `getAllVideos({ mine: true })` → User's uploaded videos

**Data Flow:**
```
Mount → getAllVideos({ mine: true })
      → Render video grid
Click video → Navigate to /watch/:id
```

**Components Rendered:**
- Navbar
- VideoCard[] (user's videos)

---

### 7. LoginPage (`/login`)
**API Calls:**
- `login(email, password)` → Get JWT token

**Data Flow:**
```
User submits form → login()
                  → Store token in localStorage
                  → Navigate to intended page or home
```

---

### 8. RegisterPage (`/register`)
**API Calls:**
- `register(email, password)` → Create account & get JWT

**Data Flow:**
```
User submits form → register()
                  → Store token in localStorage
                  → Navigate to home
```

---

### 9. ForgotPasswordPage (`/forgot-password`)
**API Calls:**
- `forgotPassword(email)` → Send reset email

**Data Flow:**
```
User submits email → forgotPassword()
                   → Show success message
```

---

### 10. ResetPasswordPage (`/reset-password/:token`)
**API Calls:**
- `resetPassword(token, newPassword)` → Reset password

**Data Flow:**
```
User submits new password → resetPassword()
                          → Navigate to login
```

---

## 🎣 Context Providers & Custom Hooks

### Custom Hooks

#### `useToast` (`/hooks/useToast.js`)
**Purpose:** Global toast notification system

**Exported Functions:**
- `toast.success(message, duration)`
- `toast.error(message, duration)`
- `toast.info(message, duration)`
- `toast.dismiss(id)`

**Used In:**
- PlaylistModal (add/remove confirmations)
- EditPlaylistModal (update success)
- CommentsSection (delete confirmation)
- All forms (success/error messages)

### Utility Functions

#### `/utils/fetchWithRetry.js`
**Purpose:** Automatic retry with exponential backoff for 429 errors

**Exported:**
- `fetchWithRetry(url, options, maxRetries)` - Main fetch wrapper
- `fetchJSON(url, options, maxRetries)` - JSON auto-parse
- `fetchWithCache(url, options, cacheDuration)` - In-memory cache
- `clearCache()` - Clear cache

**Cache Strategy:**
- Home data: 10 minutes (600s)
- Video data: 5 minutes (300s)
- Cleared after: uploads, deletes, updates

#### `/utils/imageUtils.js`
**Purpose:** Image handling utilities

**Exported:**
- `getThumbnailUrl(url)` - Get thumbnail URL
- `handleImageError(e)` - Fallback placeholder

### Authentication State
**Storage:** `localStorage`
- `user` - User object (email, userId)
- `token` - JWT token

**Auth Functions:**
- `isAuthenticated()` - Check if logged in
- `getUser()` - Get user info
- `getToken()` - Get JWT
- `getAuthHeader()` - Build Authorization header

---

## 🔄 Key Data Flows

### Video Upload Flow
```
UploadPage
  → uploadVideoFile(video, metadata, thumbnail)
  → FormData to /api/upload
  → S3 upload (video + thumbnail)
  → MongoDB save
  → Clear cache
  → Navigate to HomePage
```

### Video View Flow
```
VideoPlayerPage
  → getVideoById(id)
  → Render video player
  → User plays video
  → After 3s (short) or 10s (long)
  → incrementViewCount(id)
  → Update local state
```

### Playlist Management Flow
```
VideoPlayerPage → Click Save
  → PlaylistModal opens
    → getUserPlaylists()
    → Show checkboxes
    → User checks playlist
    → addToPlaylist(playlistId, videoId)
    → Toast success
  → Click Done → Close modal

PlaylistsPage → Click Edit
  → EditPlaylistModal opens
    → User uploads image
    → uploadPlaylistThumbnail(id, file) → S3
    → User renames
    → updatePlaylist(id, { name })
    → Toast success
    → Update local state
```

### Search Flow
```
SearchPage
  → User types query
  → Update URL params
  → searchVideos({ q, filters })
  → Render VideoCard[]
  → User clicks filter
  → searchVideos() with new params
```

---

## 📈 Performance Optimizations

1. **Combined Home Endpoint**
   - `/api/videos/home` returns all videos + new releases in one call
   - Reduces API calls from 2 to 1

2. **Caching with `fetchWithCache`**
   - Home data cached for 10 minutes
   - Video data cached for 5 minutes
   - Automatic cache invalidation on mutations

3. **Automatic Retry**
   - `fetchWithRetry` handles 429 rate limits
   - Exponential backoff: 1s, 2s, 4s

4. **Lazy Loading**
   - Comments loaded separately in `CommentsSection`
   - Recommended videos fetched in parallel

5. **Image Optimization**
   - Thumbnail fallbacks
   - Error handling with placeholders

---

## 🔐 Protected Routes

Routes wrapped with `<ProtectedRoute>`:
- `/upload`
- `/uploads`
- `/playlists`

**Auth Check Flow:**
```
ProtectedRoute
  → isAuthenticated()
  → If false → Navigate to /login with state
  → If true → Render children
```

---

## 🎨 Global UI Components

### ToastContainer
- Rendered in `App.jsx`
- Listens to `useToast` hook
- Shows success/error/info messages
- Auto-dismisses after duration

### ErrorBoundary
- Wraps entire app in `App.jsx`
- Catches React errors
- Shows fallback UI

### Navbar
- Imported individually in each page
- Shows different content based on auth state:
  - **Logged out:** Login, Register buttons
  - **Logged in:** Upload, My Uploads, Playlists, User Menu

---

## 📝 Notes for Mermaid Diagram

### Suggested Diagram Types

1. **Component Hierarchy** - Tree diagram
2. **Routing Flow** - Flowchart
3. **Data Flow per Page** - Sequence diagram
4. **API Architecture** - C4 diagram
5. **Authentication Flow** - Flowchart

### Key Relationships

- HomePage → HeroSection, Carousel, VideoCard
- VideoPlayerPage → CommentsSection, PlaylistModal
- Carousel → VideoCard
- PlaylistsPage → EditPlaylistModal
- All pages → Navbar (independently imported)

---

**Generated:** $(date)
**Total Pages:** 10
**Total Components:** 22
**Total API Endpoints:** ~35
**Total Routes:** 10

