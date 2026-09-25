import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "./subscription.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req: Request, res: Response) => {
  const channelId = String(req.params.channelId || "");

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const existingSub = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSub) {
    await Subscription.findByIdAndDelete(existingSub._id);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isSubscribed: false },
          "Unsubscribed successfully"
        )
      );
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: new mongoose.Types.ObjectId(channelId),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req: Request, res: Response) => {
  const channelId = String(req.params.channelId || "");

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({
    channel: new mongoose.Types.ObjectId(channelId),
  }).populate("subscriber", "fullName username avatar");

  return res.status(200).json(
    new ApiResponse(
      200,
      subscribers.map((s: any) => s.subscriber),
      "Subscribers fetched successfully"
    )
  );
});

const getSubscribedChannels = asyncHandler(async (req: Request, res: Response) => {
  const subscriberId = String(req.params.subscriberId || "");

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriptions = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(subscriberId),
  }).populate("channel", "fullName username avatar");

  const channels = await Promise.all(
    subscriptions.map(async (s: any) => {
      const ch = s.channel;
      if (!ch) return null;
      const count = await Subscription.countDocuments({ channel: ch._id });
      return {
        ...ch.toObject(),
        subscribersCount: count,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channels.filter(Boolean),
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
