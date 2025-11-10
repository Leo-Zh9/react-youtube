# ReactFlix - Flow Diagrams

## 1. Application Routing Structure

```mermaid
graph TB
    Start([User Visits Site]) --> HomePage["/"]
    
    HomePage --> Watch["/watch/:id"]
    HomePage --> Search["/search"]
    HomePage --> Login["/login"]
    HomePage --> Register["/register"]
    
    Login --> Protected{Authenticated?}
    Protected -->|Yes| Upload["/upload"]
    Protected -->|Yes| Uploads["/uploads"]
    Protected -->|Yes| Playlists["/playlists"]
    Protected -->|No| RedirectLogin[Redirect to /login]
    
    Login --> ForgotPW["/forgot-password"]
    ForgotPW --> ResetPW["/reset-password/:token"]
    ResetPW --> Login
    
    style HomePage fill:#e74c3c
    style Watch fill:#3498db
    style Upload fill:#2ecc71
    style Uploads fill:#2ecc71
    style Playlists fill:#2ecc71
    style Protected fill:#f39c12
```

---

## 2. Component Hierarchy

```mermaid
graph TD
    App[App.jsx] --> EB[ErrorBoundary]
    App --> TC[ToastContainer]
    App --> Router[React Router]
    
    Router --> HomePage[HomePage]
    Router --> VideoPlayerPage[VideoPlayerPage]
    Router --> SearchPage[SearchPage]
    Router --> UploadPage[UploadPage]
    Router --> UploadsPage[UploadsPage]
    Router --> PlaylistsPage[PlaylistsPage]
    Router --> AuthPages[Auth Pages]
    
    HomePage --> Nav1[Navbar]
    HomePage --> Hero[HeroSection]
    HomePage --> Car1[Carousel: Trending]
    HomePage --> Car2[Carousel: New Releases]
    HomePage --> Grid1[Browse All Grid]
    
    Car1 --> VC1[VideoCard]
    Car2 --> VC2[VideoCard]
    Grid1 --> VC3[VideoCard]
    
    VideoPlayerPage --> Nav2[Navbar]
    VideoPlayerPage --> VP[Video Player]
    VideoPlayerPage --> CS[CommentsSection]
    VideoPlayerPage --> PM[PlaylistModal]
    VideoPlayerPage --> RecGrid[Recommendations]
    RecGrid --> VC4[VideoCard]
    
    PlaylistsPage --> Nav3[Navbar]
    PlaylistsPage --> EPM[EditPlaylistModal]
    PlaylistsPage --> PLCards[Playlist Cards]
    
    SearchPage --> Nav4[Navbar]
    SearchPage --> SResults[Search Results]
    SResults --> VC5[VideoCard]
    
    UploadPage --> Nav5[Navbar]
    UploadPage --> UForm[Upload Form]
    
    style HomePage fill:#e74c3c,color:#fff
    style VideoPlayerPage fill:#3498db,color:#fff
    style PlaylistsPage fill:#2ecc71,color:#fff
    style SearchPage fill:#9b59b6,color:#fff
```

---

## 3. Data Flow - HomePage

```mermaid
sequenceDiagram
    participant User
    participant HomePage
    participant API
    participant Backend
    participant Cache
    
    User->>HomePage: Visit /
    HomePage->>HomePage: useEffect() mount
    HomePage->>Cache: Check cache
    
    alt Cache hit (< 10 min)
        Cache-->>HomePage: Return cached data
    else Cache miss
        HomePage->>API: getHomeData(100)
        API->>Backend: GET /api/videos/home?limit=100
        Backend-->>API: { allVideos[], newReleases[] }
        API->>Cache: Store for 10 min
        API-->>HomePage: Return data
    end
    
    HomePage->>HomePage: Organize by category
    HomePage->>HomePage: Filter trending (top 10)
    HomePage->>User: Render page
    
    User->>HomePage: Search "action"
    HomePage->>HomePage: filterVideos()
    HomePage->>User: Show filtered results
    
    User->>HomePage: Click VideoCard
    HomePage->>User: Navigate to /watch/:id
```

---

## 4. Data Flow - VideoPlayerPage

```mermaid
sequenceDiagram
    participant User
    participant VPP as VideoPlayerPage
    participant API
    participant Backend
    
    User->>VPP: Visit /watch/:id
    
    par Parallel API Calls
        VPP->>API: getVideoById(id)
        API->>Backend: GET /api/videos/:id
        Backend-->>API: Video data
        
        VPP->>API: getRecommendedVideos(id, 12)
        API->>Backend: GET /api/videos?limit=100
        Backend-->>API: All videos
        
        VPP->>API: getLikesInfo(id)
        API->>Backend: GET /api/videos/:id/likes
        Backend-->>API: {likesCount, isLiked}
    end
    
    API-->>VPP: All data loaded
    VPP->>User: Render player + UI
    
    User->>VPP: Play video
    VPP->>VPP: Start view tracking timer
    
    alt Video plays >= 10s
        VPP->>API: incrementViewCount(id)
        API->>Backend: PATCH /api/videos/:id/view
        Backend-->>API: Success
        VPP->>VPP: Update local view count
    end
    
    User->>VPP: Click Like button
    VPP->>API: toggleLike(id)
    API->>Backend: POST /api/videos/:id/like
    Backend-->>API: {likesCount, isLiked}
    VPP->>User: Update UI (optimistic)
    
    User->>VPP: Click Save button
    VPP->>VPP: Show PlaylistModal
    VPP->>API: getUserPlaylists()
    API->>Backend: GET /api/playlists
    Backend-->>API: Playlists[]
    VPP->>User: Show playlists
    
    User->>VPP: Check playlist
    VPP->>API: addToPlaylist(pid, vid)
    API->>Backend: POST /api/playlists/:pid/add
    Backend-->>API: Success
    VPP->>User: Toast: "Added to playlist"
```

---

## 5. Authentication Flow

```mermaid
flowchart TD
    Start([User Action]) --> LoginCheck{Already<br/>Logged In?}
    
    LoginCheck -->|Yes| Dashboard[Access Protected Route]
    LoginCheck -->|No| LoginPage[Show Login Page]
    
    LoginPage --> LoginForm{Login or<br/>Register?}
    
    LoginForm -->|Login| LoginAPI[POST /api/auth/login]
    LoginForm -->|Register| RegisterAPI[POST /api/auth/register]
    LoginForm -->|Forgot Password| ForgotPW[POST /api/auth/forgot-password]
    
    LoginAPI --> ValidateLogin{Valid<br/>Credentials?}
    RegisterAPI --> ValidateReg{Valid<br/>Input?}
    ForgotPW --> EmailSent[Email Sent with Token]
    
    ValidateLogin -->|Yes| GetToken[Receive JWT Token]
    ValidateLogin -->|No| LoginError[Show Error]
    
    ValidateReg -->|Yes| GetToken
    ValidateReg -->|No| RegError[Show Error]
    
    GetToken --> StoreToken[Store in localStorage]
    StoreToken --> RedirectIntended[Redirect to Intended Page]
    RedirectIntended --> Dashboard
    
    LoginError --> LoginPage
    RegError --> LoginPage
    
    EmailSent --> CheckEmail{User Checks<br/>Email}
    CheckEmail --> ClickLink[Click Reset Link]
    ClickLink --> ResetPage[/reset-password/:token]
    ResetPage --> NewPassword[Enter New Password]
    NewPassword --> ResetAPI[POST /api/auth/reset-password/:token]
    ResetAPI --> ValidateReset{Valid<br/>Token?}
    ValidateReset -->|Yes| Success[Password Updated]
    ValidateReset -->|No| ResetError[Show Error]
    Success --> LoginPage
    ResetError --> ResetPage
    
    Dashboard --> Logout{User<br/>Logout?}
    Logout -->|Yes| ClearStorage[Clear localStorage]
    ClearStorage --> Start
    
    style GetToken fill:#2ecc71
    style Dashboard fill:#3498db
    style LoginError fill:#e74c3c
    style RegError fill:#e74c3c
```

---

## 6. Video Upload Flow

```mermaid
sequenceDiagram
    participant User
    participant UploadPage
    participant UploadService
    participant Backend
    participant S3
    participant MongoDB
    participant Cache
    
    User->>UploadPage: Visit /upload
    UploadPage->>UploadService: checkUploadStatus()
    UploadService->>Backend: GET /api/upload/status
    Backend-->>UploadService: {configured: true}
    UploadService-->>UploadPage: S3 available
    
    User->>UploadPage: Select video file
    User->>UploadPage: Select thumbnail (optional)
    User->>UploadPage: Fill metadata (title, desc, etc)
    User->>UploadPage: Click Submit
    
    UploadPage->>UploadService: uploadVideoFile(video, metadata, thumbnail)
    UploadService->>Backend: POST /api/upload (multipart/form-data)
    
    Backend->>S3: Upload video file
    S3-->>Backend: Video URL
    
    alt Thumbnail provided
        Backend->>S3: Upload thumbnail
        S3-->>Backend: Thumbnail URL
    else No thumbnail
        Backend->>Backend: Generate from video first frame
        Backend->>S3: Upload generated thumbnail
        S3-->>Backend: Thumbnail URL
    end
    
    Backend->>MongoDB: Save video metadata
    MongoDB-->>Backend: Video document
    
    Backend-->>UploadService: {success: true, video: {...}}
    UploadService->>Cache: clearCache()
    UploadService-->>UploadPage: Upload complete
    
    UploadPage->>UploadPage: Show success message
    UploadPage->>User: Navigate to HomePage
```

---

## 7. Playlist Management Flow

```mermaid
flowchart TD
    Start([User on Video Page]) --> ClickSave[Click Save Button]
    ClickSave --> OpenModal[Open PlaylistModal]
    OpenModal --> FetchPlaylists[GET /api/playlists]
    
    FetchPlaylists --> ShowPlaylists{Show User's<br/>Playlists}
    
    ShowPlaylists --> CheckboxAction{User Action}
    
    CheckboxAction -->|Check Playlist| AddAPI[POST /api/playlists/:pid/add]
    CheckboxAction -->|Uncheck Playlist| RemoveAPI[POST /api/playlists/:pid/remove]
    CheckboxAction -->|Create New| CreateForm[Show Create Form]
    CheckboxAction -->|Done| CloseModal[Close Modal]
    
    CreateForm --> CreateAPI[POST /api/playlists]
    CreateAPI --> AutoAdd[Auto-add video to new playlist]
    AutoAdd --> Toast1[Toast: Created & Added]
    Toast1 --> ShowPlaylists
    
    AddAPI --> Toast2[Toast: Added Successfully]
    RemoveAPI --> Toast3[Toast: Removed]
    
    Toast2 --> ShowPlaylists
    Toast3 --> ShowPlaylists
    
    CloseModal --> End([Return to Video])
    
    subgraph Edit Playlist
        EditStart([User on Playlists Page]) --> ClickEdit[Click Edit Button]
        ClickEdit --> OpenEditModal[Open EditPlaylistModal]
        OpenEditModal --> EditAction{User Action}
        
        EditAction -->|Change Name| UpdateName[Update name field]
        EditAction -->|Upload Image| SelectFile[Select image file]
        
        SelectFile --> Validate{Valid Image?<br/>< 5MB}
        Validate -->|Yes| Preview[Show preview]
        Validate -->|No| ErrorMsg[Show error]
        ErrorMsg --> OpenEditModal
        
        Preview --> UpdateName
        UpdateName --> ClickSave[Click Save Changes]
        
        ClickSave --> UploadImg{Image<br/>Selected?}
        UploadImg -->|Yes| UploadAPI[POST /api/playlists/:pid/upload-thumbnail]
        UploadImg -->|No| UpdateAPI[PATCH /api/playlists/:pid]
        
        UploadAPI --> S3Upload[Upload to S3]
        S3Upload --> UpdateAPI
        
        UpdateAPI --> ClearCache[Clear cache]
        ClearCache --> Toast4[Toast: Successfully Updated]
        Toast4 --> RefreshUI[Refresh playlist UI]
        RefreshUI --> EditEnd([Close Modal])
    end
    
    style AddAPI fill:#2ecc71
    style RemoveAPI fill:#e74c3c
    style CreateAPI fill:#3498db
    style UploadAPI fill:#9b59b6
```

---

## 8. API Service Architecture

```mermaid
graph TB
    subgraph Frontend
        Components[React Components]
        API[api.js]
        Auth[authService.js]
        Upload[uploadService.js]
        Retry[fetchWithRetry.js]
        Cache[In-Memory Cache]
    end
    
    subgraph Utilities
        Retry --> |Exponential<br/>Backoff| Retry
        Cache --> |10 min TTL| Cache
    end
    
    Components --> API
    Components --> Auth
    Components --> Upload
    
    API --> Retry
    Retry --> Cache
    
    Cache --> |Cache Miss| Backend
    Cache --> |Cache Hit| Components
    
    subgraph Backend
        Express[Express Server]
        VideoRoutes[/api/videos/*]
        AuthRoutes[/api/auth/*]
        PlaylistRoutes[/api/playlists/*]
        UploadRoutes[/api/upload]
        
        Express --> VideoRoutes
        Express --> AuthRoutes
        Express --> PlaylistRoutes
        Express --> UploadRoutes
    end
    
    subgraph Data Layer
        MongoDB[(MongoDB)]
        S3[(AWS S3)]
        
        VideoRoutes --> MongoDB
        PlaylistRoutes --> MongoDB
        UploadRoutes --> S3
        UploadRoutes --> MongoDB
    end
    
    Retry --> Express
    Auth --> Express
    Upload --> Express
    
    style API fill:#3498db
    style Auth fill:#e74c3c
    style Upload fill:#2ecc71
    style Retry fill:#f39c12
    style Cache fill:#9b59b6
```

---

## 9. Rate Limit Handling with Retry Logic

```mermaid
sequenceDiagram
    participant Component
    participant fetchWithRetry
    participant Cache
    participant Backend
    
    Component->>fetchWithRetry: API Request
    fetchWithRetry->>Cache: Check cache
    
    alt Cache Hit
        Cache-->>Component: Return cached data
    else Cache Miss
        fetchWithRetry->>Backend: HTTP Request
        
        alt Success (200)
            Backend-->>fetchWithRetry: Data
            fetchWithRetry->>Cache: Store (TTL: 5-10min)
            fetchWithRetry-->>Component: Return data
        
        else Rate Limited (429)
            Backend-->>fetchWithRetry: 429 Too Many Requests
            
            loop Retry with Exponential Backoff
                fetchWithRetry->>fetchWithRetry: Wait (1s → 2s → 4s)
                fetchWithRetry->>Backend: Retry request
                
                alt Success
                    Backend-->>fetchWithRetry: Data
                    fetchWithRetry->>Cache: Store
                    fetchWithRetry-->>Component: Return data
                
                else Still 429 (Max retries)
                    fetchWithRetry-->>Component: Error: Too many requests
                end
            end
        
        else Server Error (5xx)
            Backend-->>fetchWithRetry: 5xx Error
            fetchWithRetry->>fetchWithRetry: Retry (exponential backoff)
            fetchWithRetry->>Backend: Retry request
        
        else Client Error (4xx)
            Backend-->>fetchWithRetry: 4xx Error
            fetchWithRetry-->>Component: Throw error (no retry)
        end
    end
```

---

## 10. Search & Filter Flow

```mermaid
flowchart TD
    Start([User on Search Page]) --> InitLoad[Load /search]
    InitLoad --> FetchFilters[GET /api/videos/search/filters]
    FetchFilters --> ParseURL{Query Params<br/>in URL?}
    
    ParseURL -->|Yes| UseParams[Use URL params]
    ParseURL -->|No| UseDefaults[Use defaults]
    
    UseParams --> SearchAPI[GET /api/videos/search?q=&filters=...]
    UseDefaults --> SearchAPI
    
    SearchAPI --> ShowResults[Display VideoCard Grid]
    
    ShowResults --> UserAction{User Action}
    
    UserAction -->|Type Search| UpdateQuery[Update query param]
    UserAction -->|Change Category| UpdateCategory[Update category param]
    UserAction -->|Change Year| UpdateYear[Update year param]
    UserAction -->|Change Rating| UpdateRating[Update rating param]
    UserAction -->|Change Sort| UpdateSort[Update sort param]
    UserAction -->|Click Video| Navigate[Navigate to /watch/:id]
    
    UpdateQuery --> UpdateURL[Update URL]
    UpdateCategory --> UpdateURL
    UpdateYear --> UpdateURL
    UpdateRating --> UpdateURL
    UpdateSort --> UpdateURL
    
    UpdateURL --> SearchAPI
    
    Navigate --> End([Video Player Page])
    
    style SearchAPI fill:#3498db
    style ShowResults fill:#2ecc71
    style Navigate fill:#e74c3c
```

---

## Usage Instructions

1. Copy any diagram above
2. Paste into a Mermaid editor (e.g., [Mermaid Live Editor](https://mermaid.live/))
3. Export as PNG/SVG for documentation
4. Or embed directly in GitHub README (GitHub supports Mermaid)

Example usage in README:

\`\`\`mermaid
// Paste diagram code here
\`\`\`

---

**Note:** These diagrams complement the detailed `REACTFLIX_FLOW_DIAGRAM.md` documentation.

