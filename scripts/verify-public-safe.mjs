import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const dotEnv = "." + "env";
const forbiddenText = [
  ["OPENAI", "API", "KEY"].join("_"),
  ["ANTHROPIC", "API", "KEY"].join("_"),
  ["OPENROUTER", "API", "KEY"].join("_"),
  ["GITHUB", "TOKEN"].join("_"),
  ["@", "4dchat", "/"].join(""),
  ["TreptowerPark", "4dchat"].join("/"),
];

const secretPatterns = [
  { name: "GitHub token-like value", regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/ },
  { name: "OpenAI-style key", regex: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "Anthropic-style key", regex: /\bsk-ant-[A-Za-z0-9_-]{20,}\b/ },
  { name: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "private network URL", regex: /https?:\/\/(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[0-1])\.\d+\.\d+|[^\s/]+\.local)(?::\d+)?\b/i },
  { name: "generic assigned secret", regex: /\b(?:api[_-]?key|secret|token|password)\b\s*[:=]\s*["'][^"']{12,}["']/i },
];

const skipDirs = new Set([".git", "node_modules", "dist", "build", "coverage"]);
const textExts = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".md", ".txt", ".yml", ".yaml", ""]);
const findings = [];

async function walk(dir) {
  for (const entry of await readdir(dir)) {
    if (skipDirs.has(entry)) continue;
    const path = join(dir, entry);
    const info = await stat(path);
    const rel = relative(root, path);
    if (entry === dotEnv || entry.startsWith(dotEnv + ".")) {
      findings.push(`${rel}: forbidden environment file name`);
      continue;
    }
    if (info.isDirectory()) await walk(path);
    else if (info.isFile() && shouldScan(path)) await scanFile(path, rel);
  }
}

function shouldScan(path) {
  const name = path.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  const ext = dot === -1 ? "" : name.slice(dot);
  return textExts.has(ext);
}

async function scanFile(path, rel) {
  const text = await readFile(path, "utf8");
  for (const needle of forbiddenText) {
    if (text.includes(needle)) findings.push(`${rel}: contains forbidden marker ${needle}`);
  }
  if (text.includes(dotEnv)) findings.push(`${rel}: contains forbidden environment-file marker`);
  for (const pattern of secretPatterns) {
    if (pattern.regex.test(text)) findings.push(`${rel}: ${pattern.name}`);
  }
}

await walk(root);

if (findings.length > 0) {
  console.error("Public-safety scan failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Public-safety scan passed: no obvious private markers or secret-looking values found.");
