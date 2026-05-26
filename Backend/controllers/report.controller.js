import { Report } from "../models/report.models.js";
import { Post } from "../models/post.models.js";
import mongoose from "mongoose";
export const createReport = async (req, res) => {
  try {
    const { userId } = req;
    const { type, typeId } = req.params;
    const { reason, description } = req.body;

    if (!reason || !description || !type || !typeId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingReport = await Report.findOne({ user: userId, typeId });
    if (existingReport) {
      return res
        .status(400)
        .json({ message: "You have already reported this item" });
    }

    const newReport = await Report.create({
      user: userId,
      type,
      typeId,
      reason,
      description,
    });

    return res
      .status(201)
      .json({ message: "Report submitted successfully", newReport });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating report", error: error.message });
  }
};

export const getReport = async (req, res) => {
  try {
    const { userId } = req;
    const { reportId } = req.params;

    if (!mongoose.models.Post) {
      await import("../models/post.models.js");
    }

    const report = await Report.findOne({
      _id: reportId,
      user: userId,
    }).populate("typeId");

    if (!report) {
      return res.status(404).json({
        message: "Report not found or you are not authorized to view it",
      });
    }

    return res.status(200).json({ report });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching report", error: error.message });
  }
};

export const editReport = async (req, res) => {
  try {
    const { userId } = req;
    const { reportId } = req.params;
    const { reason, description } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        message: "Reason and description are required to update the report",
      });
    }

    const report = await Report.findOne({ _id: reportId, user: userId });

    if (!report) {
      return res
        .status(404)
        .json({ message: "Report not found or you are not authorized" });
    }

    if (report.status !== "pending") {
      return res.status(400).json({
        message: `This report cannot be edited because it is already ${report.status}`,
      });
    }

    report.reason = reason;
    report.description = description;
    await report.save();

    return res.status(200).json({
      message: "Report updated successfully",
      updatedReport: report,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong in editReport controller",
      error: error.message,
    });
  }
};
