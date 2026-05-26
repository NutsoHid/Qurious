import express from "express";
// 👇 Notice 'toggleLike' is now added to this list!
import { getOnePost, getAllPost, uploadPost, deletePost, editPost, toggleLike } from "../controllers/post.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.js";

const postRouter = express.Router();

postRouter.post("/upload", verifyJWT, upload.single("postImage"), uploadPost);
postRouter.get("/singlePost/:postId", getOnePost);
postRouter.get("/allPost", getAllPost);
postRouter.delete("/deletePost/:postId", verifyJWT, deletePost);
postRouter.put("/editPost/:postId", verifyJWT, upload.single("postImage"), editPost);

// Our new Like route
postRouter.post("/like/:postId", verifyJWT, toggleLike);

export default postRouter;