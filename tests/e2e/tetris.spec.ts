import {test,expect,type Page} from "@playwright/test";

async function openTetris(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-games]").click();
  const games=page.locator('[data-test-window="games"]');
  await expect(games).toBeVisible();
  const tile=games.locator('[data-test-offline-game="tetris"]');
  await expect(tile).toBeEnabled();
  await tile.click();
  const win=page.locator('[data-test-window="tetris"]');
  await expect(win).toBeVisible();
  const game=win.locator('[data-test-tetris-root]');
  await expect(game).toBeVisible();
  return {win,game};
}

test("pinned Classic Tetris 13bc runs in source fullscreen with real canvas and controls",async({page})=>{
  const {win,game}=await openTetris(page);
  await expect(win).toHaveClass(/is-maximized/);
  await expect(win.getByRole("button",{name:"Maximize Classic Tetris"})).toHaveCount(0);
  await expect(game).toHaveAttribute("data-test-tetris-state","game-over");
  const canvas=game.locator("[data-test-tetris-canvas]");
  await expect(canvas).toBeVisible();
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(200);
  expect(box!.height).toBeGreaterThan(100);
  await game.locator('[data-test-tetris="play"]').click();
  await expect(game).toHaveAttribute("data-test-tetris-state","drop");
  await expect(game.locator('[data-test-tetris="play"]')).toHaveAttribute("aria-label","Pause");
  await page.keyboard.press("p");
  await expect(game).toHaveAttribute("data-test-tetris-state","pause");
  await page.keyboard.press("p");
  await expect(game).toHaveAttribute("data-test-tetris-state","drop");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await expect.poll(async()=>Number(await game.getAttribute("data-test-tetris-score")),
    {timeout:6000}).toBeGreaterThan(0);
  await expect(game.locator('[data-test-tetris="new"]')).toBeVisible();
  await game.locator('[data-test-tetris="new"]').click();
  await expect(game).toHaveAttribute("data-test-tetris-score","0");
  await expect(game).toHaveAttribute("data-test-tetris-state","drop");
});

test("Tetris Help and Statistics are parent-locked source child windows",async({page})=>{
  const {win,game}=await openTetris(page);
  await game.getByRole("button",{name:"Help",exact:true}).click();
  await game.getByRole("menuitem",{name:"View Help"}).click();
  const help=page.locator('[data-test-child-window="tetris-help"]');
  await expect(help).toBeVisible();
  await expect(help).toContainText("Hard drop: Space bar.");
  await expect(win).toHaveJSProperty("inert",true);
  await help.getByRole("button",{name:"Close Help"}).click();
  await expect(win).toHaveJSProperty("inert",false);
  await game.getByRole("button",{name:"Game",exact:true}).click();
  await game.getByRole("menuitem",{name:"Statistics"}).click();
  const stats=page.locator('[data-test-child-window="tetris-stats"]');
  await expect(stats).toBeVisible();
  await expect(stats.locator('[data-test-tetris-statistics]')).toContainText("Games played: 0");
  await stats.getByRole("button",{name:"Reset"}).click();
  await expect(stats.getByRole("alertdialog",{name:"Reset statistics"})).toBeVisible();
  await stats.getByRole("button",{name:"Cancel"}).click();
  await expect(stats.getByRole("alertdialog",{name:"Reset statistics"})).toHaveCount(0);
  await stats.getByRole("button",{name:"Close Statistics"}).click();
  await expect(win).toHaveJSProperty("inert",false);
  await game.getByRole("button",{name:"Game",exact:true}).click();
  await game.getByRole("menuitem",{name:"Exit"}).click();
  await expect(page.locator('[data-test-window="tetris"]')).toHaveCount(0);
  await expect(page.locator('[data-test-window="games"]')).toBeVisible();
});

test("source 13bc Tetris keyboard aliases, wheel direction and secondary tap",async({page})=>{
  const {game}=await openTetris(page);
  // Original source chooses one of seven pieces on Play, using Math.random
  // at game-start; 0.5 selects the four-rotation L tetromino.
  await page.evaluate(()=>{Math.random=()=>0.5;});
  await game.locator('[data-test-tetris="play"]').click();
  await expect(game).toHaveAttribute("data-test-tetris-state","drop");
  await expect(game).toHaveAttribute("data-test-tetris-rotation","0");
  await page.keyboard.press("x");
  await expect(game).toHaveAttribute("data-test-tetris-rotation","1");
  await page.keyboard.press("z");
  await expect(game).toHaveAttribute("data-test-tetris-rotation","0");
  const canvas=game.locator('[data-test-tetris-canvas]');
  await canvas.hover();
  await page.mouse.wheel(0,120);
  await expect(game).toHaveAttribute("data-test-tetris-rotation","1");
  await page.mouse.wheel(0,-120);
  await expect(game).toHaveAttribute("data-test-tetris-rotation","0");
  // Source primary tap rotates clockwise and secondary tap opposite.
  const bounds=await canvas.boundingBox();
  expect(bounds).not.toBeNull();
  const x=bounds!.x+bounds!.width/2;
  const y=bounds!.y+bounds!.height/2;
  await page.mouse.click(x,y,{button:"right"});
  await expect(game).toHaveAttribute("data-test-tetris-rotation","3");
  await page.mouse.click(x,y,{button:"left"});
  await expect(game).toHaveAttribute("data-test-tetris-rotation","0");
});

test("source 13bc captured pointer drag moves a piece before release",async({page})=>{
  const {game}=await openTetris(page);
  await page.evaluate(()=>{Math.random=()=>0.5;});
  await game.locator('[data-test-tetris="play"]').click();
  await expect(game).toHaveAttribute("data-test-tetris-position",/^[0-9]+:[0-9]+$/);
  const initial=await game.getAttribute("data-test-tetris-position");
  const initialX=Number(initial?.split(":")[0]);
  const canvas=game.locator('[data-test-tetris-canvas]');
  const box=await canvas.boundingBox();
  expect(box).not.toBeNull();
  const y=box!.y+Math.min(box!.height/2,300);
  await page.mouse.move(box!.x+box!.width/2,y);
  await page.mouse.down();
  await page.mouse.move(box!.x+6,y,{steps:18});
  await expect.poll(async()=>
    Number((await game.getAttribute("data-test-tetris-position"))?.split(":")[0]),
    {timeout:5000}).toBeLessThan(initialX);
  await page.mouse.up();
  await expect(game).toHaveAttribute("data-test-tetris-state","drop");
});
