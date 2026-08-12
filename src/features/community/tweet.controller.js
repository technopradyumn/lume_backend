import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "./tweet.model.js";
import { User } from "../auth/user.model.js";
import { Like } from "../likes/like.model.js";
import { Subscription } from "../subscriptions/subscription.model.js";
import { Notification } from "../notifications/notification.model.js";
import { uploadOnSupabase } from "../../shared/utils/supabase.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Content cannot be empty");
  }

  let imageLocalPath;
  if (req.file?.path) {
    imageLocalPath = req.file.path;
  }

  const imageFile = imageLocalPath
    ? await uploadOnSupabase(imageLocalPath, "lume-tweets", req)
    : null;

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
    image: imageFile?.url || "",
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet");
  }

  const populatedTweet = await Tweet.findById(tweet._id).populate(
    "owner",
    "fullName username avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedTweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const tweets = await Tweet.find({ owner: userId })
    .populate("owner", "fullName username avatar")
    .populate("replies.owner", "fullName username avatar")
    .sort({ createdAt: -1 });

  const tweetsWithLikes = await Promise.all(
    tweets.map(async (t) => {
      const likesCount = await Like.countDocuments({ tweet: t._id });
      let isLiked = false;
      let isSubscribed = false;
      if (req.user) {
        const userLike = await Like.findOne({
          tweet: t._id,
          likedBy: req.user._id,
        });
        isLiked = !!userLike;
        if (t.owner?._id) {
          const sub = await Subscription.findOne({
            subscriber: req.user._id,
            channel: t.owner._id,
          });
          isSubscribed = !!sub;
        }
      }
      const subscribersCount = await Subscription.countDocuments({
        channel: t.owner?._id,
      });

      return {
        ...t.toObject(),
        likesCount,
        isLiked,
        owner: t.owner
          ? {
              ...t.owner.toObject(),
              isSubscribed,
              subscribersCount,
            }
          : null,
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tweetsWithLikes, "Tweets fetched successfully"));
});

const getTweets = asyncHandler(async (req, res) => {
  const tweets = await Tweet.find()
    .populate("owner", "fullName username avatar")
    .populate("replies.owner", "fullName username avatar")
    .sort({ createdAt: -1 });

  const tweetsWithLikes = await Promise.all(
    tweets.map(async (t) => {
      const likesCount = await Like.countDocuments({ tweet: t._id });
      let isLiked = false;
      let isSubscribed = false;
      if (req.user) {
        const userLike = await Like.findOne({
          tweet: t._id,
          likedBy: req.user._id,
        });
        isLiked = !!userLike;
        if (t.owner?._id) {
          const sub = await Subscription.findOne({
            subscriber: req.user._id,
            channel: t.owner._id,
          });
          isSubscribed = !!sub;
        }
      }
      const subscribersCount = await Subscription.countDocuments({
        channel: t.owner?._id,
      });

      return {
        ...t.toObject(),
        likesCount,
        isLiked,
        owner: t.owner
          ? {
              ...t.owner.toObject(),
              isSubscribed,
              subscribersCount,
            }
          : null,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, tweetsWithLikes, "All tweets fetched successfully")
    );
});

const getTweetById = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const t = await Tweet.findById(tweetId)
    .populate("owner", "fullName username avatar")
    .populate("replies.owner", "fullName username avatar");

  if (!t) {
    throw new ApiError(404, "Post not found");
  }

  const likesCount = await Like.countDocuments({ tweet: t._id });
  let isLiked = false;
  let isSubscribed = false;

  if (req.user) {
    const userLike = await Like.findOne({
      tweet: t._id,
      likedBy: req.user._id,
    });
    isLiked = !!userLike;
    if (t.owner?._id) {
      const sub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: t.owner._id,
      });
      isSubscribed = !!sub;
    }
  }

  const subscribersCount = await Subscription.countDocuments({
    channel: t.owner?._id,
  });

  const tweetData = {
    ...t.toObject(),
    likesCount,
    isLiked,
    owner: t.owner
      ? {
          ...t.owner.toObject(),
          isSubscribed,
          subscribersCount,
        }
      : null,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, tweetData, "Tweet fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Content cannot be empty");
  }

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user?._id },
    { $set: { content } },
    { new: true }
  ).populate("owner", "fullName username avatar");

  if (!tweet) {
    throw new ApiError(404, "Tweet not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  const result = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user?._id,
  });

  if (!result) {
    throw new ApiError(404, "Tweet not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

const addTweetReply = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Reply content cannot be empty");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  tweet.replies.push({
    content: content.trim(),
    owner: req.user._id,
  });

  await tweet.save();

  const populated = await Tweet.findById(tweetId)
    .populate("owner", "fullName username avatar")
    .populate("replies.owner", "fullName username avatar");

  if (tweet.owner.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: tweet.owner,
      sender: req.user._id,
      type: "REPLY",
      message: `${req.user.fullName} replied to your community post.`,
      link: `/home`,
    });
  }

  const likesCount = await Like.countDocuments({ tweet: tweetId });
  let isLiked = false;
  if (req.user) {
    const userLike = await Like.findOne({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    isLiked = !!userLike;
  }

  const tweetData = {
    ...populated.toObject(),
    likesCount,
    isLiked,
  };

  return res
    .status(201)
    .json(new ApiResponse(201, tweetData, "Reply added successfully"));
});

export {
  createTweet,
  getUserTweets,
  getTweets,
  getTweetById,
  updateTweet,
  deleteTweet,
  addTweetReply,
};
