import { User } from "../models/user.models.js";
import { Post } from "../models/post.models.js";
import mongoose from "mongoose";
import { Report } from "../models/report.models.js";

export const roleVerification = async (req, res) => {
  try {
    const { targetUserId } = req.params;

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({ message: "Target User id doesn't exist" });
    }

    if (!user.verificationDoc) {
      return res.status(400).json({
        message: "This user has not submitted a verification document yet",
      });
    }

    user.verified = true;

    const updatedUser = await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: `User @${updatedUser.userName} has been officially verified.`,
      user: {
        _id: updatedUser._id,
        userName: updatedUser.userName,
        verified: updatedUser.verified,
        verificationDoc: updatedUser.verificationDoc,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong during role verification",
      error: error.message,
    });
  }
};
export const deleteUserProfile = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { targetUserId } = req.params;

    session.startTransaction();

    const existingUser = await User.findById(targetUserId).session(session);

    if (!existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Target User id doesn't exist" });
    }

    if (existingUser.accountType == "admin") {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: "Unauthorized access. Cannot delete administrative profiles.",
      });
    }

    const userPosts = await Post.find({ user: targetUserId })
      .select("_id")
      .session(session);
    const postIds = userPosts.map((post) => post._id);

    if (postIds.length > 0) {
      await Comment.deleteMany({ post: { $in: postIds } }).session(session);
    }

    await Post.deleteMany({ user: targetUserId }).session(session);

    await Comment.updateMany(
      { user: targetUserId },
      { content: "Account revoked by admin" },
    ).session(session);

    await User.updateMany(
      { following: targetUserId },
      { $pull: { following: targetUserId } },
    ).session(session);

    await User.updateMany(
      { followers: targetUserId },
      { $pull: { followers: targetUserId } },
    ).session(session);

    const deletedUser =
      await User.findByIdAndDelete(targetUserId).session(session);

    if (!deletedUser) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ message: "User deletion failed or profile was not found." });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: `User @${existingUser.userName} and all associated footprints were successfully purged.`,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message:
        "Something went wrong during cascading user deletion. Changes rolled back",
      error: error.message,
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate("user", "userName name profileUrl accountType")
      .populate({
        path: "typeId",
      });
    return res.status(200).json({
      message: "Admin report queue fetched successfully",
      count: reports.length,
      reports,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went during getting All Reports" });
  }
};

export const resolvedReport = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { reportId } = req.params;
    const { action } = req.body;

    if (!action || !["delete", "dismiss"].includes(action.toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Action must be either 'delete' or 'dismiss'" });
    }

    session.startTransaction();

    const report = await Report.findById(reportId).session(session);
    if (!report) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Report log not found" });
    }

    if (report.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Report has already been processed as ${report.status}`,
      });
    }

    if (action.toLowerCase() === "delete") {
      if (report.type === "Post") {
        await Post.findByIdAndDelete(report.typeId).session(session);

        await Comment.deleteMany({ post: report.typeId }).session(session);
      } else if (report.type === "Comment") {
        await Comment.findByIdAndUpdate(report.typeId, {
          content: "Account revoked by admin",
        }).session(session);
      }
    }
    report.status = "resolved";
    const updatedReport = await report.save({ validateBeforeSave: false });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Report status updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({
      message:
        "Something went wrong during report resolution. Changes rolled back",
      error: error.message,
    });
  }
};
