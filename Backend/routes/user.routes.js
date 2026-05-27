import express from "express";
import {
  userSignUp,
  userSignIn,
  getCurrentUser,
  getUserProfile,
  getAllUsers,
  uploadProfile
} from "../controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.js";

const Userrouter = express.Router();

Userrouter.post("/signup", userSignUp);
Userrouter.post("/signin", userSignIn);
Userrouter.get("/profile/:userName", getUserProfile);
Userrouter.get("/me", verifyJWT, getCurrentUser);
Userrouter.get("/all", verifyJWT, getAllUsers);
Userrouter.post("/profile",verifyJWT, upload.single("profileImage"),uploadProfile);

export default Userrouter;
