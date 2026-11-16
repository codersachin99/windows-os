import {expect,test} from "@playwright/test";

test("original Games Start entry opens source shell:games pane with installed titles",async({page})=>{
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-games]").click();
  const win=page.locator('[data-test-window="games"]');
  await expect(win).toBeVisible();
  const games=win.locator("[data-test-games-root]");
  await expect(games).toHaveAttribute("data-source-path","shell:games");
  const offline=games.locator('[data-test-source-listview="offline-games"]');
  await expect(offline).toBeVisible();
  await expect(offline.locator("[data-test-offline-game]")).toHaveCount(7);
  await expect(games.locator('[data-test-offline-game="chess"]'))
    .toContainText("Chess Titans");
  await expect(games.locator('[data-test-offline-game="tetris"]'))
    .toContainText("Classic Tetris");
  await expect(games.locator('[data-test-offline-game="tetris"]'))
    .toContainText("Albert Lobo");
  // Installed source .exe stubs do NOT mean an implemented game engine.
  for(const id of ["chess","mahjong","minesweeper","purbleplace",
    "solitaire","spidersolitaire","tetris"]){
    await expect(games.locator('[data-test-offline-game="'+id+'"]'))
      .toBeDisabled();
  }
  await expect(games.locator('[data-test-source-listview="online-games"]'))
    .toBeVisible();
  await expect(games.locator("[data-test-offline-game]")).toHaveCount(7);
  await games.locator("[data-test-games-offline-toggle]").click();
  await expect(offline).toHaveCount(0);
  await expect(games.locator("[data-test-games-offline-toggle]"))
    .toHaveAttribute("aria-expanded","false");
  await games.locator("[data-test-games-offline-toggle]").click();
  await expect(offline.locator("[data-test-offline-game]")).toHaveCount(7);
  await expect(games.getByRole("navigation",{name:"Games history"})).toBeVisible();
});

test("XP Games shell remains navigable without borrowing Win7 history artwork",async({page})=>{
  await page.goto("/?theme=winxp");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-games]").click();
  const games=page.locator('[data-test-window="games"] [data-test-games-root]');
  await expect(games).toBeVisible();
  await expect(games.getByRole("navigation",{name:"Games history"})).toHaveCount(0);
  await expect(games.locator("[data-test-offline-game]")).toHaveCount(7);
});
