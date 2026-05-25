import express from "express";
import { toggleVote } from "../controllers/vote.controller.js";

const voteRouter = express.Router();

voteRouter.post("/toggleVote/:type/:typeId", toggleVote);

export default voteRouter;
