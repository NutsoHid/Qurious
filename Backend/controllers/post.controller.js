import express from "express";
import { Post } from "../models/post.models.js";

export const getOnePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const postById = await Post.findById(postId).populate(
      "user",
      "userName name profileUrl",
    );

    if (!postById) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      message: "Post found successfully",
      singlePost: postById,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong from getOnePost",
      error: error.message,
    });
  }
};
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("user", "userName name profileUrl");

    if (!posts) {
      return res.status(500).json({ message: "Posts couldn't be found" });
    }
    return res
      .status(200)
      .json({ message: "Post found successfully", posts: posts });
  } catch (error) {
    return res.status(500).json({ AllPost: posts });
  }
};
export const uploadPost = async (req, res) => {
  try {
    const { userId } = req;
    const { title, content, imageUrl, category, anonymous } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Enter specified details" });
    }
    const post = await Post.create({
      user: userId,
      title,
      content,
      imageUrl,
      category,
      anonymous,
    });
    if (!post) {
      return res.status(400).json({ message: "Couldn't create object" });
    }
    return res
      .status(201)
      .json({ message: "Object created successfully", newPost: post });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong from post controller" });
  }
};
export const deletePost = async (req, res) => {
  const { postId } = req.params;
  const deletedPost = await Post.findByIdAndDelete(postId);
  if (!deletedPost) {
    return res.status(404).json({ message: "Post not found" });
  }
  return res.status(200).json({ message: "Post deleted successfully" });
};
export const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content },
      { new: true },
    );
    if (!updatedPost) {
      return res.status(400).json({ message: "Post not found" });
    }
    return res
      .status(200)
      .json({ message: "User updated successfully" }, updatedPost);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong from editPost" });
  }
};
