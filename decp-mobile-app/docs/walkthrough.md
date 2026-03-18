# DECP Mobile App – Build Walkthrough

## What Was Built

A complete **React Native / Expo SDK ~55** mobile app for the Department Engagement & Career Platform, connecting to the existing backend via the API Gateway on `http://localhost:3000`.

---

## Files Created

### Root
- `App.js` – Entry point, loads stored auth, fetches notifications

### `src/config/`
- `api.js` – Axios instance, JWT auth interceptors, silent token refresh on 401

### `src/store/`
- `authStore.js` – Login/register/logout with SecureStore persistence
- `feedStore.js` – Paginated post feed state
- `notifStore.js` – Notifications with badge count

### `src/services/`
| File | Endpoints |
|---|---|
| `authService.js` | `POST /api/auth/login\|register\|refresh\|logout` |
| `userService.js` | `GET/PUT/DELETE /api/users/profile`, `GET /api/users` |
| `postService.js` | `GET/POST/PUT/DELETE /api/content/posts/*` |
| `jobService.js` | `GET/POST/PUT/DELETE /api/content/jobs/*` |
| `chatService.js` | `GET/POST /api/chat/conversations/*` |
| `notifService.js` | `GET/PUT/DELETE /api/notifications/*` |

### `src/navigation/`
- `AppNavigator.js` – Switches Auth vs Main stack based on `isAuthenticated`
- `AuthStack.js` – Login → Register
- `MainTabs.js` – 5-tab bottom nav: Home | Jobs | Messages | Alerts | Profile

### `src/components/`
- `PostCard.js` – Feed post row with like/comment actions
- `JobCard.js` – Job listing with type/mode chips and deadline
- `Avatar.js` – Image or colored-initials fallback
- `NotifItem.js` – Notification row with unread highlight
- `LoadingSpinner.js` – Full-screen or overlay spinner

### `src/screens/` (15 screens)

#### Auth
- `LoginScreen.js` – Email/password form with show/hide password
- `RegisterScreen.js` – Registration with role picker (student/alumni)

#### Feed
- `FeedScreen.js` – Paginated posts, pull-to-refresh, like toggle, FAB
- `PostDetailScreen.js` – Full post + comments + add comment
- `CreatePostScreen.js` – Text, tags, audience visibility selector

#### Jobs
- `JobsScreen.js` – Searchable list, type filter chips, role-based FAB
- `JobDetailScreen.js` – Full job info, apply (student) or edit/delete (alumni/admin)
- `CreateJobScreen.js` – Full job posting form for alumni/admin
- `MyApplicationsScreen.js` – Student view of own applications with status badge

#### Chat & Notifications
- `ConversationsScreen.js` – List of conversations with last message preview
- `ChatScreen.js` – Real-time messages via Socket.IO + REST history
- `NotificationsScreen.js` – Notification list with bulk mark-all-read

#### Profile
- `ProfileScreen.js` – Own or other user's profile with avatar, skills, bio, Message button
- `EditProfileScreen.js` – All User model fields editable
- `NetworkScreen.js` – Search users by name/skill, filter by role, quick-start chat

---

## How to Run

### 1. Start backend services (from project root)
```powershell
# In separate terminals:
cd user-service         && node src/index.js  # port 3001
cd content-service      && node src/index.js  # port 3002
cd notification-service && node src/index.js  # port 3003
cd chat-service         && node src/index.js  # port 3004
cd api-gateway          && node src/index.js  # port 3000
```

### 2. Start Expo dev server
```powershell
cd decp-mobile-app
npx expo start
```
Press `a` for Android emulator, `i` for iOS simulator, or scan the QR with Expo Go.

> [!IMPORTANT]
> If testing on a **physical device**, update `API_BASE_URL` in `src/config/api.js` from `localhost` to your machine's LAN IP (e.g. `http://192.168.1.x:3000`).

---

## Installed Dependencies

| Package | Purpose |
|---|---|
| `@react-navigation/native` + stack + tabs | Screen navigation |
| `axios` | HTTP API calls |
| `zustand` | Global state (auth, feed, notifs) |
| `expo-secure-store` | Secure JWT token storage |
| `socket.io-client` | Real-time chat |
| `@expo/vector-icons` | Ionicons icon set |
| `react-native-gesture-handler` | Gesture support |
| `react-native-safe-area-context` + `react-native-screens` | Navigation prerequisites |
| `date-fns` | Human-readable timestamps |

---

## Role-Based Feature Access

| Feature | Student | Alumni | Admin |
|---|---|---|---|
| View Feed / Posts | ✅ | ✅ | ✅ |
| Create Post | ✅ | ✅ | ✅ |
| Apply to Job | ✅ | ❌ | ❌ |
| My Applications | ✅ | ❌ | ❌ |
| Post a Job | ❌ | ✅ | ✅ |
| Edit/Delete Job | ❌ | ✅ (own) | ✅ |
| Real-time Chat | ✅ | ✅ | ✅ |
