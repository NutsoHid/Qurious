import { verifyJWT } from "../Middlewares/auth.middleware.js";
import express from "express";
import {
  getOnePost,
  getAllPost,
  uploadPost,
  deletePost,
  editPost,
} from "../controllers/post.controller.js";

const postRouter = express.Router();

postRouter.post("/upload", verifyJWT, uploadPost);
postRouter.get("/singlePost/:id", verifyJWT, getOnePost);
postRouter.get("/allPost", verifyJWT, getAllPost);
postRouter.delete("/deletPost/:id", verifyJWT, deletePost);
postRouter.put("/editPost/:id", verifyJWT, editPost);

export default postRouter;
