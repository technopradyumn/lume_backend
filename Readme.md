<div align="center">
  <img src="public/assets/lume-logo.png" alt="Lume Logo" width="160" />
  <h1>Lume</h1>
  <p><strong>A Modern Video Streaming & Social Interaction Backend</strong></p>

  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)
</div>

---

## 📽️ About Lume

Lume is a robust, production-ready backend solution designed for video streaming platforms. It combines-industry standard practices with a scalable architecture, offering features range from secure user authentication to complex video processing and social interaction layers (Comments, Likes, Tweets, Playlists).

Built with the **MERN** secondary stack (MongoDB, Express, Node), Lume focuses on performance, security, and developer experience.

## ✨ Key Features

### 👤 User Management
- **Security**: Password hashing with `Bcrypt` and state-of-the-art `JWT` authentication.
- **Profiles**: Customizable avatars and cover images (integrated with Cloudinary).
- **History**: Intelligent tracking of user "Watch History" and "Channel Profiles".

### 📹 Video Infrastructure
- **Streaming**: High-performance video uploads and management.
- **Control**: Toggle publish status, intelligent search, and pagination.
- **Engagement**: Fully featured Like and Comment systems on every video.

### 🐦 Social Interaction
- **Tweets**: Integrated platform for short-form social posts (Tweets).
- **Playlists**: User-generated video collections with dynamic updates.
- **Subscriptions**: Real-time channel subscription tracking and management.

### 🛡️ Core Utilities
- **Centralized Error Handling**: Custom `ApiError` and `ApiResponse` wrappers.
- **Middleware**: Robust `auth`, `multer` (file handling), and `asyncHandler` logic.
- **Security Headers**: `Helmet` integration for enhanced protection.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **File Management**: Cloudinary & Multer
- **Validation/Security**: Bcrypt, JWT, Helmet
- **Logging**: Morgan

## 📂 Project Structure

```text
src/
├── controllers/          # Business logic for every route
├── db/                   # Database connection configuration
├── middlewares/          # Authentication, file upload, and validation
├── models/               # Mongoose schemas (User, Video, Tweet, etc.)
├── routes/               # API endpoint definitions
├── utils/                # Standardized helpers (Cloudinary, Async, Errors)
├── app.js                # Express app configuration
└── index.js              # Entry point & server listener
```

## 🛠️ Installation & Setup

### 1. Prerequisite
- Node.js (v16.x or higher)
- MongoDB Atlas account or local installation
- Cloudinary account (for media storage)

### 2. Clone and Install
```bash
git clone <your-repo-url>
cd Lume
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and populate it with the following (check `.env.sample` for reference):

```env
PORT=8000
MONGODB_URI=mongodb+srv://your_uri
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 4. Run the Server
```bash
npm run dev
```

## 📡 API Overview (Summary)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/users/register` | `POST` | Register a new user with files |
| `/api/v1/users/login` | `POST` | Authenticate and get JWT |
| `/api/v1/videos` | `GET/POST` | Fetch/Upload videos |
| `/api/v1/tweets` | `POST/GET` | Social interaction module |
| `/api/v1/subscriptions` | `GET` | Channel management |

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## ⚖️ License

Distributed under the **ISC License**. See `LICENSE` for more information.

---
<div align="center">
  Developed with ❤️ by <a href="https://github.com/technopradyumn">Pradyumn</a>
</div>