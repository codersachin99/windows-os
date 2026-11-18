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

const SOURCE_SHA = "26b9f0ce7a1665dee89a7c81824bec09e2c75776";
const SHARED_SCENES = ["guest-desktop", "computer-root", "computer-organize", "computer-view", "recycle-bin"];
// Source-side fixture actions for these scenarios have not been verified against
// pinned Vue runtime. Capture React evidence now, never fabricate source pairs.
const TARGET_ONLY_SCENES = [
  "computer-system-drive", "computer-search-results", "computer-new-folder",
  "recycle-bin-populated", "recycle-bin-search-results",
  // React-only app baselines until original source runtime pairing is proven.
  "calc-initial", "notepad-initial", "chrome-new-tab", "ie-home",
  "player-initial", "snipping-initial", "recorder-initial",
  "computer-details-metadata", "computer-tiles-metadata", "computer-message-confirm",
  // Source registry, indexed search and working Backup/Action Center views.
  // Target-only until the private pinned Vue runtime can be captured.
  "cpanel-root", "cpanel-search", "cpanel-backup", "cpanel-action-center",
  // Games shell and first source-backed playable game. React-only until
  // original Vue source runtime can be launched at the pinned SHA.
  "games-library", "minesweeper-initial", "minesweeper-intermediate",
  "minesweeper-advanced", "minesweeper-statistics", "minesweeper-result",
  "tetris-initial", "tetris-playing", "tetris-help", "tetris-statistics",
  // Theme-scoped React screenshot evidence: not yet paired with the
  // original private Vue theme-specific desktop/login runtime.
  "winxp-guest-desktop", "winxp-start-menu",
  "win10-guest-desktop", "win10-start-menu", "win10-context-menu",
  "win10-computer", "win10-recycle-bin",
  "win11-guest-desktop", "win11-start-menu"
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

async function enterDesktop(page, kind, origin, scene) {
  // Source-paired scenes remain immutable Win7; per-theme React previews
  // are explicitly target-only until the pinned Vue fixture is validated.
  const theme=kind==="target"&&scene.startsWith("winxp-")?"winxp":
    kind==="target"&&scene.startsWith("win10-")?"win10":
    kind==="target"&&scene.startsWith("win11-")?"win11":"win7";
  // All mapped React logon families retain explicit Guest selection.
  await page.goto(origin + "/?theme="+theme,
    {waitUntil:"domcontentloaded",timeout:60000});
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

  // Bounded screenshot fixtures for source-theme shell personalities.
  // These are TARGET ONLY: no unsupported visual parity conclusion is
  // drawn without the pinned original theme's own screenshot.
  if(kind==="target" && /^(winxp|win10|win11)-/.test(scene)){
    if(scene.endsWith("guest-desktop"))return;
    if(scene.endsWith("start-menu")){
      await page.getByRole("button",{name:"Open Start menu"}).click();
      await page.locator("[data-test-start-menu]")
        .waitFor({state:"visible",timeout:15000});
      return;
    }
    if(scene==="win10-context-menu"){
      await page.locator("#desktop-icons").click({
        button:"right",position:{x:250,y:185}
      });
      await page.locator("[data-test-desktop-menu]")
        .waitFor({state:"visible",timeout:15000});
      return;
    }
    if(scene.endsWith("-computer")||scene.endsWith("-recycle-bin")){
      await openWindow(page,kind,scene.endsWith("-computer")?"computer":"bin");
      return;
    }
    throw new Error("Unmapped target-only theme scene: "+scene);
  }

  // Source selectors and source filesystem mutations require an actual pinned
  // legacy run. Until tested, these additional fixtures are React-only.
  if (kind === "target" && TARGET_ONLY_SCENES.includes(scene)) {
    const appScenes = {
      "calc-initial": "calc",
      "notepad-initial": "notepad",
      "chrome-new-tab": "chrome",
      "ie-home": "ie",
      "player-initial": "player",
      "snipping-initial": "snipping",
      "recorder-initial": "recorder"
    };
    const appId = appScenes[scene];
    if (appId) {
      await page.getByRole("button", { name: "Open Start menu" }).click();
      await page.locator('[data-test-program="' + appId + '"]').click();
      await page.locator('[data-test-window="' + appId + '"]')
        .waitFor({ state: "visible", timeout: 15000 });
      return;
    }
    if (scene.startsWith("tetris-")) {
      await page.getByRole("button",{name:"Open Start menu"}).click();
      await page.locator("[data-test-open-games]").click();
      const games=page.locator('[data-test-window="games"] [data-test-games-root]');
      await games.waitFor({state:"visible",timeout:15000});
      await games.locator('[data-test-offline-game="tetris"]').click();
      const game=page.locator('[data-test-window="tetris"] [data-test-tetris-root]');
      await game.waitFor({state:"visible",timeout:15000});
      await game.locator("[data-test-tetris-canvas]")
        .waitFor({state:"visible",timeout:10000});
      if(scene==="tetris-playing"){
        await page.evaluate(()=>{Math.random=()=>0.5;});
        await game.locator('[data-test-tetris="play"]').click();
        await page.keyboard.press("Space");
        await page.waitForFunction(()=>{
          const score=document.querySelector('[data-test-tetris-root]');
          return Number(score?.getAttribute("data-test-tetris-score"))>0;
        },null,{timeout:15000});
      }else if(scene==="tetris-help"){
        await game.getByRole("button",{name:"Help",exact:true}).click();
        await game.getByRole("menuitem",{name:"View Help"}).click();
        await page.locator('[data-test-child-window="tetris-help"]')
          .waitFor({state:"visible",timeout:10000});
      }else if(scene==="tetris-statistics"){
        await game.getByRole("button",{name:"Game",exact:true}).click();
        await game.getByRole("menuitem",{name:"Statistics"}).click();
        await page.locator('[data-test-child-window="tetris-stats"]')
          .waitFor({state:"visible",timeout:10000});
      }
      return;
    }
    if (scene==="games-library"||scene.startsWith("minesweeper-")) {
      await page.getByRole("button",{name:"Open Start menu"}).click();
      await page.locator("[data-test-open-games]").click();
      const games=page.locator('[data-test-window="games"] [data-test-games-root]');
      await games.waitFor({state:"visible",timeout:15000});
      await games.locator('[data-test-offline-game="minesweeper"]')
        .waitFor({state:"visible",timeout:10000});
      if(scene==="games-library")return;
      await games.locator('[data-test-offline-game="minesweeper"]').click();
      const mine=page.locator('[data-test-window="minesweeper"] [data-test-minesweeper]');
      await mine.waitFor({state:"visible",timeout:15000});
      if(scene==="minesweeper-intermediate"||scene==="minesweeper-advanced"){
        await mine.getByRole("button",{name:"Game",exact:true}).click();
        await mine.getByRole("menuitemradio",{name:
          scene==="minesweeper-advanced"?"Advanced":"Intermediate"}).click();
        if(scene==="minesweeper-advanced"){
          await page.locator('[data-test-window="minesweeper"].is-maximized')
            .waitFor({state:"visible",timeout:15000});
          // Wait for the effect scheduled *after* fullscreen layout. The
          // level changes before the new viewport-derived board is mounted.
          await page.waitForFunction(()=>{
            const root=document.querySelector(
              '[data-test-window="minesweeper"] [data-test-minesweeper]');
            const measure=root?.querySelector(
              '[data-test-minesweeper-advanced-viewport]');
            const grid=root?.querySelector('[data-test-minesweeper-level="2"]');
            if(!measure||!grid)return false;
            const rows=Number(grid.getAttribute("data-test-minesweeper-rows"));
            const cols=Number(grid.getAttribute("data-test-minesweeper-cols"));
            const targetRows=Math.max(2,Math.floor((measure.clientHeight-1)/22));
            const targetCols=Math.max(2,Math.floor((measure.clientWidth-1)/22));
            return rows===targetRows&&cols===targetCols&&
              grid.querySelectorAll('[data-test-mine-cell]').length===rows*cols;
          },null,{timeout:20000});
        }else{
          await mine.locator("[data-test-mine-cell]").first()
            .waitFor({state:"visible",timeout:10000});
        }
      }else if(scene==="minesweeper-statistics"){
        await mine.getByRole("button",{name:"Game",exact:true}).click();
        await mine.getByRole("menuitem",{name:"Statistics"}).click();
        await page.locator("[data-test-minesweeper-statistics]")
          .waitFor({state:"visible",timeout:10000});
      }else if(scene==="minesweeper-result"){
        await page.evaluate(()=>{Math.random=()=>0.5;});
        await mine.getByRole("button",{name:"New Game"}).click();
        await mine.locator('[data-test-mine-cell="1:0"]').click();
        await mine.locator('[data-test-mine-cell="0:0"]').click();
        await page.locator("[data-test-minesweeper-result-dialog]")
          .waitFor({state:"visible",timeout:10000});
      }
      return;
    }
    if (scene.startsWith("cpanel-")) {
      await page.getByRole("button", { name: "Open Start menu" }).click();
      await page.locator('[data-test-open-cpanel]').click();
      const panel = page.locator('[data-test-window="cpanel"] [data-test-cpanel]');
      await panel.waitFor({ state: "visible", timeout: 15000 });
      if (scene === "cpanel-search") {
        await panel.getByRole("searchbox", { name: "Search Control Panel" })
          .fill('"screen resolution"');
        // The original 1902 search engine delays results by 300 ms.
        await panel.locator('[data-test-cpanel-result="display"]')
          .waitFor({ state: "visible", timeout: 10000 });
      } else if (scene === "cpanel-backup") {
        await panel.locator('[data-test-cpanel-item="backup"]').click();
        await panel.locator('[data-test-cpanel-backup]')
          .waitFor({ state: "visible", timeout: 10000 });
      } else if (scene === "cpanel-action-center") {
        await panel.locator('[data-test-cpanel-item="action-center"]').click();
        await panel.locator('[data-test-cpanel-action-center]')
          .waitFor({ state: "visible", timeout: 10000 });
      } else {
        await panel.locator('[data-test-cpanel-items]')
          .waitFor({ state: "visible", timeout: 10000 });
      }
      return;
    }
    if (scene === "recycle-bin-search-results") {
      const bin = await openWindow(page, kind, "bin");
      const search = bin.getByRole("searchbox", { name: "Search files" });
      await search.fill("NonexistentParityCaptureFixture");
      await bin.getByText("0 found", { exact: true }).waitFor({ state: "visible", timeout: 12000 });
      await bin.getByRole("button", { name: "Save search", exact: true }).waitFor({ state: "visible" });
      return;
    }
    const explorer = await openWindow(page, kind, "computer");
    if (["computer-details-metadata", "computer-tiles-metadata",
      "computer-message-confirm"].includes(scene)) {
      await explorer.getByRole("button", { name: "New folder" }).click();
      const prompt = explorer.getByRole("dialog", { name: "New folder" });
      await prompt.getByRole("textbox", { name: "New folder name" })
        .fill("ParitySourceUI");
      await prompt.getByRole("button", { name: "OK" }).click();
      const row = explorer.locator('[data-test-explorer-item="ParitySourceUI"]');
      await row.waitFor({ state: "visible", timeout: 15000 });
      if (scene === "computer-details-metadata") {
        await explorer.getByRole("button", { name: "View", exact: true }).click();
        await explorer.getByRole("menu", { name: "View options" })
          .getByRole("menuitemradio", { name: "Details" }).click();
        await explorer.locator('[data-test-source-listview="details"]')
          .waitFor({ state: "visible" });
      }
      if (scene === "computer-message-confirm") {
        await row.click();
        await explorer.getByRole("button", { name: "Delete", exact: true }).click();
        await explorer.getByRole("alertdialog", { name: "Confirm file operation" })
          .waitFor({ state: "visible" });
      }
      return;
    }
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
          await enterDesktop(page, kind, origin, scene);
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
