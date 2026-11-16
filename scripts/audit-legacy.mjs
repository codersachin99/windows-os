#!/usr/bin/env node
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const inventory = (await readFile(resolve(root, "migration/legacy-files.tsv"), "utf8"))
  .split(/\r?\n/).filter(line => line && !line.startsWith("#"))
  .map(line => { const [path, sha, bytes] = line.split("\t"); return { path, sha, bytes: Number(bytes) }; });
const tracker = JSON.parse(await readFile(resolve(root, "migration/module-tracker.json"), "utf8"));
const sourceModules = inventory.filter(x => x.path.startsWith("src/modules/"));
const uniquePaths = new Set(tracker.modules.map(x => x.source));
const sourcePaths = new Set(sourceModules.map(x => x.path));
const failures = [];
if (tracker.referenceSha !== "4e63290d783009e1293433c6ccf252abba9c1187") failures.push("Wrong reference SHA");
if (uniquePaths.size !== tracker.modules.length) failures.push("Duplicate module paths");
for (const src of sourceModules) {
  const entry = tracker.modules.find(x => x.source === src.path);
  if (!entry) failures.push(`Untracked module: ${src.path}`);
  else if (entry.sha !== src.sha) failures.push(`Source SHA changed for ${src.path}`);
}
for (const entry of tracker.modules) {
  if (!sourcePaths.has(entry.source)) failures.push(`Invented source module: ${entry.source}`);
  if (!["pending", "in-progress", "implemented", "verified"].includes(entry.status)) {
    failures.push(`Invalid migration status for ${entry.source}`);
  }
  if (["implemented", "verified"].includes(entry.status) && !entry.evidence?.length) {
    failures.push(`Missing test/source evidence for ${entry.source}`);
  }
}
const externalSources = inventory.filter(x => {
  const parts = x.path.split("/");
  return parts.length === 3 && parts[0] === "apps" && parts[2] === "index.html";
});
const externalEntries = tracker.externalApps ?? [];
const externalPaths = new Set(externalEntries.map(x => x.source));
if (externalPaths.size !== externalEntries.length) failures.push("Duplicate external app entries");
for (const src of externalSources) {
  const entry = externalEntries.find(x => x.source === src.path);
  if (!entry) failures.push(`Untracked external app: ${src.path}`);
  else if (entry.sha !== src.sha) failures.push(`External app SHA mismatch: ${src.path}`);
  else if (["implemented", "verified"].includes(entry.status) && !entry.evidence?.length)
    failures.push(`External app without implementation evidence: ${src.path}`);
}
for (const entry of externalEntries) {
  if (!externalSources.some(src => src.path === entry.source)) failures.push(`Invented external app: ${entry.source}`);
}
// All imported Computer/desktop visual assets must remain byte-identical
// to the pinned legacy-win7 snapshot. Git stores the SHA-1 of
// "blob <size>\\0<bytes>", not the raw-file SHA-1. The original inventory
// contains the matching immutable Git blob object IDs for source images.
const importedImageDir = resolve(root, "apps/web/public/assets/images");
const importedImages = (await readdir(importedImageDir))
  .filter(name => /\.(webp|png|svg|jpg|jpeg)$/i.test(name));
const expectedImages = new Map(inventory.filter(x => x.path.startsWith("assets/images/"))
  .map(x => [x.path.slice("assets/images/".length), x]));
if (importedImages.length === 0) failures.push("No imported source images found to audit");
for (const name of importedImages) {
  const original = expectedImages.get(name);
  if (!original) {
    failures.push(`Untracked imported image: ${name}`);
    continue;
  }
  const bytes = await readFile(resolve(importedImageDir, name));
  const gitBlobSha = createHash("sha1")
    .update(`blob ${bytes.length}\0`)
    .update(bytes)
    .digest("hex");
  if (bytes.length !== original.bytes || gitBlobSha !== original.sha) {
    failures.push(`Source image bytes changed: ${name}`);
  }
}

// Audit byte-identical original gameplay audio (not just images).
const importedAudioDir = resolve(root, "apps/web/public/assets/audio");
const importedAudio = (await readdir(importedAudioDir))
  .filter(name => /\.(?:mp3|ogg|wav)$/i.test(name));
const expectedAudio = new Map(inventory.filter(x => x.path.startsWith("assets/audio/"))
  .map(x => [x.path.slice("assets/audio/".length), x]));
if (!importedAudio.length) failures.push("No imported source game audio found to audit");
for (const name of importedAudio) {
  const original = expectedAudio.get(name);
  if (!original) {
    failures.push(`Untracked imported audio: ${name}`);
    continue;
  }
  const bytes = await readFile(resolve(importedAudioDir, name));
  const gitBlobSha = createHash("sha1")
    .update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  if (bytes.length !== original.bytes || gitBlobSha !== original.sha)
    failures.push(`Source audio bytes changed: ${name}`);
}

// Preserve the untouched original 245c stylesheet as visual evidence.
const mineSourceCss = inventory.find(x =>
  x.path === "src/styles/games/minesweeper.css");
const mineCssBytes = await readFile(resolve(root,
  "migration/source-css/minesweeper.css"));
const mineCssSha = createHash("sha1")
  .update(`blob ${mineCssBytes.length}\0`)
  .update(mineCssBytes).digest("hex");
if (!mineSourceCss || mineCssBytes.length !== mineSourceCss.bytes ||
    mineCssSha !== mineSourceCss.sha)
  failures.push("Pinned Minesweeper source CSS bytes changed");

// Preserve original 13bc game shell CSS separately from React adapter rules.
const tetrisSourceCSS=inventory.find(x=>
  x.path==="src/styles/system/tetris.css");
const tetrisCSS=await readFile(resolve(root,"migration/source-css/tetris.css"));
const tetrisCSSSha=createHash("sha1")
  .update(`blob ${tetrisCSS.length}\0`)
  .update(tetrisCSS).digest("hex");
if(!tetrisSourceCSS||tetrisCSS.length!==tetrisSourceCSS.bytes||
  tetrisCSSSha!==tetrisSourceCSS.sha)
  failures.push("Pinned Tetris source CSS bytes changed");

for(const originalCssPath of [
  "src/styles/games/solitaire.css",
  "src/styles/games/shared~solitaire~spidersolitaire.css"
]){
  const baseName=originalCssPath.split("/").at(-1);
  const original=inventory.find(x=>x.path===originalCssPath);
  const bytes=await readFile(resolve(root,"migration/source-css",baseName));
  const hash=createHash("sha1").update(`blob ${bytes.length}\0`)
    .update(bytes).digest("hex");
  if(!original||original.bytes!==bytes.length||original.sha!==hash)
    failures.push(`Source cards CSS bytes changed: ${originalCssPath}`);
}

const byStatus = Object.fromEntries(["pending", "in-progress", "implemented", "verified"]
  .map(status => [status, tracker.modules.filter(m => m.status === status).length]));
console.log(JSON.stringify({
  referenceSha: tracker.referenceSha,
  totalSourceFiles: inventory.length,
  sourceModules: sourceModules.length,
  assets: inventory.filter(x => x.path.startsWith("assets/")).length,
  byteCheckedImportedImages: importedImages.length,
  byteCheckedImportedAudio: importedAudio.length,
  byteCheckedMinesweeperSourceCSS: mineCssSha === mineSourceCss?.sha,
  byteCheckedTetrisSourceCSS: tetrisCSSSha === tetrisSourceCSS?.sha,
  styles: inventory.filter(x => x.path.startsWith("src/styles/")).length,
  byStatus,
  externalApps: externalEntries.length,
  externalAppStatus: Object.fromEntries(["pending", "in-progress", "implemented", "verified"]
    .map(status => [status, externalEntries.filter(x => x.status === status).length])),
  failures
}, null, 2));
if (process.argv.includes("--require-complete") && (byStatus.pending + byStatus["in-progress"] > 0 || externalEntries.some(x => x.status !== "verified"))) {
  console.error("Full legacy functional parity not yet established.");
  process.exitCode = 1;
}
if (failures.length) process.exitCode = 1;
