import { User } from "../auth/user.model.js";
import { Video } from "../videos/video.model.js";
import { Tweet } from "../community/tweet.model.js";
import { ApiError } from "../../shared/utils/ApiError.js";
import { ApiResponse } from "../../shared/utils/ApiResponse.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const textScore = (value, query) => {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return 0;
  if (text === query) return 100;
  if (text.startsWith(query)) return 75;
  if (text.includes(query)) return 50;

  const tokens = query.split(/\s+/).filter(Boolean);
  return tokens.reduce((score, token) => score + (text.includes(token) ? 10 : 0), 0);
};

const search = asyncHandler(async (req, res) => {
  const query = String(req.query.q || "").trim().slice(0, 100);
  const type = ["all", "people", "videos", "posts"].includes(req.query.type)
    ? req.query.type
    : "all";
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 50);

  if (query.length < 2) {
    throw new ApiError(400, "Search requires at least 2 characters");
  }

  const normalizedQuery = query.toLowerCase();
  const expression = new RegExp(escapeRegex(query), "i");
  const includePeople = type === "all" || type === "people";
  const includeVideos = type === "all" || type === "videos";
  const includePosts = type === "all" || type === "posts";

  // Resolve matching creators once so their videos and posts also appear when
  // someone searches by username, display name, or creator name.
  const matchedCreators = await User.find({
    $or: [{ username: expression }, { fullName: expression }],
  })
    .select("fullName username avatar")
    .limit(limit)
    .lean();
  const creatorIds = matchedCreators.map((creator) => creator._id);

  const [videoDocs, postDocs] = await Promise.all([
    includeVideos
      ? Video.find({
          isPublished: true,
          $or: [
            { title: expression },
            { description: expression },
            { category: expression },
            ...(creatorIds.length ? [{ owner: { $in: creatorIds } }] : []),
          ],
        })
          .populate("owner", "fullName username avatar")
          .limit(limit * 2)
          .lean()
      : [],
    includePosts
      ? Tweet.find({
          $or: [
            { content: expression },
            { "replies.content": expression },
            ...(creatorIds.length ? [{ owner: { $in: creatorIds } }] : []),
          ],
        })
          .populate("owner", "fullName username avatar")
          .populate("replies.owner", "fullName username avatar")
          .limit(limit * 2)
          .lean()
      : [],
  ]);

  const people = includePeople
    ? matchedCreators
        .map((person) => ({
          ...person,
          relevance: Math.max(
            textScore(person.username, normalizedQuery) + 15,
            textScore(person.fullName, normalizedQuery),
          ),
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit)
    : [];

  const videos = videoDocs
    .map((video) => ({
      ...video,
      relevance: Math.max(
        textScore(video.title, normalizedQuery) + 10,
        textScore(video.description, normalizedQuery),
        textScore(video.category, normalizedQuery),
        textScore(video.owner?.username, normalizedQuery) + 5,
        textScore(video.owner?.fullName, normalizedQuery) + 5,
      ),
    }))
    .sort((a, b) => b.relevance - a.relevance || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  const posts = postDocs
    .map((post) => ({
      ...post,
      likesCount: 0,
      isLiked: false,
      relevance: Math.max(
        textScore(post.content, normalizedQuery) + 10,
        textScore(post.owner?.username, normalizedQuery) + 5,
        textScore(post.owner?.fullName, normalizedQuery) + 5,
        ...(post.replies || []).map((reply) => textScore(reply.content, normalizedQuery)),
      ),
    }))
    .sort((a, b) => b.relevance - a.relevance || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        query,
        type,
        people,
        videos,
        posts,
        counts: {
          all: people.length + videos.length + posts.length,
          people: people.length,
          videos: videos.length,
          posts: posts.length,
        },
      },
      "Search completed successfully",
    ),
  );
});

export { search };
