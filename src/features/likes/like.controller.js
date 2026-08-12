import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "./like.model.js";
import { Video } from "../videos/video.model.js";
import { Comment } from "../comments/comment.model.js";
import { Tweet } from "../community/tweet.model.js";
import { Notification } from "../notifications/notification.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  let isLiked = false;
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    isLiked = false;
  } else {
    await Like.create({ video: videoId, likedBy: req.user._id });
    isLiked = true;

    const video = await Video.findById(videoId);
    if (video && video.owner.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: video.owner,
        sender: req.user._id,
        type: "LIKE",
        message: `${req.user.fullName} liked your video.`,
        link: `/watch/${videoId}`,
      });
    }
  }

  const likesCount = await Like.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked, likesCount },
        isLiked ? "Liked video" : "Unliked video"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  let isLiked = false;
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    isLiked = false;
  } else {
    await Like.create({ comment: commentId, likedBy: req.user._id });
    isLiked = true;

    const comment = await Comment.findById(commentId);
    if (comment && comment.owner.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: comment.owner,
        sender: req.user._id,
        type: "LIKE",
        message: `${req.user.fullName} liked your comment.`,
        link: `/watch/${comment.video}`,
      });
    }
  }

  const likesCount = await Like.countDocuments({ comment: commentId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isLiked, likesCount },
        isLiked ? "Liked comment" : "Unliked comment"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, { isLiked: false }, "Unliked tweet"));
  }

  await Like.create({ tweet: tweetId, likedBy: req.user._id });

  const tweet = await Tweet.findById(tweetId);
  if (tweet && tweet.owner.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: tweet.owner,
      sender: req.user._id,
      type: "LIKE",
      message: `${req.user.fullName} liked your community post.`,
      link: `/home`,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked: true }, "Liked tweet"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  }).populate({
    path: "video",
    populate: { path: "owner", select: "fullName username avatar" },
  });

  const videos = likedVideos.map((l) => l.video).filter(Boolean);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
