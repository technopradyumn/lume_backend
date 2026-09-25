import mongoose, { Schema, Document } from "mongoose";

export interface ISavedVideos extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  videos: mongoose.Types.Array<mongoose.Types.ObjectId>;
  createdAt: Date;
  updatedAt: Date;
}

const savedVideosSchema = new Schema<ISavedVideos>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    videos: [{ type: Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true, collection: "playlists" }
);

export const SavedVideos = mongoose.model<ISavedVideos>("SavedVideos", savedVideosSchema);
