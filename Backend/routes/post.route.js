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
postRouter.get("/singlePost/:id", getOnePost);
postRouter.get("/allPost", getAllPost);
postRouter.delete("/deletPost/:id", verifyJWT, deletePost);
postRouter.put(
  "/editPost/:id",
  verifyJWT,
  upload.single("postImage"),
  editPost,
);

export default postRouter;
