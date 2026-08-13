import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.set("trust proxy", 1);

const normalizePublicMediaUrls = (value) => {
  if (typeof value === "string") {
    return value.replace(
      /^http:\/\/lume-backend-cggh\.onrender\.com\//,
      "https://lume-backend-cggh.onrender.com/"
    );
  }

  if (Array.isArray(value)) {
    return value.map(normalizePublicMediaUrls);
  }

  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value.toHexString === "function") {
    return value.toHexString();
  }

  if (value && typeof value.toObject === "function") {
    return normalizePublicMediaUrls(value.toObject());
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizePublicMediaUrls(item)])
    );
  }

  return value;
};

app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use((req, res, next) => {
  const sendJson = res.json.bind(res);
  res.json = (body) => sendJson(normalizePublicMediaUrls(body));
  next();
});

import userRouter from "./features/auth/user.routes.js";
import tweetRouter from "./features/community/tweet.routes.js";
import subscriptionRouter from "./features/subscriptions/subscription.routes.js";
import videoRouter from "./features/videos/video.routes.js";
import commentRouter from "./features/comments/comment.routes.js";
import likeRouter from "./features/likes/like.routes.js";
import dashboardRouter from "./features/users/dashboard.routes.js";
import notificationRouter from "./features/notifications/notification.routes.js";
import savedVideosRouter from "./features/saved-videos/saved-video.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use("/api/v1/saved-videos", savedVideosRouter);

import { ApiError } from "./shared/utils/ApiError.js";

app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: [],
    data: null,
  });
});

export { app };
