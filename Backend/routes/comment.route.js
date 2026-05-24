import express from "express";
import {
  createComment,
  editComment,
  getAllComment,
  getComment,
  deleteComment, // FIXED: Added missing import
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const commentRouter = express.Router();

commentRouter.post(
  "/postComment/:postId{/:ParentcommentId}",
  verifyJWT,
  createComment,
);

commentRouter.get("/getComment/:commentId", getComment);
commentRouter.get("/getAllComment/:postId", getAllComment);

commentRouter.put("/editComment/:postId/:commentId", verifyJWT, editComment);

commentRouter.put("/deleteComment/:commentId", verifyJWT, deleteComment);

export default commentRouter;
