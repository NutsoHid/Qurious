import mongoose, { Schema } from "mongoose";

const reportSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export const Report = mongoose.model("Report", reportSchema);
