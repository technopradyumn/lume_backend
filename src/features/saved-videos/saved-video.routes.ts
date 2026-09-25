import { Router } from "express";
import { verifyJWT } from "../../shared/middlewares/auth.middleware.js";
import { getSavedVideos, toggleSavedVideo } from "./saved-video.controller.js";

const router = Router();

router.use(verifyJWT);
router.route("/").get(getSavedVideos);
router.route("/:videoId").patch(toggleSavedVideo);

export default router;
