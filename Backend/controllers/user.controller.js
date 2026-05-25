import { User } from "../models/user.models.js";

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
      profileUrl,
    } = req.body;

    if (!userName || !password || !email || !name) {
      return res.status(400).json({
        message: "Incomplete credentials",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists proceed to login page",
      });
    }

    const existingUserName = await User.findOne({ userName });

    if (existingUserName) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const newUser = await User.create({
      userName,
      password,
      email,
      name,
      profession,
      accountType,
      verified,
      profileUrl,
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

export default {
  userSignUp,
  userSignIn,
  getCurrentUser,
  getUserProfile,
  getAllUsers,
};
