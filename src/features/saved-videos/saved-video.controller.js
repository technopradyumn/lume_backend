import { SavedVideos } from "./saved-video.model.js";
import { Video } from "../videos/video.model.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

const getSavedVideos = asyncHandler(async (req, res) => {
  const saved = await SavedVideos.findOne({
    owner: req.user._id,
    name: "Watch Later",
  }).populate({
    path: "videos",
    populate: { path: "owner", select: "fullName username avatar" },
  });

  return res.status(200).json(new ApiResponse(200, saved?.videos || []));
});

const toggleSavedVideo = asyncHandler(async (req, res) => {
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

  const alreadySaved = saved.videos.some((id) => id.toString() === videoId);
  if (alreadySaved) {
    saved.videos.pull(videoId);
  } else {
    saved.videos.addToSet(videoId);
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
