import { User } from "../models/user.models.js";
import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.models.js";

export const createComment = async (req, res) => {
  try {
    const { userId } = req;
    const { ParentcommentId, postId } = req.params;
    const { content } = req.body;

    if (!content || !postId) {
      return res
        .status(400)
        .json({ message: "Missing credentials or post doesn't exist" });
    }

    const newComment = await Comment.create({
      user: userId,
      parentComment: ParentcommentId || null,
      post: postId,
      content,
    });

    if (!newComment) {
      return res.status(400).json({ message: "Comment couldn't be created" });
    }

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id },
    });

    await User.findByIdAndUpdate(userId, {
      $push: { comments: newComment._id },
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
      "user",
      "userName profileUrl accountType",
    );
    return res.status(201).json({
      message: "Comment created successfully",
      comment: populatedComment || newComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong from comment controller",
      error: error.message,
    });
  }
};

export const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).populate(
      "user",
      "userName profileUrl accountType",
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    return res.status(200).json({ comment });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong from getComment",
      error: error.message,
    });
  }
};

export const getAllComment = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("user", "userName profileUrl accountType");

    return res.status(200).json({
      message: "Comments fetched successfully",
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong fetching comments",
      error: error.message,
    });
  }
};

export const getMyComments = async (req, res) => {
  try {
    const { userId } = req;
    const comments = await Comment.find({ user: userId })
      .populate("post", "title")
      .sort({ createdAt: -1 });
    return res.status(200).json({ comments });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching user comments", error: error.message });
  }
};

export const editComment = async (req, res) => {
  try {
    const { userId } = req;
    const { postId, commentId } = req.params;
    const { content } = req.body;

    if (!content || !postId || !commentId) {
      return res.status(400).json({ message: "Details are not required" });
    }
    const updatedComment = await Comment.findOneAndUpdate(
      { _id: commentId, user: userId },
      { content },
      { new: true },
    );
    if (!updatedComment) {
      return res.status(400).json({ message: "Couldn't find comment Id" });
    }
    return res
      .status(200)
      .json({ message: "Updated successfully", updatedComment });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong from comment edit controller" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { userId } = req;
    const { commentId } = req.params;
    const requestingUser = await User.findById(userId).select("accountType");
    if (!requestingUser) {
      return res
        .status(404)
        .json({ message: "User running deletion not found" });
    }

    let softDeletedComment;

    if (requestingUser.accountType === "admin") {
      softDeletedComment = await Comment.findByIdAndUpdate(
        commentId,
        { content: "[Deleted by Admin]" },
        { new: true },
      );
    } else {
      softDeletedComment = await Comment.findOneAndUpdate(
        { _id: commentId, user: userId },
        { content: "[Deleted]" },
        { new: true },
      );
    }

    if (!softDeletedComment) {
      return res
        .status(404)
        .json({ message: "Comment doesn't exist or you are not authorized" });
    }
    return res.status(200).json({
      message: "Comment deleted successfully",
      comment: softDeletedComment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong from comment delete controller",
      error: error.message,
    });
  }
};
