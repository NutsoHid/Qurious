import { Vote } from "../models/vote.models.js";
import { Post } from "../models/post.models.js";
import { Comment } from "../models/comment.models.js";

export const toggleVote = async (req, res) => {
  try {
    const { type, typeId } = req.params;
    const { isLike } = req.body;
    const userId = req.userId; // Extracted from auth validation middleware

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access. Missing credentials." });
    }

    if (!["Post", "Comment"].includes(type)) {
      return res.status(400).json({ message: "Invalid target model type specified." });
    }

    const TargetModel = type === "Post" ? Post : Comment;
    const targetItem = await TargetModel.findById(typeId);

    if (!targetItem) {
      return res.status(404).json({ message: `${type} profile footprint not found.` });
    }

    // Initialize array fallbacks safely
    if (!targetItem.likes) targetItem.likes = [];
    if (!targetItem.dislikes) targetItem.dislikes = [];

    // Query existing cross-account tracking log
    const existingVote = await Vote.findOne({ user: userId, type, typeId });

    if (existingVote) {
      if (existingVote.isLike === isLike) {
        // Option Clicked Again -> Remove vote footprint completely
        await Vote.findByIdAndDelete(existingVote._id);
        
        if (isLike) {
          targetItem.likes = targetItem.likes.filter((id) => id.toString() !== userId.toString());
        } else {
          targetItem.dislikes = targetItem.dislikes.filter((id) => id.toString() !== userId.toString());
        }
      } else {
        // Switched vote option selection
        existingVote.isLike = isLike;
        await existingVote.save();

        if (isLike) {
          if (!targetItem.likes.includes(userId)) targetItem.likes.push(userId);
          targetItem.dislikes = targetItem.dislikes.filter((id) => id.toString() !== userId.toString());
        } else {
          if (!targetItem.dislikes.includes(userId)) targetItem.dislikes.push(userId);
          targetItem.likes = targetItem.likes.filter((id) => id.toString() !== userId.toString());
        }
      }
    } else {
      // Fresh new unique interactive vote log
      await Vote.create({
        user: userId,
        isLike,
        type,
        typeId,
      });

      if (isLike) {
        if (!targetItem.likes.includes(userId)) targetItem.likes.push(userId);
      } else {
        if (!targetItem.dislikes.includes(userId)) targetItem.dislikes.push(userId);
      }
    }

    await targetItem.save();

    return res.status(200).json({
      message: "Global vote state updated successfully.",
      likes: targetItem.likes,
      dislikes: targetItem.dislikes,
    });
  } catch (error) {
    console.error("Voting controller compilation exception:", error);
    return res.status(500).json({
      message: "Something went wrong during vote synchronization.",
      error: error.message,
    });
  }
};