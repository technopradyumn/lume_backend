import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../../features/auth/user.model.js";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyJWT = asyncHandler(async (req: Request, _: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || "default_secret";
    const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const optionalVerifyJWT = asyncHandler(async (req: Request, _: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const secret = process.env.ACCESS_TOKEN_SECRET || "default_secret";
      const decodedToken = jwt.verify(token, secret) as jwt.JwtPayload;
      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
});
