import { cp, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");

await mkdir(dist, { recursive: true });
await Promise.all([
  cp(resolve(root, "assets"), resolve(dist, "assets"), { recursive: true }),
  cp(resolve(root, "content"), resolve(dist, "content"), { recursive: true }),
  writeFile(resolve(dist, ".nojekyll"), "")
]);
