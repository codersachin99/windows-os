#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CHECKPOINT = "4e63290d783009e1293433c6ccf252abba9c1187";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY = join(ROOT, "migration", "legacy-files.tsv");

function usage() {
  console.log(`Usage: node scripts/import-legacy.mjs --from "C:\\path\\to\\legacy-win7" [--check]`);
  console.log("Copies the *exact, verified* original assets, app resources and CSS into the React public directory.");
  console.log("Does NOT transplant Vue bundles or silently alter the old source.");
}

function targetFor(sourcePath) {
  if (sourcePath.startsWith("assets/") || sourcePath.startsWith("apps/")) {
    return join(ROOT, "apps", "web", "public", ...sourcePath.split("/"));
  }
  if (sourcePath.startsWith("src/styles/")) {
    return join(ROOT, "apps", "web", "public", "legacy", "styles", ...sourcePath.slice("src/styles/".length).split("/"));
  }
  return null;
}

function gitBlobSha(bytes) {
  return createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) return usage();
  const i = args.indexOf("--from");
  if (i < 0 || !args[i + 1]) throw new Error("Specify --from <local legacy-win7 checkout>");
  const sourceRoot = resolve(args[i + 1]);
  const onlyCheck = args.includes("--check");
  for (const item of args) {
    if (!["--from", "--check", args[i + 1]].includes(item)) throw new Error(`Unexpected argument: ${item}`);
  }
  const sha = execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (sha !== CHECKPOINT) throw new Error(`Source must be pinned to ${CHECKPOINT}; found ${sha}`);
  const changed = execFileSync("git", ["-C", sourceRoot, "status", "--porcelain", "--untracked-files=no"], { encoding: "utf8" }).trim();
  if (changed) throw new Error("Source contains tracked changes. Use a separate clean worktree at the pinned commit.");
  const inventory = (await readFile(INVENTORY, "utf8")).split(/\r?\n/).filter(line => line && !line.startsWith("#"));
  let verified = 0, copied = 0, ignored = 0, bytesCopied = 0;
  for (const line of inventory) {
    const [relative, sha1, expectedSize] = line.split("\t");
    const destination = targetFor(relative);
    if (!destination) { ignored++; continue; }
    const sourceFile = join(sourceRoot, ...relative.split("/"));
    const data = await readFile(sourceFile);
    if (data.length !== Number(expectedSize) || gitBlobSha(data) !== sha1) {
      throw new Error(`Legacy asset changed: ${relative}. Stop migration rather than mixing source revisions.`);
    }
    verified++;
    if (!onlyCheck) {
      await mkdir(dirname(destination), { recursive: true });
      await copyFile(sourceFile, destination);
      copied++;
      bytesCopied += data.length;
    } else {
      let size;
      try { size = (await stat(destination)).size; } catch { throw new Error(`Missing imported file: ${destination}`); }
      if (size !== data.length || gitBlobSha(await readFile(destination)) !== sha1) {
        throw new Error(`Imported file differs: ${relative}`);
      }
    }
  }
  console.log(JSON.stringify({ checkpoint: CHECKPOINT, sourceRoot, verified, ignored, copied, bytesCopied, checkedOnly: onlyCheck }, null, 2));
  if (!onlyCheck) console.log("Run `node scripts/import-legacy.mjs --from <checkout> --check` to verify every installed file.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
