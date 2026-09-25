import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "./comment.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { Like } from "../likes/like.model.js";
import { Video } from "../videos/video.model.js";
import { Notification } from "../notifications/notification.model.js";

const getVideoComments = asyncHandler(async (req: Request, res: Response) => {
  const videoId = String(req.params.videoId || "");
  const { page = 1, limit = 10 } = req.query as Record<string, string | undefined>;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);

  const comments = await Comment.find({ video: new mongoose.Types.ObjectId(videoId) })
    .populate("owner", "fullName username avatar")
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const commentsWithLikes = await Promise.all(
    comments.map(async (c) => {
      const likesCount = await Like.countDocuments({ comment: c._id });
      let isLiked = false;
      if (req.user) {
        const userLike = await Like.findOne({
          comment: c._id,
          likedBy: req.user._id,
        });
        isLiked = !!userLike;
      }
      return {
        ...c.toObject(),
        likesCount,
        isLiked,
      };
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        commentsWithLikes,
        "Video comments fetched successfully"
      )
    );
});

const addComment = asyncHandler(async (req: Request, res: Response) => {
  const videoId = String(req.params.videoId || "");
  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  const comment = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: req.user._id,
  });

  const video = await Video.findById(videoId);
  if (video && video.owner.toString() !== req.user._id.toString()) {
    await Notification.create({
      recipient: video.owner,
      sender: req.user._id,
      type: "COMMENT",
      message: `${req.user.fullName} commented on your video.`,
      link: `/watch/${videoId}`,
    });
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    "owner",
    "fullName username avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const commentId = String(req.params.commentId || "");
  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  if (!content || !content.trim()) {
    throw new ApiError(400, "Content cannot be empty");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user._id },
    { $set: { content } },
    { new: true }
  ).populate("owner", "fullName username avatar");

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const commentId = String(req.params.commentId || "");

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(404, "Comment not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
