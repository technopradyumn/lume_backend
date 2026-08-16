export const BACKEND_VERSION = "1.1.0";
export const API_VERSION = "v1";
export const RELEASE_BRANCH = `release/${BACKEND_VERSION}`;

export const versionPayload = Object.freeze({
  service: "lume-backend",
  version: BACKEND_VERSION,
  apiVersion: API_VERSION,
  releaseBranch: RELEASE_BRANCH,
});
