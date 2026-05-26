import express from "express";
import {
  getOnePost,
  getAllPost,
  uploadPost,
  deletePost,
  editPost,
} from "../controllers/post.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.js";

const postRouter = express.Router();

postRouter.post("/upload", verifyJWT, upload.single("postImage"), uploadPost);

postRouter.get("/singlePost/:postId", getOnePost);
postRouter.get("/allPost", getAllPost);
postRouter.delete("/deletPost/:postId", verifyJWT, deletePost);
postRouter.put(
  "/editPost/:postId",
  verifyJWT,
  upload.single("postImage"),
  editPost,
);

export default postRouter;
