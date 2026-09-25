import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "./subscription.controller.js";
import { verifyJWT } from "../../shared/middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/c/:subscriberId").get(getSubscribedChannels);
router.route("/u/:channelId").get(getUserChannelSubscribers);
router.route("/toggle/:channelId").post(toggleSubscription);

export default router;
