import express from "express";
import { toggleVote } from "../controllers/vote.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const voteRouter = express.Router();

voteRouter.post("/toggleVote/:type/:typeId",verifyJWT, toggleVote);

export default voteRouter;
