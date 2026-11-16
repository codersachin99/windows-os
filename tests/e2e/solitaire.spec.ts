import {expect,test,type Page} from "@playwright/test";

async function openSolitaire(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-games]").click();
  const games=page.locator('[data-test-window="games"]');
  await expect(games).toBeVisible();
  const tile=games.locator('[data-test-offline-game="solitaire"]');
  await expect(tile).toBeEnabled();
  await tile.click();
  const win=page.locator('[data-test-window="solitaire"]');
  const game=win.locator("[data-test-solitaire-root]");
  await expect(game).toBeVisible();
  return {win,game};
}

test("e202 Klondike renders 52 original cards and runs stock, draw and undo",async({page})=>{
  const {game}=await openSolitaire(page);
  const board=game.locator("[data-test-solitaire-board]");
  await expect(board).toHaveCSS("background-image",
    /cards-bg-klondike\.85b0dfcd\.webp/);
  const cards=game.locator("[data-test-solitaire-card]");
  await expect(cards).toHaveCount(52);
  await expect(game.locator('[data-test-pile="stock"]')).toHaveCount(24);
  await expect(game.locator('[data-test-pile="tableau-6"]')).toHaveCount(7);
  await expect(game.locator(".windows-solitaire__slot")).toHaveCount(13);
  await expect(cards.first()).toHaveCSS("background-image",
    /cards-spritesheet\.f136d9d3\.webp/);
  await expect(game).toHaveAttribute("data-test-solitaire-score","0");
  await game.locator("[data-test-solitaire-stock]").click();
  await expect(game.locator('[data-test-pile="stock"]')).toHaveCount(21);
  await expect(game.locator('[data-test-pile="waste"]')).toHaveCount(3);
  await game.getByRole("button",{name:"Game",exact:true}).click();
  await game.locator("[data-test-solitaire-undo]").click();
  await expect(game.locator('[data-test-pile="stock"]')).toHaveCount(24);
  await expect(game.locator('[data-test-pile="waste"]')).toHaveCount(0);
  await game.getByRole("button",{name:"Game",exact:true}).click();
  await game.locator("[data-test-solitaire-draw-one]").click();
  await game.locator("[data-test-solitaire-stock]").click();
  await expect(game.locator('[data-test-pile="waste"]')).toHaveCount(1);
  await expect(game.locator('[data-test-pile="stock"]')).toHaveCount(23);
});

test("e202 card pointer drag is live, source-backed and cancellable",async({page})=>{
  const {game}=await openSolitaire(page);
  const card=game.locator('[data-test-pile="tableau-0"].can-play');
  await expect(card).toHaveCount(1);
  const box=await card.boundingBox();
  expect(box).not.toBeNull();
  const x=box!.x+box!.width/2,y=box!.y+box!.height/2;
  await page.mouse.move(x,y);
  await page.mouse.down();
  await page.mouse.move(x+24,y+10,{steps:5});
  await expect(game.locator(".windows-solitaire__drag")).toBeVisible();
  await expect(card).toHaveClass(/is-hidden/);
  await page.mouse.up();
  await expect(game.locator(".windows-solitaire__drag")).toHaveCount(0);
  await expect(game.locator("[data-test-solitaire-card]")).toHaveCount(52);
});

test("source Solitaire appearance and Help use parent-locked child windows",async({page})=>{
  const {win,game}=await openSolitaire(page);
  await game.getByRole("button",{name:"Game",exact:true}).click();
  await game.getByRole("menuitem",{name:"Change Appearance"}).click();
  const appearance=page.locator('[data-test-child-window="solitaire-appearance"]');
  await expect(appearance).toBeVisible();
  await expect(win).toHaveJSProperty("inert",true);
  await appearance.getByRole("button",{name:"Card back 2"}).click();
  await expect(appearance.getByRole("button",{name:"Card back 2"}))
    .toHaveAttribute("aria-pressed","true");
  await appearance.getByRole("button",{name:"Close Change Appearance"}).click();
  await expect(win).toHaveJSProperty("inert",false);
  await game.getByRole("button",{name:"Help",exact:true}).click();
  await game.getByRole("menuitem",{name:"View Help"}).click();
  const help=page.locator('[data-test-child-window="solitaire-help"]');
  await expect(help).toContainText("Ace to King");
  await help.getByRole("button",{name:"Close Help"}).click();
  await game.getByRole("button",{name:"Game",exact:true}).click();
  await game.getByRole("menuitem",{name:"Exit"}).click();
  await expect(page.locator('[data-test-window="solitaire"]')).toHaveCount(0);
});
