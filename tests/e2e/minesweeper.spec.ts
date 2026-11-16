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
  await expect(mine.locator('.windows-minesweeper__stats-icon[src*="minesweeper-timer"]'))
    .toHaveAttribute("src","/assets/images/minesweeper-timer.663f9d44.webp");
  await expect(mine.locator('.windows-minesweeper__stats-icon[src*="minesweeper-mine"]'))
    .toHaveAttribute("src","/assets/images/minesweeper-mine.cbba8bd0.webp");
  await expect(mine.locator('[data-test-mine-cell="0:0"]'))
    .toHaveCSS("background-image",/minesweeper-cell\.a0c15d1c\.webp/);
  await expect(mine.locator('[data-test-minesweeper-total-mines]')).toHaveText("10");
  await expect(mine.locator('[data-test-minesweeper-bgm]'))
    .toHaveAttribute("src","/assets/audio/minesweeper-new.60909dd9.mp3");
  await expect(mine.locator('[data-test-minesweeper-sfx]'))
    .toHaveAttribute("src","/assets/audio/minesweeper-lose.b3b70bbb.mp3");
  await expect(mine.locator(".windows-minesweeper__source-grid"))
    .toHaveCSS("background-image",/linear-gradient/);
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
  // The source's 21px 12x12 board exceeds the initial migration frame on
  // some mobile viewports. Verify all cells remain reachable via in-window
  // scrolling rather than mistaking screenshot clipping for lost rows.
  const finalCell=mine.locator('[data-test-mine-cell="11:11"]');
  await finalCell.scrollIntoViewIfNeeded();
  await expect(finalCell).toBeVisible();
  const stage=await mine.locator(".windows-minesweeper__stage").boundingBox();
  const last=await finalCell.boundingBox();
  expect(stage).not.toBeNull();
  expect(last).not.toBeNull();
  if(stage&&last)expect(last.y+last.height)
    .toBeLessThanOrEqual(stage.y+stage.height+2);
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
  await expect(mine.getByRole("menuitemradio",{name:"Advanced"})).toBeEnabled();
  await mine.getByRole("menuitem",{name:"Exit"}).click();
  await expect(page.locator('[data-test-window="minesweeper"]')).toHaveCount(0);
  await expect(page.locator('[data-test-window="games"]')).toBeVisible();
});

test("source 245c loss reveals mines, delays result, and supports statistics/reset",async({page})=>{
  const mine=await openMinesweeper(page);
  // The original 9538 Fisher-Yates with RNG 0.5 places a mine at 0:0,
  // while 1:0 is a safe numbered cell. Restart AFTER fixing RNG so both
  // board positions are deterministic across Chromium profiles.
  await page.evaluate(()=>{Math.random=()=>0.5;});
  await mine.getByRole("button",{name:"New Game"}).click();
  const safe=mine.locator('[data-test-mine-cell="1:0"]');
  await safe.click();
  await expect(safe).toHaveClass(/is-open/);
  await mine.locator('[data-test-mine-cell="0:0"]').click();
  await expect(mine.locator('[data-test-mine-cell="0:0"]')).toHaveClass(/is-mine/);
  const dialog=page.locator('[data-test-minesweeper-result-dialog]');
  await expect(dialog).toBeVisible({timeout:6000});
  await expect(dialog).toContainText("Sorry you lost this game. Better luck next time!");
  await expect(dialog.getByRole("button",{name:"Play again"})).toBeVisible();
  await dialog.getByRole("button",{name:"Play again"}).click();
  await expect(dialog).toHaveCount(0);
  await expect(mine.locator('[data-test-mine-cell]')).toHaveCount(72);
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await mine.getByRole("menuitem",{name:"Statistics"}).click();
  const stats=page.locator('[data-test-minesweeper-statistics]');
  await expect(stats).toBeVisible();
  await expect(stats.locator('[data-test-mine-games-played]')).toHaveText("Games played: 1");
  await expect(stats.locator('[data-test-mine-games-won]')).toHaveText("Games won: 0");
  await expect(stats.locator('[data-test-mine-win-percentage]'))
    .toHaveText("Win percentage: 0%");
  await stats.getByRole("combobox").selectOption("1");
  await expect(stats.locator('[data-test-mine-games-played]')).toHaveText("Games played: 0");
  await stats.getByRole("combobox").selectOption("0");
  await stats.getByRole("button",{name:"Reset"}).click();
  const confirmation=page.locator('[data-test-minesweeper-reset-confirm]');
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button",{name:"Cancel"}).click();
  await expect(stats.locator('[data-test-mine-games-played]')).toHaveText("Games played: 1");
  await stats.getByRole("button",{name:"Reset"}).click();
  await confirmation.getByRole("button",{name:"Reset"}).click();
  await expect(stats.locator('[data-test-mine-games-played]')).toHaveText("Games played: 0");
  await stats.getByRole("button",{name:"Close"}).click();
  await expect(stats).toHaveCount(0);
});

test("source Advanced fills the fixed game's fullscreen window using 22px viewport math",async({page})=>{
  const mine=await openMinesweeper(page);
  const windowFrame=page.locator('[data-test-window="minesweeper"]');
  await expect(windowFrame).not.toHaveClass(/is-maximized/);
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await mine.getByRole("menuitemradio",{name:"Advanced"}).click();
  await expect(windowFrame).toHaveClass(/is-maximized/);
  const stage=mine.locator('[data-test-minesweeper-advanced-viewport]');
  const {rows,cols,mines}=await stage.evaluate(element=>{
    const height=(element.clientHeight-1)/22;
    const width=(element.clientWidth-1)/22;
    return {
      rows:Math.max(2,Math.floor(height)),
      cols:Math.max(2,Math.floor(width)),
      mines:Math.floor(height*width/2)
    };
  });
  expect(rows*cols).toBeGreaterThan(144);
  expect(rows*cols).toBeLessThanOrEqual(20000);
  const grid=mine.locator('[data-test-minesweeper-level="2"]');
  await expect(grid).toHaveAttribute("data-test-minesweeper-rows",String(rows));
  await expect(grid).toHaveAttribute("data-test-minesweeper-cols",String(cols));
  await expect(mine.locator("[data-test-mine-cell]")).toHaveCount(rows*cols);
  await expect(mine.locator("[data-test-minesweeper-total-mines]"))
    .toHaveText(String(mines));
  const last=mine.locator('[data-test-mine-cell="'+(cols-1)+":"+(rows-1)+'"]');
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeVisible();
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await mine.getByRole("menuitemradio",{name:"Beginner"}).click();
  await expect(windowFrame).not.toHaveClass(/is-maximized/);
  await expect(mine.locator("[data-test-mine-cell]")).toHaveCount(72);
  await expect(mine.locator('[data-test-minesweeper-total-mines]')).toHaveText("10");
});

test("source Minesweeper result and statistics are independent locked child windows",async({page})=>{
  const mine=await openMinesweeper(page);
  const parent=page.locator('[data-test-window="minesweeper"]');
  const id=await parent.getAttribute("data-test-window-id");
  expect(id).toBeTruthy();
  await mine.getByRole("button",{name:"Game",exact:true}).click();
  await mine.getByRole("menuitem",{name:"Statistics"}).click();
  const child=page.locator('[data-test-child-window="minesweeper-stats"]');
  await expect(child).toBeVisible();
  await expect(child).toHaveAttribute("data-test-child-parent",id!);
  await expect(child.getByRole("dialog",{name:"Minesweeper Statistics"}))
    .toHaveCount(0); // Child itself is the dialog, not a nested modal
  await expect(child).toHaveAttribute("role","dialog");
  await expect(child.locator(".windows-window__titlebar"))
    .toContainText("Minesweeper Statistics");
  await expect(parent).toHaveJSProperty("inert",true);
  await child.getByRole("button",{name:"Close Minesweeper Statistics"}).click();
  await expect(child).toHaveCount(0);
  await expect(parent).toHaveJSProperty("inert",false);
  // Source result child titlebar close exits the whole game.
  await page.evaluate(()=>{Math.random=()=>0.5;});
  await mine.getByRole("button",{name:"New Game"}).click();
  await mine.locator('[data-test-mine-cell="1:0"]').click();
  await mine.locator('[data-test-mine-cell="0:0"]').click();
  const result=page.locator('[data-test-child-window="minesweeper-result"]');
  await expect(result).toBeVisible({timeout:6000});
  await expect(result).toHaveAttribute("data-test-child-parent",id!);
  await expect(parent).toHaveJSProperty("inert",true);
  await result.getByRole("button",{name:"Close Games lost"}).click();
  await expect(page.locator('[data-test-window="minesweeper"]')).toHaveCount(0);
  await expect(result).toHaveCount(0);
});
