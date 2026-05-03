import express from "express";
import { userSignUp, userSignIn } from "../controllers/user.controller.js";

const Userrouter = express.Router();

Userrouter.post("/signup", userSignUp);
Userrouter.post("/signin", userSignIn);

export default Userrouter;
