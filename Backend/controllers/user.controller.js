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
      return res.status(400).json({ message: "Incomplete credientials" });
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

    // const user = await User.findOne({email}).select("-password -refreshToken")
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

export default { userSignUp, userSignIn };
