import express from "express";
import {
  createComment,
  editComment,
  getAllComment,
  getComment,
  deleteComment,
  getMyComments,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";

const commentRouter = express.Router();

// FIXED: Define the route twice instead of using the '?' syntax to avoid path-to-regexp crashes.
commentRouter.post("/postComment/:postId", verifyJWT, createComment);
commentRouter.post("/postComment/:postId/:ParentcommentId", verifyJWT, createComment);

commentRouter.get("/getComment/:commentId", getComment);
commentRouter.get("/getAllComment/:postId", getAllComment);
commentRouter.get("/myComments", verifyJWT, getMyComments);
commentRouter.put("/editComment/:postId/:commentId", verifyJWT, editComment);
commentRouter.delete("/deleteComment/:commentId", verifyJWT, deleteComment);

export default commentRouter;