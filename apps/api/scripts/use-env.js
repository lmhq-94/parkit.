const fs = require("fs");
const path = require("path");

const target = process.argv[2];
const allowed = new Set(["development", "dev", "production", "prod"]);

if (!target || !allowed.has(target)) {
  console.error("Usage: node scripts/use-env.js <dev|prod>");
  process.exit(1);
}

const normalized = target.startsWith("dev") ? "development" : "production";
const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, `.env.${normalized}`);
const destPath = path.join(rootDir, ".env");

if (!fs.existsSync(sourcePath)) {
  console.error(`Missing env file: ${sourcePath}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, destPath);
console.log(`Active environment: ${normalized} (${sourcePath} -> ${destPath})`);
