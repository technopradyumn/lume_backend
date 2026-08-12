import { Router } from "express";
import {
  getNotifications,
  markNotificationsAsRead,
} from "./notification.controller.js";
import { verifyJWT } from "../../shared/middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(getNotifications);
router.route("/read").post(markNotificationsAsRead);

export default router;
