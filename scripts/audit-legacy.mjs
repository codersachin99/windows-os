#!/usr/bin/env node
import { readFile } from "node:fs/promises";
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
const byStatus = Object.fromEntries(["pending", "in-progress", "implemented", "verified"]
  .map(status => [status, tracker.modules.filter(m => m.status === status).length]));
console.log(JSON.stringify({
  referenceSha: tracker.referenceSha,
  totalSourceFiles: inventory.length,
  sourceModules: sourceModules.length,
  assets: inventory.filter(x => x.path.startsWith("assets/")).length,
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
