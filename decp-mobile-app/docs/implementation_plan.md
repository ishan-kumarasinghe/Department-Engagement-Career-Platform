# DECP React Native Mobile App – Implementation Plan

Build a full-featured mobile app for the **Department Engagement & Career Platform** (DECP) using **Expo (SDK ~55) + React Native 0.83** that connects to the existing backend via the API Gateway on `http://localhost:3000`.

## Proposed Changes

All changes are **strictly inside** `decp-mobile-app/`.

---

### 1. Project Setup & Dependencies

#### [MODIFY] package.json

Add the following libraries:

| Library | Purpose |
|---|---|
| `@react-navigation/native` + `@react-navigation/native-stack` + `@react-navigation/bottom-tabs` | Screen navigation |
| `axios` | HTTP requests to API Gateway |
| `@react-native-async-storage/async-storage` | Persist auth tokens |
| `zustand` | Lightweight global state management (auth, feed, jobs) |
| `socket.io-client` | Real-time chat via WebSocket |
| `expo-image-picker` | Upload profile/post photos |
| `expo-secure-store` | Secure token storage |
| `react-native-safe-area-context` + `react-native-screens` | Required for navigation |
| `@expo/vector-icons` | Icons (Ionicons set) |
| `react-native-gesture-handler` | Gesture support (navigation) |
| `date-fns` | Human-readable timestamps |

---

### 2. Folder Structure

#### [NEW] `src/` directory (all new files below)

```
decp-mobile-app/
├── App.js                        ← Root navigator setup (replace existing)
├── src/
│   ├── config/
│   │   └── api.js                ← Axios instance (base URL, interceptors)
│   ├── store/
│   │   ├── authStore.js          ← Zustand: login/register/logout/token refresh
│   │   ├── feedStore.js          ← Zustand: posts feed state
│   │   └── notifStore.js         ← Zustand: notifications state
│   ├── services/
│   │   ├── authService.js        ← POST /api/auth/login|register|refresh|logout
│   │   ├── userService.js        ← GET/PUT /api/users/profile, GET /api/users
│   │   ├── postService.js        ← GET/POST/PUT/DELETE /api/content/posts/...
│   │   ├── jobService.js         ← GET/POST/PUT /api/content/jobs/...
│   │   ├── chatService.js        ← GET/POST /api/chat/conversations/...
│   │   └── notifService.js       ← GET/PUT /api/notifications/...
│   ├── navigation/
│   │   ├── AppNavigator.js       ← Root: Auth stack vs Main tabs (based on auth state)
│   │   ├── AuthStack.js          ← Login → Register
│   │   └── MainTabs.js           ← Bottom tab bar: Feed | Jobs | Chat | Notifs | Profile
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── feed/
│   │   │   ├── FeedScreen.js     ← List posts, like, infinite scroll
│   │   │   ├── PostDetailScreen.js ← Comments + like toggle
│   │   │   └── CreatePostScreen.js ← Text + optional image
│   │   ├── jobs/
│   │   │   ├── JobsScreen.js     ← List jobs, filter by type/mode
│   │   │   ├── JobDetailScreen.js ← Description + apply button
│   │   │   ├── CreateJobScreen.js ← Alumni/admin: post a job
│   │   │   └── MyApplicationsScreen.js ← Student: view own applications
│   │   ├── chat/
│   │   │   ├── ConversationsScreen.js
│   │   │   └── ChatScreen.js     ← Real-time messages via Socket.IO
│   │   ├── notifications/
│   │   │   └── NotificationsScreen.js
│   │   └── profile/
│   │       ├── ProfileScreen.js  ← View own/other user profile
│   │       ├── EditProfileScreen.js
│   │       └── NetworkScreen.js  ← Search/list users
│   └── components/
│       ├── PostCard.js           ← Reusable feed card
│       ├── JobCard.js            ← Reusable job listing card
│       ├── Avatar.js             ← Profile picture circle
│       ├── NotifItem.js          ← Single notification row
│       └── LoadingSpinner.js
```

---

### 3. API Config & Auth Layer

#### [NEW] `src/config/api.js`
- Creates an Axios instance with `baseURL = 'http://localhost:3000'` (dev)
- **Request interceptor**: attaches `Authorization: Bearer <accessToken>` from secure store
- **Response interceptor**: on 401, calls `/api/auth/refresh` endpoint, retries original request; on repeated failure, logs user out

#### [NEW] `src/store/authStore.js`
- Zustand store: `{ user, accessToken, isAuthenticated }`
- Actions: `login(email, password)`, `register(...)`, `logout()`, `loadStoredAuth()`
- Persists token to `expo-secure-store`

---

### 4. Screens & Features

#### Auth Screens
- **LoginScreen**: email + password form → calls `POST /api/auth/login` → sets auth store → navigates to Main tabs
- **RegisterScreen**: email, password, fullName, role (student/alumni) → calls `POST /api/auth/register`

#### Feed Screens
- **FeedScreen**: paginated list of posts (`GET /api/content/posts`), pull-to-refresh, like/unlike button, tap to open PostDetail
- **PostDetailScreen**: full post text + comments list, add comment (`POST /api/content/posts/:id/comments`)
- **CreatePostScreen**: text input + image picker, `POST /api/content/posts` – shown in FAB only to authenticated users

#### Jobs Screens
- **JobsScreen**: searchable + filterable list (`GET /api/content/jobs?type=&mode=`)
- **JobDetailScreen**: full job info, deadline badge, apply button (`POST /api/content/jobs/:id/apply`) for students; edit/delete for alumni/admin
- **CreateJobScreen**: form for alumni/admin to post new job (`POST /api/content/jobs`)
- **MyApplicationsScreen**: student view of own applications (`GET /api/content/jobs/applications/me`)

#### Chat Screens
- **ConversationsScreen**: list of existing conversations (`GET /api/chat/conversations`)
- **ChatScreen**: messages for a conversation (`GET /api/chat/conversations/:id/messages`), send via REST + real-time updates via **Socket.IO** connecting to `http://localhost:3004`

#### Notifications Screen
- List of notifications (`GET /api/notifications`), tap to mark as read (`PUT /api/notifications/:id/read`), bulk mark all read

#### Profile Screens
- **ProfileScreen**: own + other users' profiles
- **EditProfileScreen**: update fields via `PUT /api/users/profile`
- **NetworkScreen**: search users by name/skill (`GET /api/users?search=`)

---

### 5. Role-Based UI

| Feature | Student | Alumni | Admin |
|---|---|---|---|
| Apply to job | ✅ | ❌ | ❌ |
| Post a job | ❌ | ✅ | ✅ |
| Edit/delete any post | ❌ | ❌ | ✅ |
| My Applications tab | ✅ | ❌ | ❌ |

---

## Verification Plan

> [!NOTE]
> There are no existing automated tests in the `decp-mobile-app` folder. Verification will be done manually using Expo dev server + running backend.

### Prerequisites
1. Start all backend services (from the repo root):
   ```powershell
   # Terminal 1 – User Service (port 3001)
   cd user-service && node src/index.js
   # Terminal 2 – Content Service (port 3002)
   cd content-service && node src/index.js
   # Terminal 3 – Notification Service (port 3003)
   cd notification-service && node src/index.js
   # Terminal 4 – Chat Service (port 3004)
   cd chat-service && node src/index.js
   # Terminal 5 – API Gateway (port 3000)
   cd api-gateway && node src/index.js
   ```
2. Start Expo dev server:
   ```powershell
   cd decp-mobile-app && npx expo start
   ```
3. Open the app on Android emulator (press `a`) or iOS simulator (press `i`), or scan QR with Expo Go.

### Manual Test Cases

| # | Screen | Steps | Expected |
|---|---|---|---|
| 1 | Register | Open app → Register screen → fill details → submit | Lands on Feed screen, no error |
| 2 | Login | Logout → Login with same creds | JWT stored, user visible in Profile |
| 3 | Feed | Scroll feed | Posts appear with author name, like count |
| 4 | Like post | Tap ❤️ on a post | Like count increments; re-tap removes like |
| 5 | Create post | Tap FAB → fill text → submit | New post appears at top of feed |
| 6 | Jobs | Navigate to Jobs tab | Job cards with deadline badge appear |
| 7 | Apply (student) | Tap job → "Apply" | Success toast; My Applications shows new entry |
| 8 | Post job (alumni) | Role=alumni → Jobs → "Post Job" | New job appears in list |
| 9 | Chat | Open Conversations → tap conversation | Messages load; send a message; appears in real-time |
| 10 | Notifications | Navigate to Notifs tab | Unread notifications listed; tap marks as read |
| 11 | Edit Profile | Profile → Edit → change headline → save | Updated headline shown on profile |
| 12 | Token Refresh | Wait for access token expiry → perform any action | App silently refreshes token, action succeeds |
