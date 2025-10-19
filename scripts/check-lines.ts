/* eslint-env node */
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const MAX_LINES = 300;

// Get all staged JS/TS files
const files = execSync("git diff --cached --name-only --diff-filter=ACM")
  .toString()
  .split("\n")
  .filter((file) => file.match(/\.(js|jsx|ts|tsx)$/) && fs.existsSync(file));

if (files.length === 0) {
  process.exit(0);
}

console.log("🔍 Checking line limits for staged files...\n");

let blocked = false;

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  const lineCount = content.split("\n").length;

  if (lineCount > MAX_LINES) {
    const fullPath = path.resolve(file);
    console.error(
      `❌ Commit blocked: '${file}' (${fullPath}) has ${lineCount} lines (limit ${MAX_LINES})`
    );
    blocked = true;
  }
}

if (blocked) {
  console.error("\nPlease reduce file sizes before committing.");
  process.exit(1);
}

console.log(`✅ All JS/TS files are within the ${MAX_LINES}-line limit.`);
process.exit(0);
