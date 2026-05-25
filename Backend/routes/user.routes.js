import express from "express";
import {
  userSignUp,
  userSignIn,
  getCurrentUser,
  getUserProfile,
  getAllUsers,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { upload } from "../Middlewares/multer.js";

const Userrouter = express.Router();

Userrouter.post("/signup", upload.single("profileImage"), userSignUp);
Userrouter.post("/signin", userSignIn);
Userrouter.get("/profile/:userName", getUserProfile);
Userrouter.get("/me", verifyJWT, getCurrentUser);
Userrouter.get("/all", verifyJWT, getAllUsers);

export default Userrouter;
