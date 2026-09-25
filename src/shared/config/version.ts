export const BACKEND_VERSION = "1.1.0";
export const API_VERSION = "v1";
export const RELEASE_BRANCH = `release/${BACKEND_VERSION}`;

export interface VersionPayload {
  service: string;
  version: string;
  apiVersion: string;
  releaseBranch: string;
}

export const versionPayload: Readonly<VersionPayload> = Object.freeze({
  service: "lume-backend",
  version: BACKEND_VERSION,
  apiVersion: API_VERSION,
  releaseBranch: RELEASE_BRANCH,
});
