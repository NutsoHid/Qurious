import express from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { followRequest } from "../controllers/follow.controller.js";

const followRouter = express.Router();

followRouter.post("/followRequest/:targetId", verifyJWT, followRequest);

export default followRouter;
