import { Post } from "../models/post.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getOnePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const postById = await Post.findById(postId).populate("user", "userName name profileUrl");
    if (!postById) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ message: "Post found successfully", singlePost: postById });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong from getOnePost", error: error.message });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category && category !== "All" && category !== "Latest") {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "userName name profileUrl")
      .populate("comments"); 

    return res.status(200).json({ message: "Post found successfully", posts: posts });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong from getAllPost", error: error.message });
  }
};

export const uploadPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, content, category, anonymous } = req.body;

    if (!title || !content) return res.status(400).json({ message: "Enter specified details" });

    let localImagePath = "";
    if (req.file && req.file.path) {
      localImagePath = req.file.path;
    }

    let cloudImageUrl = "";
    if (localImagePath) {
      const cloudinaryResponse = await uploadOnCloudinary(localImagePath);
      if (cloudinaryResponse) cloudImageUrl = cloudinaryResponse.secure_url;
    }

    const post = await Post.create({
      user: userId,
      title,
      content,
      imageUrl: cloudImageUrl,
      category: category || "Social",
      anonymous: anonymous === "true" || anonymous === true,
    });

    if (!post) return res.status(400).json({ message: "Couldn't create object" });
    return res.status(201).json({ message: "Object created successfully", newPost: post });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong from post controller", error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) return res.status(404).json({ message: "Post not found" });
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong from deletePost", error: error.message });
  }
};

export const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, category, anonymous } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (anonymous !== undefined) post.anonymous = anonymous === "true" || anonymous === true;

    if (req.file && req.file.path) {
      const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
      if (cloudinaryResponse) post.imageUrl = cloudinaryResponse.secure_url;
    }

    const updatedPost = await post.save({ validateBeforeSave: false });
    return res.status(200).json({ message: "Post updated successfully", updatedPost });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong from editPost", error: error.message });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({ 
      message: isLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      isLiked: !isLiked
    });

  } catch (error) {
    return res.status(500).json({ 
      message: "Error toggling like", 
      error: error.message 
    });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log(`🚨 REPORT FLAG: Post ${postId} reported for: ${reason}`);

    return res.status(200).json({ message: "Post reported successfully. Admins will review it." });
  } catch (error) {
    return res.status(500).json({ message: "Error reporting post", error: error.message });
  }
};