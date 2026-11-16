import {test,expect} from "@playwright/test";

async function openMinesweeper(page:import("@playwright/test").Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-games]").click();
  const games=page.locator('[data-test-window="games"]');
  await expect(games).toBeVisible();
  await games.locator('[data-test-offline-game="minesweeper"]').click();
  const win=page.locator('[data-test-window="minesweeper"]');
  await expect(win).toBeVisible();
  return win.locator("[data-test-minesweeper]");
}

test("native Minesweeper has 8x9 source beginner grid, flags and real reveal",async({page})=>{
  const mine=await openMinesweeper(page);
  const cells=mine.locator("[data-test-mine-cell]");
  await expect(cells).toHaveCount(72);
  await expect(mine.locator("[data-test-minesweeper-remaining]")).toHaveText("10");
  await expect(mine.locator("[data-test-minesweeper-seconds]")).toHaveText("0");
  // Source first click protects from a mine by regenerating the board.
  await mine.locator('[data-test-mine-cell="0:0"]').click();
  await expect(mine.locator(".windows-minesweeper__cell.is-open").first())
    .toBeVisible();
  // Start a new pristine round for deterministic flag-cycle assertions:
  // pinned 245c rerolls only once after a first-click mine, so that
  // rare second mine must not make tests nondeterministic.
  await mine.getByRole("button",{name:"New Game"}).click();
  await expect(mine.locator(".windows-minesweeper__cell.is-open")).toHaveCount(0);
  const covered=mine.locator(".windows-minesweeper__cell:not(.is-open)").first();
  await covered.click({button:"right"});
  await expect(covered).toHaveText("F");
  await expect(mine.locator("[data-test-minesweeper-remaining]")).toHaveText("9");
  await covered.click({button:"right"});
  await expect(covered).toHaveText("?");
  await covered.click({button:"right"});
  await expect(covered).toBeEmpty();
  await expect(mine.locator("[data-test-minesweeper-remaining]")).toHaveText("10");
  await mine.getByRole("button",{name:"New Game"}).click();
  await expect(cells).toHaveCount(72);
  await expect(mine.locator(".windows-minesweeper__cell.is-open")).toHaveCount(0);
});

test("native Minesweeper changes source difficulty and supports touch flag mode",async({page})=>{
  const mine=await openMinesweeper(page);
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await mine.getByRole("menuitemradio",{name:"Intermediate"}).click();
  await expect(mine.locator("[data-test-mine-cell]")).toHaveCount(144);
  await expect(mine.locator("[data-test-minesweeper-remaining]")).toHaveText("30");
  const flagMode=mine.locator("[data-test-minesweeper-flag-mode]");
  await flagMode.check();
  const first=mine.locator('[data-test-mine-cell="0:0"]');
  await first.click();
  await expect(first).toHaveText("F");
  await expect(mine.locator("[data-test-minesweeper-remaining]")).toHaveText("29");
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await mine.getByRole("menuitemradio",{name:"Beginner"}).click();
  await expect(mine.locator("[data-test-mine-cell]")).toHaveCount(72);
  await expect(flagMode).not.toBeChecked();
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await expect(mine.getByRole("menuitem",{name:"Advanced"})).toBeDisabled();
  await mine.getByRole("menuitem",{name:"Exit"}).click();
  await expect(page.locator('[data-test-window="minesweeper"]')).toHaveCount(0);
  await expect(page.locator('[data-test-window="games"]')).toBeVisible();
});
