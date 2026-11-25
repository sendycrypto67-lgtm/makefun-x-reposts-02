// Entry program for the make.fun bounty "makefun-x-reposts-02".
// The entry itself is my X post quoting make.fun's newest post, with my play
// code in its text. This program only hands that post's address to the grader:
// it copies POSTS.json from the repository root into the output directory,
// nothing more. Node 22, standard library only. No network, no secrets,
// no model calls.
//
// Run it locally:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const fileName = "POSTS.json";

const sourcePath = join(botDir, fileName);
if (!existsSync(sourcePath)) {
  console.error(`missing ${fileName} in ${botDir}`);
  process.exit(1);
}

let postUrls: string[];
try {
  const parsed: unknown = JSON.parse(readFileSync(sourcePath, "utf8"));
  if (typeof parsed !== "object" || parsed === null || !Array.isArray((parsed as { posts?: unknown }).posts)) {
    throw new Error(`${fileName} has no posts array`);
  }
  postUrls = (parsed as { posts: unknown[] }).posts as string[];
} catch (err) {
  console.error(`${fileName} could not be read: ${(err as Error).message}`);
  process.exit(1);
}
if (postUrls.length === 0 || postUrls.some((u) => typeof u !== "string" || (!u.startsWith("https://x.com/") && !u.startsWith("https://twitter.com/")))) {
  console.error(`${fileName} does not name X post URLs: ${JSON.stringify(postUrls)}`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
copyFileSync(sourcePath, join(outDir, fileName));
console.log(`wrote ${join(outDir, fileName)} for ${postUrls.join(", ")}`);
