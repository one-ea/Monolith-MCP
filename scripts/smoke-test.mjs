#!/usr/bin/env node
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const toolsDir = join(root, "src", "tools");
const files = readdirSync(toolsDir).filter((file) => file.endsWith(".ts"));
const toolNames = [];

for (const file of files) {
  const content = readFileSync(join(toolsDir, file), "utf8");
  for (const match of content.matchAll(/server\.tool\(\s*\n\s*"([^"]+)"/g)) {
    toolNames.push(match[1]);
  }
}

const expectedCount = 42;
const readme = readFileSync(join(root, "README.md"), "utf8");
const index = readFileSync(join(root, "src", "index.ts"), "utf8");

if (toolNames.length !== expectedCount) {
  throw new Error(`Expected ${expectedCount} tools, found ${toolNames.length}: ${toolNames.join(", ")}`);
}

if (new Set(toolNames).size !== toolNames.length) {
  throw new Error("Duplicate tool names found");
}

for (const name of toolNames) {
  if (!readme.includes(name)) {
    throw new Error(`README is missing tool ${name}`);
  }
}

if (!index.includes(`const TOOL_COUNT = ${expectedCount}`)) {
  throw new Error(`src/index.ts TOOL_COUNT must be ${expectedCount}`);
}

const dangerousTools = [
  "delete_post",
  "batch_posts",
  "restore_post_version",
  "delete_media",
  "delete_page",
  "delete_comment",
  "delete_r2_backup",
  "restore_backup",
  "restore_r2_backup",
  "import_halo_data",
];

for (const name of dangerousTools) {
  const file = files.find((candidate) => readFileSync(join(toolsDir, candidate), "utf8").includes(`"${name}"`));
  if (!file) throw new Error(`Dangerous tool ${name} is not registered`);
  const content = readFileSync(join(toolsDir, file), "utf8");
  const start = content.indexOf(`"${name}"`);
  const next = content.indexOf("server.tool(", start + 1);
  const block = content.slice(start, next === -1 ? undefined : next);
  if (!block.includes('confirm') || !block.includes('z.enum(["yes"])')) {
    throw new Error(`Dangerous tool ${name} must require confirm: "yes"`);
  }
}

console.log(`Smoke test passed: ${toolNames.length} tools registered and documented.`);
