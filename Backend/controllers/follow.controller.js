import { User } from "../models/user.models.js";

export const followRequest = async (req, res) => {
  try {
    const { userId } = req;
    const { targetId } = req.params;

    if (userId.toString() === targetId.toString()) {
      return res
        .status(400)
        .json({ message: "Users cannot follow themselves" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User doesn't exist" });
    }

    const existingTarget = await User.findById(targetId);
    if (!existingTarget) {
      return res.status(404).json({ message: "Target user doesn't exist" });
    }

    const isAlreadyFollowing = existingTarget.followers.includes(userId);

    if (isAlreadyFollowing) {
      await User.findByIdAndUpdate(targetId, {
        $pull: { followers: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $pull: { following: targetId },
      });

      return res
        .status(200)
        .json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      await User.findByIdAndUpdate(targetId, {
        $push: { followers: userId },
      });
      await User.findByIdAndUpdate(userId, {
        $push: { following: targetId },
      });

      return res
        .status(200)
        .json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in followRequest controller",
      error: error.message,
    });
  }
};
