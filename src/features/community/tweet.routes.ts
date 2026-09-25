import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  getTweets,
  getTweetById,
  updateTweet,
  addTweetReply,
} from "./tweet.controller.js";
import {
  verifyJWT,
  optionalVerifyJWT,
} from "../../shared/middlewares/auth.middleware.js";
import { upload } from "../../shared/middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .post(verifyJWT, upload.single("image"), createTweet)
  .get(optionalVerifyJWT, getTweets);
router.route("/user/:userId").get(optionalVerifyJWT, getUserTweets);
router.route("/reply/:tweetId").post(verifyJWT, addTweetReply);
router.route("/post/:tweetId").get(optionalVerifyJWT, getTweetById);
router
  .route("/:tweetId")
  .patch(verifyJWT, updateTweet)
  .delete(verifyJWT, deleteTweet);

export default router;
