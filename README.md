# Lume Backend

Current service release: **1.1.0** · API namespace: **v1**

The REST API powering Lume, a full-stack video platform for creators, viewers, and community interaction. It is built with Node.js, Express, MongoDB, Mongoose, JWT authentication, Multer uploads, and Supabase Storage.

## Stack

| Area | Technology | Purpose |
| --- | --- | --- |
| Runtime and API | Node.js, Express 5 | REST endpoints and middleware pipeline |
| Database | MongoDB, Mongoose | Document storage, schemas, relationships, and queries |
| Authentication | JWT, bcrypt, cookie-parser | Access authorization, refresh sessions, and secure passwords |
| Uploads | Multer | Multipart upload handling for videos and images |
| Media storage | Supabase Storage | Hosted video, thumbnail, avatar, and post-image URLs |
| Middleware | CORS, Helmet, Morgan, custom auth middleware | Browser access, security headers, logging, and protected routes |
| Reliability | `ApiError`, `ApiResponse`, `asyncHandler` | Consistent API errors and asynchronous controller handling |

## API modules

| Module | Base path | Responsibility |
| --- | --- | --- |
| Users and auth | `/api/v1/users` | Registration, login, sessions, profiles, avatars, history |
| Videos | `/api/v1/videos` | Discovery, search, upload, playback metadata, and views |
| Comments | `/api/v1/comments` | Video discussion |
| Likes | `/api/v1/likes` | Video, comment, and community-post likes |
| Community | `/api/v1/tweets` | Posts, replies, media, and reporting |
| Subscriptions | `/api/v1/subscriptions` | Channel following |
| Saved videos | `/api/v1/saved-videos` | Watch Later library |
| Notifications | `/api/v1/notifications` | User notification state |
| Dashboard | `/api/v1/dashboard` | Creator analytics and video management |
| Version metadata | `/api/version` or `/api/v1` | Service and API compatibility versions |

## Release versioning

This service follows Semantic Versioning and GitFlow release branches, for
example `release/1.1.0`. Existing API clients remain on the
stable `/api/v1` namespace until an intentionally incompatible API revision is
introduced. Run `npm run version:check` before publishing a release. See
[`VERSIONING.md`](./VERSIONING.md) for the complete policy.

## Architecture

```text
src/
|-- features/       # Routes, controllers, and models by business domain
|-- shared/
|   |-- middlewares/ # JWT auth and Multer upload handling
|   `-- utils/       # Supabase, API responses/errors, async handling
|-- db/              # MongoDB connection
|-- app.js           # Express middleware and route registration
`-- index.js         # Environment loading and server startup
```

Request flow: **route -> auth/upload middleware -> controller -> Mongoose or Supabase -> standardized JSON response**.

## Run locally

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- MongoDB Atlas or local MongoDB
- A Supabase project with a storage bucket for uploads

### Installation

```bash
git clone https://github.com/technopradyumn/lume_backend.git
cd lume_backend
npm install
```

Create `.env` from the sample file.

**Windows PowerShell**

```powershell
Copy-Item .env.sample .env
```

**macOS / Linux**

```bash
cp .env.sample .env
```

Set valid values in `.env`:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>
CORS_ORIGIN=<frontend-origin>
ACCESS_TOKEN_SECRET=<long-random-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<different-long-random-secret>
REFRESH_TOKEN_EXPIRY=10d
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
```

Start the API:

```bash
npm run dev
```

### Render deployment

For Render, create a **Web Service** and use the following commands:

```text
Build Command: npm install
Start Command: npm start
```

`npm start` runs Node directly and does not depend on Nodemon, which is a local development dependency.

## Media upload behavior

Multer receives uploaded files before controllers process metadata. When Supabase is configured, the API uploads video and image assets to Supabase Storage and persists their URLs in MongoDB. In local development without configured Supabase credentials, temporary files are served from the backend public directory as a fallback.

For production uploads, configure `SUPABASE_SERVICE_ROLE_KEY` in the backend host environment. This server-only key allows the API to upload to the configured Storage buckets; never expose it in frontend code or commit it to Git.

## Security notes

- Do not commit `.env`; it is excluded by `.gitignore`.
- Use long, unique JWT secrets in every environment.
- Restrict `CORS_ORIGIN` to your deployed frontend domain in production.
- Serve production traffic over HTTPS.

## Related repositories

- [Lume frontend](https://github.com/technopradyumn/lume_frontend)
- [Lume Flutter app](https://github.com/technopradyumn/lume_app)

## License

ISC
