import { Vote } from "../models/vote.models.js";

export const toggleVote = async (req, res) => {
  try {
    const { userId } = req;
    const { type, typeId } = req.params;
    const { isLike } = req.body;

    //Three cases
    //a)new like
    //b)existing like pressed again -> like disappear
    //c)like to dislike or vice versa
    if (isLike === undefined || !type || !typeId) {
      return res
        .status(400)
        .json({ message: "Missing required voting details" });
    }

    const existingLike = await Vote.findOne({ user: userId, typeId });
    //case b
    if (existingLike) {
      if (existingLike.isLike === isLike) {
        await Vote.findByIdAndDelete(existingLike._id);
        return res
          .status(200)
          .json({ message: "Vote removed successffully", voteState: null });
      }
      //case c
      existingLike.isLike = isLike;
      await existingLike.save();
      return res.status(200).json({
        message: "Vote updated successfully",
        vote: existingLike,
      });
    }
    const newVote = await Vote.create({
      user: userId,
      type,
      typeId,
      isLike,
    });
    return res.status(201).json({
      message: "Vote cast successfully",
      vote: newVote,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in toggleVote controller",
      error: error.message,
    });
  }
};
