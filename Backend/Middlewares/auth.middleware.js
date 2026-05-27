import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorised access" });
    }

    const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(verifiedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({ message: "User doesn't exist" });
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};