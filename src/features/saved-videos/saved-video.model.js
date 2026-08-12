import mongoose, { Schema } from "mongoose";

const savedVideosSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true, collection: "playlists" },
);

export const SavedVideos = mongoose.model("SavedVideos", savedVideosSchema);
