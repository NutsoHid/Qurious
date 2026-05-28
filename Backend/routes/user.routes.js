import express from "express";
import {
  userSignUp,
  userSignIn,
  getCurrentUser,
  getUserProfile,
  getAllUsers,
  uploadProfile,
  requestVerification,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.js";
import { getMyPosts } from "../controllers/user.controller.js";

const Userrouter = express.Router();

Userrouter.post(
  "/signup",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  userSignUp,
);

Userrouter.post("/signin", userSignIn);
Userrouter.get("/profile/:userName", getUserProfile);

Userrouter.get("/me", verifyJWT, getCurrentUser);
Userrouter.get("/all", verifyJWT, getAllUsers);
Userrouter.get("/myPosts", verifyJWT, getMyPosts);

Userrouter.post(
  "/profile",
  verifyJWT,
  upload.single("profileImage"),
  uploadProfile,
);

Userrouter.post(
  "/request-verification",
  verifyJWT,
  upload.single("document"),
  requestVerification,
);

export default Userrouter;
