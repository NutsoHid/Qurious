import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcryptjs";
export const userSignUp = async (req, res) => {
  try {
    const {
      userName,
      password,
      email,
      name,
      profession,
      accountType,
      verified,
    } = req.body;

    if (!userName || !password || !email || !name) {
      return res.status(400).json({ message: "Incomplete credentials" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User email already exists. Proceed to login page." });
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const profileImageLocalPath = req.files?.profileImage?.[0]?.path;
    const documentLocalPath = req.files?.document?.[0]?.path;

    let finalProfileUrl = "";
    let verificationDocUrl = "";

    if (profileImageLocalPath) {
      const cloudinaryProfile = await uploadOnCloudinary(profileImageLocalPath);
      if (cloudinaryProfile) {
        finalProfileUrl = cloudinaryProfile.secure_url;
      }
    }

    if (documentLocalPath) {
      const cloudinaryDoc = await uploadOnCloudinary(documentLocalPath);
      if (cloudinaryDoc) {
        verificationDocUrl = cloudinaryDoc.secure_url;
      }
    }

    const newUser = await User.create({
      userName,
      password,
      email,
      name,
      profession,
      accountType,
      verified,
      profileUrl: finalProfileUrl,
      verificationDoc: verificationDocUrl,
    });

    const activeToken = await newUser.activeToken();
    const refreshToken = await newUser.refreshTokenGenerator();
    newUser.refreshToken = refreshToken;

    await newUser.save({ validateBeforeSave: false });

    const createdUser = await User.findById(newUser._id).select(
      "-password -refreshToken",
    );

    return res.status(201).json({
      message: "User created successfully",
      user: createdUser,
      activeToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in userSignUp function",
      error: error.message,
    });
  }
};

export const userSignIn = async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    if (!password || (!email && !userName)) {
      return res.status(400).json({ message: "Incomplete credentials" });
    }

    let userExists = userName
      ? await User.findOne({ userName })
      : await User.findOne({ email });

    if (!userExists) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordCheck = await userExists.isPasswordCorrect(password);
    if (!passwordCheck) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const activeToken = await userExists.activeToken();
    const refreshToken = await userExists.refreshTokenGenerator();
    userExists.refreshToken = refreshToken;

    await userExists.save({ validateBeforeSave: false });

    const userData = userExists.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return res.status(200).json({
      message: "User logged in",
      userData: userData,
      activeToken,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in signIn",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const userExists = await User.findById(req.userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userExists.toObject();
    delete userData.password;
    delete userData.refreshToken;

    return res.status(200).json({
      message: "Current user retrieved successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in getCurrentUser",
      error: error.message,
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { userName } = req.params;

    if (!userName) {
      return res.status(400).json({ message: "Username is required" });
    }

    const userExists = await User.findOne({ userName });
    if (!userExists) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profileData = userExists.toObject();
    delete profileData.password;
    delete profileData.refreshToken;

    return res.status(200).json({
      message: "User profile retrieved successfully",
      profile: profileData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in getUserProfile",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { userName: { $regex: search, $options: "i" } },
          { profession: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .find({ _id: { $ne: req.userId } })
      .select("-password -refreshToken")
      .limit(20);

    return res.status(200).json({
      message: "Discovery users list retrieved successfully",
      users: users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in getAllUsers",
      error: error.message,
    });
  }
};

export const uploadProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const { name, userName, profession, oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (userName) user.userName = userName;
    if (profession) user.profession = profession;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password." });
      }
      user.password = newPassword;
    }

    const localFilePath = req.file?.path;
    if (localFilePath) {
      const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
      if (cloudinaryResponse && cloudinaryResponse.secure_url) {
        user.profileUrl = cloudinaryResponse.secure_url;
      }
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;
    delete updatedUser.refreshToken;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
      profileUrl: updatedUser.profileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while updating the profile",
      error: error.message,
    });
  }
};

// 👇 FIX FOR DASHBOARD POSTS (Zero likes/comments issue)
export const getMyPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "userName name profileUrl")
      .populate("comments");

    return res.status(200).json({ posts });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching user posts", error: error.message });
  }
};
export const requestVerification = async (req, res) => {
  try {
    const userId = req.userId;

    const localFilePath = req.file?.path;
    if (!localFilePath) {
      return res
        .status(400)
        .json({ message: "Verification document file is required" });
    }

    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    if (!cloudinaryResponse) {
      return res
        .status(500)
        .json({ message: "Failed to upload document to cloud storage" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { verificationDoc: cloudinaryResponse.secure_url },
      { new: true, validateBeforeSave: false },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message:
        "Verification document uploaded successfully. Awaiting admin review.",
      documentUrl: user.verificationDoc,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong during verification document upload",
      error: error.message,
    });
  }
};
export default {
  userSignUp,
  userSignIn,
  getCurrentUser,
  getUserProfile,
  getAllUsers,
  uploadProfile,
  getMyPosts,
  requestVerification,
};
