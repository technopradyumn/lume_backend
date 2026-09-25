import mongoose, { Schema, Document } from "mongoose";

export interface ITweetReply {
  content: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ITweet extends Document {
  content: string;
  owner: mongoose.Types.ObjectId;
  image?: string;
  replies: ITweetReply[];
  createdAt: Date;
  updatedAt: Date;
}

const tweetSchema = new Schema<ITweet>(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
    },
    replies: [
      {
        content: {
          type: String,
          required: true,
        },
        owner: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Tweet = mongoose.model<ITweet>("Tweet", tweetSchema);
