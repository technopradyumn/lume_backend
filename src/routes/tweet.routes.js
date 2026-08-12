import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  getTweets,
  updateTweet,
  addTweetReply,
} from "../controllers/tweet.controller.js";
import {
  verifyJWT,
  optionalVerifyJWT,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, upload.single("image"), createTweet)
  .get(optionalVerifyJWT, getTweets);
router.route("/user/:userId").get(optionalVerifyJWT, getUserTweets);
router.route("/reply/:tweetId").post(verifyJWT, addTweetReply);
router
  .route("/:tweetId")
  .patch(verifyJWT, updateTweet)
  .delete(verifyJWT, deleteTweet);

export default router;
