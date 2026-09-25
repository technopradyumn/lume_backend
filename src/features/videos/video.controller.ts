import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "./video.model.js";
import { User } from "../auth/user.model.js";
import { Like } from "../likes/like.model.js";
import { Subscription } from "../subscriptions/subscription.model.js";
import { Notification } from "../notifications/notification.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { uploadOnSupabase } from "../../shared/utils/supabase.js";

const getAllVideos = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    query,
    category,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query as Record<string, string | undefined>;

  const match: any = { isPublished: true };

  if (category) {
    match.category = category;
  }

  if (query && query.toLowerCase() === "trending") {
    // Trending logic can sort by views or keep all
  } else if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId && isValidObjectId(userId)) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  const sortOptions: Record<string, 1 | -1> = {};
  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  const videoAggregate = Video.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    { $sort: sortOptions },
  ]);

  const options = {
    page: parseInt(String(page), 10),
    limit: parseInt(String(limit), 10),
  };

  const videos = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, videos.docs, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, category } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const videoFileLocalPath = files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoFile = await uploadOnSupabase(
    videoFileLocalPath,
    "lume-videos",
    req
  );
  const thumbnail = await uploadOnSupabase(
    thumbnailLocalPath,
    "lume-thumbnails",
    req
  );

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(500, "Error uploading video or thumbnail to storage");
  }

  const video = await Video.create({
    title,
    description,
    category: category || "Coding",
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration || 120,
    owner: req.user._id,
  });

  const subscribers = await Subscription.find({ channel: req.user._id });
  const notifications = subscribers.map((sub) => ({
    recipient: sub.subscriber,
    sender: req.user._id,
    type: "VIDEO" as const,
    message: `${req.user.fullName} uploaded a new video: ${title}`,
    link: `/watch/${video._id}`,
  }));
  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  const createdVideo = await Video.findById(video._id).populate(
    "owner",
    "fullName username avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate(
    "owner",
    "fullName username avatar subscribersCount"
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const likesCount = await Like.countDocuments({ video: videoId });
  let isLiked = false;
  if (req.user) {
    const userLike = await Like.findOne({
      video: videoId,
      likedBy: req.user._id,
    });
    isLiked = !!userLike;
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId },
    });
  }

  const subscribersCount = await Subscription.countDocuments({
    channel: (video.owner as any)?._id,
  });
  let isSubscribed = false;
  if (req.user && video.owner) {
    const sub = await Subscription.findOne({
      subscriber: req.user._id,
      channel: (video.owner as any)._id,
    });
    isSubscribed = !!sub;
  }

  const videoData = {
    ...video.toObject(),
    likesCount,
    isLiked,
    owner: video.owner
      ? {
          ...(video.owner as any).toObject(),
          subscribersCount,
          isSubscribed,
        }
      : null,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, videoData, "Video fetched successfully"));
});

const incrementVideoViews = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { views: video.views },
        "Video view incremented successfully"
      )
    );
});

const updateVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const updateData: any = {};
  if (title) updateData.title = title;
  if (description) updateData.description = description;

  if (req.file?.path) {
    const thumbnail = await uploadOnSupabase(
      req.file.path,
      "lume-thumbnails",
      req
    );
    if (thumbnail?.url) {
      updateData.thumbnail = thumbnail.url;
    }
  }

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    { $set: updateData },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOneAndDelete({
    _id: videoId,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findOne({ _id: videoId, owner: req.user._id });

  if (!video) {
    throw new ApiError(404, "Video not found or unauthorized");
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  incrementVideoViews,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
