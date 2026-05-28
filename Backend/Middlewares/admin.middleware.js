import express from "express";
import { User } from "../models/user.models.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    const { userId } = req;

    if (!userId) {
      return res.status(401).json({ message: "User isn't authorized" });
    }

    const user = await User.findById(userId).select("accountType");

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    if (user.accountType !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin privileges required." });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong from admin Middleware",
      error: error.message,
    });
  }
};
