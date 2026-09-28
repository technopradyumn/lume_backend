<div align="center">

# ⚙️ Lume Backend

**The REST API powering Lume — a full-stack video platform for creators, viewers, and communities.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)](https://mongoosejs.com/)
[![Supabase](https://img.shields.io/badge/Storage-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=flat-square&logo=render)](https://render.com/)
[![Version](https://img.shields.io/badge/version-1.1.0-brightgreen?style=flat-square)](./CHANGELOG.md)

[Frontend Repo](https://github.com/technopradyumn/lume_frontend) · [API Docs](#-api-reference) · [Report Bug](https://github.com/technopradyumn/lume_backend/issues)

</div>

---

## ✨ Overview

Lume Backend is a production-grade REST API built with **Node.js**, **Express 5**, and **TypeScript**. It handles authentication, video management, community features, media uploads to Supabase Storage, and persistent data storage via MongoDB — all following a clean feature-driven architecture.

---

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Runtime** | Bun + Node.js 18+ | Fast script execution and server runtime |
| **Framework** | Express 5 | REST API routing and middleware pipeline |
| **Language** | TypeScript 5.7 | Type-safe backend code |
| **Database** | MongoDB + Mongoose 9 | Document storage, schemas, and relationships |
| **Authentication** | JWT + bcrypt + cookie-parser | Access tokens, refresh sessions, and secure passwords |
| **File Uploads** | Multer 2 | Multipart form-data handling |
| **Media Storage** | Supabase Storage | Hosted video, thumbnail, avatar, and image URLs |
| **Security** | Helmet + CORS | Security headers and cross-origin configuration |
| **Logging** | Morgan | HTTP request logging |
| **Email** | Nodemailer | Transactional emails (password reset, etc.) |
| **Deployment** | Render | Cloud hosting with auto-deploy from GitHub |

---

## 📡 API Reference

Base URL: `https://lume-backend-cggh.onrender.com`

All protected routes require an `Authorization: Bearer <access_token>` header.

| Module | Base Path | Responsibility |
|---|---|---|
| **Auth & Users** | `/api/v1/users` | Register, login, logout, refresh token, profile, avatar, watch history |
| **Videos** | `/api/v1/videos` | Upload, browse, search, stream metadata, view count, delete |
| **Comments** | `/api/v1/comments` | Add, edit, delete video comments |
| **Likes** | `/api/v1/likes` | Toggle likes on videos, comments, and community posts |
| **Community** | `/api/v1/tweets` | Create, read, update, delete community posts and replies |
| **Subscriptions** | `/api/v1/subscriptions` | Follow/unfollow channels, get subscriber list |
| **Saved Videos** | `/api/v1/saved-videos` | Save/unsave videos (Watch Later) |
| **Notifications** | `/api/v1/notifications` | Fetch, mark as read, manage notification state |
| **Dashboard** | `/api/v1/dashboard` | Creator analytics, video stats, channel overview |
| **Search** | `/api/v1/search` | Cross-module full-text search |
| **Version** | `/api/version` or `/api/v1` | Service version and API compatibility metadata |

---

## 🗂️ Project Structure

```
src/
├── features/                   # Business domain modules
│   ├── auth/                   # User model, controller, routes
│   ├── videos/                 # Video model, controller, routes
│   ├── comments/               # Comment model, controller, routes
│   ├── likes/                  # Like model, controller, routes
│   ├── community/              # Tweet (post) model, controller, routes
│   ├── subscriptions/          # Subscription model, controller, routes
│   ├── saved-videos/           # Saved video model, controller, routes
│   ├── notifications/          # Notification model, controller, routes
│   ├── users/                  # Dashboard controller, routes
│   ├── search/                 # Search controller, routes
│   └── playlists/              # Playlist module
├── shared/
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT verification middleware
│   │   └── multer.middleware.ts # File upload middleware
│   ├── utils/
│   │   ├── ApiError.ts         # Standardised error class
│   │   ├── ApiResponse.ts      # Standardised success response
│   │   ├── asyncHandler.ts     # Async route error wrapper
│   │   ├── supabase.ts         # Supabase Storage client
│   │   └── mailer.ts           # Nodemailer email utility
│   └── config/
│       └── version.ts          # Version metadata
├── db/
│   └── index.ts                # MongoDB connection
├── app.ts                      # Express app, middleware & route registration
└── index.ts                    # Entry point — env loading & server startup
```

**Request flow:**
```
Request → Route → Auth/Upload Middleware → Controller → Mongoose / Supabase → Standardised JSON Response
```

---

## ⚙️ Getting Started

### Prerequisites

- **Bun** 1.2+ (used for dev and scripts) — or Node.js 18+
- **MongoDB Atlas** account (or local MongoDB)
- **Supabase** project with a storage bucket

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/technopradyumn/lume_backend.git
cd lume_backend

# 2. Install dependencies
npm install
```

### Environment Setup

Copy the sample environment file:

```powershell
# Windows PowerShell
Copy-Item .env.sample .env
```

```bash
# macOS / Linux
cp .env.sample .env
```

Fill in `.env` with your values:

```env
# Server
PORT=8000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>

# CORS — set to your frontend origin
CORS_ORIGIN=http://localhost:3000

# JWT — use long, unique secrets in production
ACCESS_TOKEN_SECRET=<your-long-random-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-different-long-random-secret>
REFRESH_TOKEN_EXPIRY=10d

# Supabase Storage
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
```

### Start the server

```bash
# Development (with hot reload via Bun)
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:8000`.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with Bun hot-reload (`--watch`) |
| `npm start` | Start in production (no watcher) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run version:check` | Validate version consistency before release |

---

## ☁️ Deployment (Render)

The API is deployed on **Render** as a Web Service.

### Render configuration

| Setting | Value |
|---|---|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Runtime** | Node.js |
| **Auto-deploy** | On push to `main` |

Add all variables from your `.env` file as **Environment Variables** in the Render dashboard.

> `npm start` runs Node directly — no Nodemon, which is a dev-only dependency.

---

## 📤 Media Upload Behaviour

1. **Multer** receives the file from the multipart request before the controller runs
2. The file is uploaded to **Supabase Storage** and a public URL is returned
3. The URL is saved to **MongoDB** alongside the document metadata
4. In local development without Supabase credentials, uploaded files fall back to the `public/` directory

> ⚠️ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code or commit it to Git. It is a server-only key.

---

## 🔒 Security Checklist

- ✅ `.env` is excluded by `.gitignore` — never commit secrets
- ✅ Use long, unique JWT secrets in every environment
- ✅ Restrict `CORS_ORIGIN` to your deployed frontend domain in production
- ✅ Serve all traffic over HTTPS in production
- ✅ Helmet is configured to set secure HTTP headers on all responses

---

## 📋 Versioning

This service follows **Semantic Versioning** and a **GitFlow** branching strategy (e.g. `release/1.1.0`).

- Existing API clients remain on the stable `/api/v1` namespace
- Breaking changes increment the major version and introduce a new namespace
- Run `npm run version:check` before publishing a release
- See [`VERSIONING.md`](./VERSIONING.md) for the full policy

---

## 🔗 Related Repositories

| Repo | Description |
|---|---|
| [lume_frontend](https://github.com/technopradyumn/lume_frontend) | Next.js 15 web client |
| [lume_app](https://github.com/technopradyumn/lume_app) | Flutter mobile app |

---

## 📄 License

ISC © [Pradyumn](https://github.com/technopradyumn)
