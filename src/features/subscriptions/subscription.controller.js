import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../auth/user.model.js";
import { Subscription } from "./subscription.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

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
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed: true }, "Subscribed successfully")
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "fullName username avatar"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      subscribers.map((s) => s.subscriber),
      "Subscribers fetched successfully"
    )
  );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const subscriptions = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "fullName username avatar");

  const channels = await Promise.all(
    subscriptions.map(async (s) => {
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
