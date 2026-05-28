import express from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { adminMiddleware } from "../Middlewares/admin.middleware.js";
import { getAllUsers, getUserProfile } from "../controllers/user.controller.js";
import {
  deletePost,
  getAllPost,
  getOnePost,
  uploadPost,
} from "../controllers/post.controller.js";
import {
  createComment,
  deleteComment,
  editComment,
  getAllComment,
  getComment,
} from "../controllers/comment.controller.js";
import { upload } from "../Middlewares/multer.js";
import {
  roleVerification,
  deleteUserProfile,
  getAllReports,
  resolvedReport,
} from "../controllers/admin.controller.js";
import { getReport } from "../controllers/report.controller.js";

const adminRouter = express.Router();

// ==========================================
// POSTS ADMINISTRATION
// ==========================================
adminRouter.get("/getAllPosts", verifyJWT, adminMiddleware, getAllPost);

adminRouter.get(
  "/getSinglePost/:postId",
  verifyJWT,
  adminMiddleware,
  getOnePost,
);

adminRouter.delete(
  "/deletePost/:postId",
  verifyJWT,
  adminMiddleware,
  deletePost,
);

adminRouter.post(
  "/upload",
  verifyJWT,
  adminMiddleware,
  upload.single("postImage"),
  uploadPost,
);

// ==========================================
// USER ADMINISTRATION
// ==========================================
adminRouter.get("/getAllUser", verifyJWT, adminMiddleware, getAllUsers);

adminRouter.get(
  "/profile/:userName",
  verifyJWT,
  adminMiddleware,
  getUserProfile,
);

adminRouter.put(
  "/verification/:targetUserId",
  verifyJWT,
  adminMiddleware,
  roleVerification,
);

adminRouter.delete(
  "/deleteUserProfile/:targetUserId",
  verifyJWT,
  adminMiddleware,
  deleteUserProfile,
);

// ==========================================
// REPORT ADMINISTRATION
// ==========================================
adminRouter.get("/allReports", verifyJWT, adminMiddleware, getAllReports);
adminRouter.get("/view/:reportId", verifyJWT, adminMiddleware, getReport);

adminRouter.put(
  "/update/:reportId",
  verifyJWT,
  adminMiddleware,
  resolvedReport,
);

// ==========================================
// COMMENT ADMINISTRATION
// ==========================================
adminRouter.get(
  "/getAllComments/:postId",
  verifyJWT,
  adminMiddleware,
  getAllComment,
);

adminRouter.get(
  "/getComment/:commentId",
  verifyJWT,
  adminMiddleware,
  getComment,
);

adminRouter.post(
  "/postComment/:postId",
  verifyJWT,
  adminMiddleware,
  createComment,
);

adminRouter.post(
  "/postComment/:postId/:parentId",
  verifyJWT,
  adminMiddleware,
  createComment,
);

adminRouter.delete(
  "/deleteComment/:commentId",
  verifyJWT,
  adminMiddleware,
  deleteComment,
);

export default adminRouter;
