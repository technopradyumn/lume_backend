import { Router } from "express";
import { optionalVerifyJWT } from "../../shared/middlewares/auth.middleware.js";
import { search } from "./search.controller.js";

const router = Router();

router.route("/").get(optionalVerifyJWT, search);

export default router;
