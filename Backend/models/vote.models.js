import mongoose, { Mongoose, Schema } from "mongoose";

const voteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isLike: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      enum: ["Post", "Comment"],
      required: true,
    },
    typeId: {
      type: Schema.Types.ObjectId,
      refPath: "type",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Vote = mongoose.model("Vote", voteSchema);
