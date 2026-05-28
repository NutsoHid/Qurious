import { Conversation } from "../models/conversation.models.js";
import { Message } from "../models/message.models.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

// 1. Controller to handle sending messages
export const sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { content } = req.body;
    const senderId = req.user._id;

    if (!content || content.trim() === "") {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      conversationId: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content,
    });

    conversation.lastMessage = newMessage._id;
    await conversation.save({ validateBeforeSave: false });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while sending the message",
      error: error.message,
    });
  }
};

// 2. 🔥 THE MISSING PIECE: Controller to fetch chat logs when a user opens a chat window
export const getMessages = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id; // Derived from your verifyJWT middleware

    // Find the 1v1 room holding these two specific users
    const conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    });

    // If they have never messaged before, don't throw an error; just send an empty array back
    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }

    // Pull every text bubble tied to this room's unique ID, ordered from oldest to newest
    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Chat history retrieved successfully",
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong while fetching chat history",
      error: error.message,
    });
  }
};
