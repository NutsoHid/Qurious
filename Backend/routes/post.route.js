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
postRouter.get("/singlePost", verifyJWT, getOnePost);
postRouter.get("/allPost", verifyJWT, getAllPost);
postRouter.delete("/deletPost", verifyJWT, deletePost);
postRouter.put("/editPost", verifyJWT, editPost);

export default postRouter;
