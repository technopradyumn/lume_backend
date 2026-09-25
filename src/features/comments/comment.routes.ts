import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "./comment.controller.js";
import {
  verifyJWT,
  optionalVerifyJWT,
} from "../../shared/middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").get(optionalVerifyJWT, getVideoComments);

router.use(verifyJWT);

router.route("/:videoId").post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;
