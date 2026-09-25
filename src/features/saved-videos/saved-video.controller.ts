import { Request, Response } from "express";
import { SavedVideos } from "./saved-video.model.js";
import { Video } from "../videos/video.model.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

const getSavedVideos = asyncHandler(async (req: Request, res: Response) => {
  const saved = await SavedVideos.findOne({
    owner: req.user._id,
    name: "Watch Later",
  }).populate({
    path: "videos",
    populate: { path: "owner", select: "fullName username avatar" },
  });

  return res.status(200).json(new ApiResponse(200, saved?.videos || []));
});

const toggleSavedVideo = asyncHandler(async (req: Request, res: Response) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).select("_id");
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  let saved = await SavedVideos.findOne({
    owner: req.user._id,
    name: "Watch Later",
  });

  if (!saved) {
    saved = await SavedVideos.create({
      name: "Watch Later",
      description: "Saved videos",
      owner: req.user._id,
      videos: [],
    });
  }

  const alreadySaved = saved.videos.some((id: any) => id.toString() === videoId);
  if (alreadySaved) {
    saved.videos.pull(videoId);
  } else {
    saved.videos.addToSet(videoId as any);
  }
  await saved.save();

  await saved.populate({
    path: "videos",
    populate: { path: "owner", select: "fullName username avatar" },
  });

  return res.status(200).json(
    new ApiResponse(200, {
      isSaved: !alreadySaved,
      videos: saved.videos,
    }),
  );
});

export { getSavedVideos, toggleSavedVideo };
