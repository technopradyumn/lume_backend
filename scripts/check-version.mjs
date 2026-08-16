import { readFile } from "node:fs/promises";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const source = await readFile(
  new URL("../src/shared/config/version.js", import.meta.url),
  "utf8",
);
const configuredVersion = source.match(/BACKEND_VERSION = "([^"]+)"/)?.[1];

if (!configuredVersion || configuredVersion !== packageJson.version) {
  console.error(
    `Version mismatch: package.json=${packageJson.version}, backend=${configuredVersion || "missing"}`,
  );
  process.exit(1);
}

console.log(`Backend version ${packageJson.version} is consistent.`);

