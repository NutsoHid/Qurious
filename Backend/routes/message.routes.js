import express from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const messageRouter = express.Router();

messageRouter.get("/history/:targetUserId", verifyJWT, getMessages);

messageRouter.post("/send/:receiverId", verifyJWT, sendMessage);

export default messageRouter;
