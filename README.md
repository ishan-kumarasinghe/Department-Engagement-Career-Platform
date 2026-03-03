# Department-Engagement-Career-Platform

# DECP Microservices — Database Schemas (MongoDB + Mongoose)

This document describes the **MongoDB data model** used for the DECP mini project under a **microservices architecture**.

✅ Goal: Keep services **independently deployable** and **data-owned** (no service directly reads/writes another service’s collections).

---

## Architecture Rule: Database Ownership

- Each microservice owns its **own database** (recommended), or at least its own **collections**.
- Other services must access data **only through APIs or events**, not by querying the DB directly.

Recommended DB split (same MongoDB cluster is OK):
- `decp_user_db`
- `decp_content_db`
- `decp_notification_db`
- `decp_chat_db`

---

## 1) User Service — `decp_user_db`

### Collections
- `users`
- `refresh_tokens` (recommended)
- `connections` (optional)

### `users` — Purpose
Stores authentication + profile + role details.

**Key fields**
- `email` (unique)
- `passwordHash`
- `role`: `student | alumni | admin`
- `name`, `username` (optional unique)
- `headline`, `about`
- `profilePicUrl`, `coverPicUrl`
- `batchYear`, `graduationYear`
- `skills[]`, `links[]`
- `isActive`
- `createdAt`, `updatedAt`

**Indexes**
- unique `email`
- unique `username` (sparse)
- text index for searching: `name`, `headline`, `about`, `skills`

---

### `refresh_tokens` — Purpose (Recommended)
Supports secure long sessions using refresh tokens.

**Key fields**
- `userId`
- `tokenHash` (store hash, not raw token)
- `expiresAt` (TTL index auto deletes expired tokens)
- `revokedAt`
- `deviceInfo` (optional)

**Index**
- TTL on `expiresAt`

---

### `connections` (Optional) — Purpose
LinkedIn-like connection requests.

**Key fields**
- `requesterId`
- `receiverId`
- `status`: `pending | accepted | blocked`

**Index**
- unique `{ requesterId, receiverId }` to prevent duplicates

---

## 2) Content Service (Posts + Jobs + Media) — `decp_content_db`

This service combines:
- Feed posts (text + media uploads)
- Likes, comments
- Job postings and job applications

### Collections
- `posts`
- `post_likes`
- `post_comments`
- `jobs`
- `job_applications`
- `media_assets` (optional, reusable uploads)

---

### `posts` — Purpose
Stores feed posts with media and counters.

**Key fields**
- `authorId`
- `text`
- `media[]` (embedded media objects)
- `visibility`: `public | dept | connections`
- `tags[]` (optional)
- denormalized counters: `likeCount`, `commentCount`, `shareCount`
- `authorSnapshot` (optional, helps build feed without calling User service)
- `createdAt`, `updatedAt`

**Indexes**
- `{ createdAt: -1 }` (feed)
- `{ authorId: 1, createdAt: -1 }`

---

### `post_likes` — Purpose
Prevents duplicate likes and supports unlike.

**Key fields**
- `postId`
- `userId`
- `createdAt`

**Indexes**
- unique `{ postId, userId }`

---

### `post_comments` — Purpose
Stores comments and replies under a post.

**Key fields**
- `postId`
- `userId`
- `text`
- `parentCommentId` (nullable for threaded replies)
- `createdAt`, `updatedAt`

**Index**
- `{ postId: 1, createdAt: 1 }`

---

### `jobs` — Purpose
LinkedIn-like job and internship postings.

**Key fields**
- `postedById`
- `companyName`, `title`
- `type`: `internship | fulltime | parttime | contract`
- `mode`: `remote | onsite | hybrid`
- `location`
- `description`, `requirements[]`
- `deadline`
- `status`: `open | closed`
- `applyUrl` (optional external link)
- `media[]` (logo/banner optional)
- denormalized: `applicationCount`
- `postedBySnapshot` (optional)
- `createdAt`, `updatedAt`

**Indexes**
- `{ createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`
- text index: `title`, `companyName`, `description`

---

### `job_applications` — Purpose
Tracks each student/alumni application for a job post.

**Key fields**
- `jobId`
- `applicantId`
- `resumeUrl` (optional)
- `coverLetter` (optional)
- `status`: `submitted | reviewing | accepted | rejected`
- `createdAt`, `updatedAt`

**Indexes**
- unique `{ jobId, applicantId }` (one application per job per user)
- `{ applicantId: 1, createdAt: -1 }`
- `{ jobId: 1, createdAt: -1 }`

---

### `media_assets` (Optional) — Purpose
Reusable storage for uploaded assets (works for posts/jobs/doc links).

**Key fields**
- `ownerId`
- `url`, `type`, `mime`, `size`
- `meta` (width/height/duration/thumb)
- `linkedTo` (`post|job`, entityId)
- `createdAt`

---

## 3) Notification Service — `decp_notification_db`

### Collections
- `notifications`
- `notification_preferences` (optional)
- `device_tokens` (optional for push)

---

### `notifications` — Purpose
In-app notification inbox for web/mobile.

**Key fields**
- `userId` (receiver)
- `type` (e.g., `POST_LIKED`, `COMMENT_ADDED`, `JOB_APPLIED`, `MESSAGE_RECEIVED`, etc.)
- `title`, `body`
- `data` (deep link payload: `{ postId, jobId, conversationId, senderId, ... }`)
- `isRead`, `readAt`
- `createdAt`

**Indexes**
- `{ userId: 1, createdAt: -1 }`
- `{ userId: 1, isRead: 1, createdAt: -1 }`

---

### `notification_preferences` (Optional) — Purpose
Controls notification channels and muted types.

**Key fields**
- `userId` (unique)
- `channels`: `{ inApp, push, email }`
- `mutedTypes[]`

---

### `device_tokens` (Optional) — Purpose
Stores FCM/APNS/web push tokens for push notifications.

**Key fields**
- `userId`
- `platform`: `android | ios | web`
- `token`
- `isActive`

**Index**
- unique `{ token }`

---

## 4) Chat Service — `decp_chat_db`

### Collections
- `conversations`
- `messages`
- `message_receipts` (optional)

---

### `conversations` — Purpose
Stores direct chats and group chats.

**Key fields**
- `type`: `direct | group`
- `memberIds[]`
- `title` (groups only)
- `createdById`
- `directKey` (optional unique key for direct chat, e.g., `"minId:maxId"`)
- `lastMessageId`, `lastMessageAt`
- `createdAt`, `updatedAt`

**Indexes**
- `{ memberIds: 1, lastMessageAt: -1 }`
- unique `directKey` (sparse) for direct chat uniqueness

---

### `messages` — Purpose
Stores message history per conversation.

**Key fields**
- `conversationId`
- `senderId`
- `text`
- `attachments[]` (optional: image/video/doc)
- `replyToMessageId` (optional)
- `editedAt`, `deletedAt`
- `createdAt`

**Indexes**
- `{ conversationId: 1, createdAt: 1 }` (fast paging / scrolling)
- `{ senderId: 1, createdAt: -1 }` (optional)

---

### `message_receipts` (Optional) — Purpose
Stores delivered/read per user per message.

**Key fields**
- `messageId`
- `userId`
- `deliveredAt`, `readAt`

**Indexes**
- unique `{ messageId, userId }`

---

## Cross-Service Data Linking (IMPORTANT)

- Services store references as IDs (`userId`, `postId`, etc.).
- Services DO NOT query other service databases.
- If Content needs author info:
  1) Call User service API, OR
  2) Store small `authorSnapshot` inside Post/Job at creation time.

This keeps microservices decoupled while still enabling fast feed rendering.

---

## Notes for Demo / MVP (2-week plan)
Minimum required collections to ship:
- User: `users`
- Content: `posts`, `post_likes`, `post_comments`, `jobs`, `job_applications`
- Notification: `notifications`
- Chat: `conversations`, `messages`

Optional extras if time permits:
- User `refresh_tokens`, `connections`
- Notification preferences + device tokens
- Chat receipts

---

✅ If you want, I can also add:
- sample documents (JSON examples) for each collection
- migration/seed scripts for test data (students/alumni/admin + demo posts/jobs)
- endpoint list that maps directly to these schemas
