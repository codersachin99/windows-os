#!/usr/bin/env node
/**
 * Explicit screenshot-capture utility: captures are NOT pixel-parity claims.
 * Target-only captures are a reproducible React baseline, not source evidence.
 *
 * node scripts/capture-visual-parity.mjs --target-url http://127.0.0.1:1420
 * node scripts/capture-visual-parity.mjs --source-url http://127.0.0.1:8099 --source-sha PINNED_SHA
 */
import { chromium, devices } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve, join } from "node:path";

const SOURCE_SHA = "4e63290d783009e1293433c6ccf252abba9c1187";
const SHARED_SCENES = ["guest-desktop", "computer-root", "computer-organize", "computer-view", "recycle-bin"];
// Source-side fixture actions for these scenarios have not been verified against
// pinned Vue runtime. Capture React evidence now, never fabricate source pairs.
const TARGET_ONLY_SCENES = [
  "computer-system-drive", "computer-search-results", "computer-new-folder",
  "recycle-bin-populated", "recycle-bin-search-results"
];
const SCENES = [...SHARED_SCENES, ...TARGET_ONLY_SCENES];
const FIXED_CLOCK = "2026-11-11T12:00:00.000Z";
const argv = process.argv.slice(2);
const argument = (key, fallback = "") => {
  const i = argv.indexOf(key);
  if (i < 0) return fallback;
  if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error("Missing value for " + key);
  return argv[i + 1];
};
const outputRoot = resolve(argument("--output", "artifacts/visual-parity"));
const targetUrl = argument("--target-url", "http://127.0.0.1:1420");
const sourceUrl = argument("--source-url");
const targetSha = argument("--target-sha", process.env.GITHUB_SHA ?? "unverified");
const sourceSha = argument("--source-sha", "unverified");

function onlyLoopback(url) {
  const parsed = new URL(url);
  if (parsed.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname)) {
    throw new Error("Visual capture only accepts local HTTP server URLs");
  }
  return parsed.origin;
}
const targetOrigin = onlyLoopback(targetUrl);
const sourceOrigin = sourceUrl ? onlyLoopback(sourceUrl) : "";
if (sourceOrigin && sourceOrigin === targetOrigin) throw new Error("Source and target must be distinct local servers");
if (sourceOrigin && sourceSha !== SOURCE_SHA) {
  throw new Error("Source capture requires verified pinned SHA " + SOURCE_SHA + "; got " + sourceSha);
}
const profiles = [
  { name: "desktop", device: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 } },
  { name: "mobile", device: { ...devices["Pixel 7"] } }
];
const manifest = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  sourceReferenceSha: SOURCE_SHA,
  sourceRevisionClaimed: sourceOrigin ? sourceSha : null,
  sourceConfigured: Boolean(sourceOrigin),
  targetRevision: targetSha,
  targetOrigin,
  sourceOrigin: sourceOrigin || null,
  fixedClock: FIXED_CLOCK,
  sharedSceneNames: SHARED_SCENES,
  targetOnlySceneNames: TARGET_ONLY_SCENES,
  captures: [],
  errors: [],
  parityStatus: "not-assessed"
};
await mkdir(outputRoot, { recursive: true });

async function enterDesktop(page, kind, origin) {
  // Both versions expose the original Win7 Guest avatar marker.
  await page.goto(origin + "/?theme=win7", { waitUntil: "domcontentloaded", timeout: 60000 });
  const avatar = page.locator('[data-test-avatar="win7"]');
  await avatar.waitFor({ state: "visible", timeout: 60000 });
  await avatar.click();
  const desktop = kind === "source" ? page.locator("#main") : page.locator("[data-test-main-screen]");
  await desktop.waitFor({ state: "visible", timeout: 60000 });
}

async function openWindow(page, kind, app) {
  if (kind === "target") {
    await page.locator('[data-test-desktop-icon="' + app + '"]').dblclick({ timeout: 15000 });
    const win = page.locator('[data-test-window="' + app + '"]');
    await win.waitFor({ state: "visible", timeout: 15000 });
    return win;
  }
  // Original system/main.js renders #desktop-icons with item-icon components.
  const label = app === "computer" ? "Computer" : "Recycle Bin";
  const icon = page.locator("#desktop-icons").getByText(label, { exact: true }).first();
  await icon.dblclick({ timeout: 15000 });
  // Original computer.js and bin.js share .window__wrapper.is-computer.
  const win = page.locator(".window__wrapper.is-computer").last();
  await win.waitFor({ state: "visible", timeout: 20000 });
  return win;
}

async function prepareScene(page, kind, scene) {
  if (scene === "guest-desktop") return;

  // Source selectors and source filesystem mutations require an actual pinned
  // legacy run. Until tested, these additional fixtures are React-only.
  if (kind === "target" && TARGET_ONLY_SCENES.includes(scene)) {
    if (scene === "recycle-bin-search-results") {
      const bin = await openWindow(page, kind, "bin");
      const search = bin.getByRole("searchbox", { name: "Search files" });
      await search.fill("NonexistentParityCaptureFixture");
      await bin.getByText("0 found", { exact: true }).waitFor({ state: "visible", timeout: 12000 });
      await bin.getByRole("button", { name: "Save search", exact: true }).waitFor({ state: "visible" });
      return;
    }
    const explorer = await openWindow(page, kind, "computer");
    if (scene === "recycle-bin-populated") {
      await explorer.getByRole("button", { name: "New folder" }).click();
      const create = explorer.getByRole("dialog", { name: "New folder" });
      await create.getByRole("textbox", { name: "New folder name" }).fill("ParityCaptureRecycle");
      await create.getByRole("button", { name: "OK" }).click();
      const item = explorer.locator('[data-test-explorer-item="ParityCaptureRecycle"]');
      await item.waitFor({ state: "visible" });
      await item.click();
      await explorer.getByRole("button", { name: "Delete", exact: true }).click();
      await explorer.getByRole("alertdialog", { name: "Confirm file operation" })
        .getByRole("button", { name: "Yes" }).click();
      await item.waitFor({ state: "detached" });
      const bin = await openWindow(page, kind, "bin");
      await bin.locator('[data-test-explorer-item="ParityCaptureRecycle"]')
        .waitFor({ state: "visible" });
      return;
    }
    if (scene === "computer-new-folder") {
      await explorer.getByRole("button", { name: "Documents", exact: true }).click();
      await explorer.getByRole("button", { name: "New folder" }).click();
      const dialog = explorer.getByRole("dialog", { name: "New folder" });
      await dialog.getByRole("textbox", { name: "New folder name" }).fill("ParityCaptureFolder");
      await dialog.getByRole("button", { name: "OK" }).click();
      await explorer.locator('[data-test-explorer-item="ParityCaptureFolder"]')
        .waitFor({ state: "visible" });
      return;
    }
    await explorer.getByRole("button", { name: "System (C:)", exact: true }).click();
    await explorer.locator('[data-test-explorer-item="Users"]')
      .waitFor({ state: "visible" });
    if (scene === "computer-search-results") {
      await explorer.getByRole("searchbox", { name: "Search files" }).fill("Users");
      await explorer.getByText("1 found", { exact: true })
        .waitFor({ state: "visible", timeout: 12000 });
      await explorer.getByRole("button", { name: "Save search", exact: true })
        .waitFor({ state: "visible" });
    }
    return;
  }

  const win = await openWindow(page, kind, scene === "recycle-bin" ? "bin" : "computer");
  if (scene === "computer-organize") {
    const button = kind === "target"
      ? win.getByRole("button", { name: "Organize", exact: true })
      : win.getByText("Organize", { exact: true }).first();
    await button.click();
    await (kind === "target"
      ? win.getByRole("menu", { name: "Organize" })
      : win.locator(".winui-menu").first()).waitFor({ state: "visible", timeout: 8000 });
  }
  if (scene === "computer-view") {
    const button = kind === "target"
      ? win.getByRole("button", { name: "View", exact: true })
      : win.locator(".winui-menuitem.ml-auto").first();
    await button.click();
    await (kind === "target"
      ? win.getByRole("menu", { name: "View options" })
      : win.locator(".winui-menu.is-view").first()).waitFor({ state: "visible", timeout: 8000 });
  }
}

const browser = await chromium.launch({ headless: true });
manifest.chromiumVersion = browser.version();
try {
  for (const { name, device } of profiles) {
    for (const kind of sourceOrigin ? ["source", "target"] : ["target"]) {
      for (const scene of kind === "source" ? SHARED_SCENES : SCENES) {
        const origin = kind === "source" ? sourceOrigin : targetOrigin;
        const context = await browser.newContext({
          ...device, locale: "en-US", colorScheme: "light",
          reducedMotion: "reduce", serviceWorkers: "block"
        });
        const page = await context.newPage();
        const pageErrors = [];
        page.on("pageerror", error => pageErrors.push(String(error).slice(0, 500)));
        const record = {
          implementation: kind, profile: name, scene,
          viewport: device.viewport, deviceScaleFactor: device.deviceScaleFactor,
          sourceComparisonEligible: SHARED_SCENES.includes(scene),
          status: "failed", file: null, screenshotSha256: null, pageErrors
        };
        manifest.captures.push(record);
        try {
          await page.clock.setFixedTime(new Date(FIXED_CLOCK));
          await enterDesktop(page, kind, origin);
          await prepareScene(page, kind, scene);
          const directory = join(outputRoot, kind, name);
          await mkdir(directory, { recursive: true });
          const destination = join(directory, scene + ".png");
          const screenshot = await page.screenshot({
            path: destination, animations: "disabled", timeout: 20000
          });
          record.file = kind + "/" + name + "/" + scene + ".png";
          record.screenshotSha256 = createHash("sha256").update(screenshot).digest("hex");
          record.screenshotBytes = screenshot.length;
          record.status = "captured";
          console.log("CAPTURED " + record.file);
        } catch (error) {
          const message = (kind + "/" + name + "/" + scene + ": " + String(error)).slice(0, 1500);
          record.error = message;
          manifest.errors.push(message);
          console.error("CAPTURE ERROR " + message);
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  manifest.sourceCaptured = manifest.captures.filter(c => c.implementation === "source" && c.status === "captured").length;
  await writeFile(join(outputRoot, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}
console.log(JSON.stringify({
  sourceConfigured: manifest.sourceConfigured,
  sourceCaptured: manifest.sourceCaptured,
  successes: manifest.captures.filter(c => c.status === "captured").length,
  targetOnlyCaptured: manifest.captures.filter(c => c.implementation === "target"
    && !c.sourceComparisonEligible && c.status === "captured").length,
  errors: manifest.errors.length,
  parityStatus: manifest.parityStatus,
  artifactDirectory: outputRoot
}));
if (manifest.errors.length) process.exitCode = 1;
