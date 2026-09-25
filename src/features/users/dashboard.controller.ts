import { Request, Response } from "express";
import mongoose from "mongoose";
import { Video } from "../videos/video.model.js";
import { Subscription } from "../subscriptions/subscription.model.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user._id;

  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });
  const totalVideos = await Video.countDocuments({ owner: userId });

  const viewsAggregate = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalViews = viewsAggregate[0]?.totalViews || 0;

  const likesAggregate = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    { $project: { likesCount: { $size: "$likes" } } },
    { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
  ]);

  const totalLikes = likesAggregate[0]?.totalLikes || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalSubscribers,
        totalVideos,
        totalViews,
        totalLikes,
      },
      "Channel stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req: Request, res: Response) => {
  const videos = await Video.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
