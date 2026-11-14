import { expect, test, type Locator, type Page } from "@playwright/test";

const sourceKey="windows-os:legacy-sticky:guest:v1";
async function login(page:Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function openSticky(page:Page):Promise<Locator> {
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-start-menu] [data-test-program="sticky"]').click();
  const app=page.locator('[data-test-window="sticky"]');
  await expect(app).toBeVisible();
  return app;
}
async function saved(page:Page) {
  return page.evaluate(key=>{
    const raw=localStorage.getItem(key);
    return raw?JSON.parse(raw) as {notes:{
      x:number;y:number;w:number;h:number;color:string;content:string
    }[]}:null;
  },sourceKey);
}
async function dragHeader(page:Page,note:Locator,dx:number,dy:number) {
  const header=await note.locator('[data-test-sticky-drag]').boundingBox();
  if(!header)throw Error("Sticky drag header not measurable");
  const start={x:header.x+header.width/2,y:header.y+header.height/2};
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(start.x+dx,start.y+dy,{steps:10});
  await page.mouse.up();
}
async function resizeCorner(page:Page,note:Locator,dx:number,dy:number) {
  const handle=await note.locator('[data-test-sticky-resize="se"]').boundingBox();
  if(!handle)throw Error("Sticky resize handle not measurable");
  const start={x:handle.x+handle.width/2,y:handle.y+handle.height/2};
  await page.mouse.move(start.x,start.y);
  await page.mouse.down();
  await page.mouse.move(start.x+dx,start.y+dy,{steps:10});
  await page.mouse.up();
}
test("source Sticky Notes opens a frameless centered yellow 200x200 note with exact icons",async({page})=>{
  await login(page);
  const app=await openSticky(page);
  await expect(app.locator('[data-test-sticky-notes]')).toHaveCount(1);
  const note=app.locator('[data-test-sticky-notes]').first();
  await expect(note).toHaveAttribute("data-test-sticky-color","yellow");
  await expect(note).toHaveCSS("background-color","rgb(255, 254, 179)");
  const rect=await note.boundingBox();
  if(!rect)throw Error("Missing note bounds");
  const viewport=page.viewportSize();
  if(!viewport)throw Error("Missing viewport");
  expect(rect.width).toBe(200);
  expect(rect.height).toBe(200);
  expect(Math.abs(rect.x-(viewport.width-200)/2)).toBeLessThan(2);
  expect(Math.abs(rect.y-(viewport.height-200)/2)).toBeLessThan(2);
  await expect(note.getByRole("button",{name:"Add note"}).locator("img"))
    .toHaveAttribute("src",/stickynotes-add\.bfbefc41\.webp/);
  await expect(note.getByRole("button",{name:"Close note"}).locator("img"))
    .toHaveAttribute("src",/stickynotes-close\.80b2c95a\.webp/);
  await expect(page.getByRole("button",{name:"Switch to Sticky Notes"})).toBeVisible();
  await expect(app.locator(".windows-window__titlebar")).toHaveCount(0);
});

test("source add/color/text records persist after 600ms and survive Guest reload",async({page})=>{
  await login(page);
  const app=await openSticky(page);
  const first=app.locator('[data-test-sticky-notes]').first();
  const editor=first.getByRole("textbox",{name:"Sticky note text"});
  await editor.fill("Remember dairy 🥛 and groceries");
  expect(await saved(page)).toBeNull();
  await expect.poll(async()=>{
    const data=await saved(page);
    return data?.notes[0]?.content;
  }).toBe("Remember dairy 🥛 and groceries");
  await first.getByRole("button",{name:"Add note"}).click();
  await expect(app.locator('[data-test-sticky-notes]')).toHaveCount(2);
  const second=app.locator('[data-test-sticky-notes]').last();
  await expect(second).toHaveAttribute("data-test-sticky-color",
    /^(blue|green|pink|purple|white|yellow)$/);
  await second.getByRole("textbox",{name:"Sticky note text"}).fill("Second note");
  await expect.poll(async()=> (await saved(page))?.notes[1]?.content)
    .toBe("Second note");
  const stored=await saved(page);
  expect(stored?.notes).toHaveLength(2);
  expect(Object.keys(stored!.notes[0]).sort())
    .toEqual(["color","content","h","w","x","y"]);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const reopened=await openSticky(page);
  const restored=reopened.locator('[data-test-sticky-notes]');
  await expect(restored).toHaveCount(2);
  await expect(restored.first().getByRole("textbox",{name:"Sticky note text"}))
    .toHaveValue("Remember dairy 🥛 and groceries");
  await expect(restored.last().getByRole("textbox",{name:"Sticky note text"}))
    .toHaveValue("Second note");
});

test("free-floating note drag and southeast resize persist exact geometry",async({page})=>{
  await login(page);
  const app=await openSticky(page);
  const note=app.locator('[data-test-sticky-notes]').first();
  const before=await note.boundingBox();
  if(!before)throw Error("Original note missing");
  await dragHeader(page,note,32,26);
  const moved=await note.boundingBox();
  if(!moved)throw Error("Moved note missing");
  expect(moved.x-before.x).toBeGreaterThan(20);
  expect(moved.y-before.y).toBeGreaterThan(16);
  await resizeCorner(page,note,24,30);
  const resized=await note.boundingBox();
  if(!resized)throw Error("Resized note missing");
  expect(resized.width).toBeGreaterThan(before.width+15);
  expect(resized.height).toBeGreaterThan(before.height+20);
  const data=await saved(page);
  expect(data?.notes).toHaveLength(1);
  expect(data!.notes[0].x).toBeCloseTo(resized.x,0);
  expect(data!.notes[0].y).toBeCloseTo(resized.y,0);
  expect(data!.notes[0].w).toBeCloseTo(resized.width,0);
  expect(data!.notes[0].h).toBeCloseTo(resized.height,0);
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const again=await openSticky(page);
  const restored=await again.locator('[data-test-sticky-notes]').first().boundingBox();
  if(!restored)throw Error("Restored note missing");
  expect(restored.x).toBeCloseTo(resized.x,0);
  expect(restored.y).toBeCloseTo(resized.y,0);
  expect(restored.width).toBeCloseTo(resized.width,0);
  expect(restored.height).toBeCloseTo(resized.height,0);
});

test("one source app owns all notes; minimize/restore retains edits; final close resets on reopen",async({page})=>{
  await login(page);
  const app=await openSticky(page);
  const initial=app.locator('[data-test-sticky-notes]').first();
  await initial.getByRole("textbox",{name:"Sticky note text"}).fill("Keep on minimize");
  await initial.getByRole("button",{name:"Add note"}).click();
  await expect(app.locator('[data-test-sticky-notes]')).toHaveCount(2);
  await page.getByRole("button",{name:"Switch to Sticky Notes"}).click();
  await expect(page.locator('[data-test-window="sticky"]')).toHaveCount(0);
  await page.getByRole("button",{name:"Switch to Sticky Notes"}).click();
  await expect(app).toBeVisible();
  await expect(app.locator('[data-test-sticky-notes]').first()
    .getByRole("textbox",{name:"Sticky note text"})).toHaveValue("Keep on minimize");
  await openSticky(page);
  await expect(page.getByRole("button",{name:"Switch to Sticky Notes"})).toHaveCount(1);
  await expect(app.locator('[data-test-sticky-notes]')).toHaveCount(2);
  await app.locator('[data-test-sticky-notes]').last()
    .getByRole("button",{name:"Close note"}).click();
  await expect(app.locator('[data-test-sticky-notes]')).toHaveCount(1);
  expect((await saved(page))?.notes).toHaveLength(1);
  await app.locator('[data-test-sticky-notes]').first()
    .getByRole("button",{name:"Close note"}).click();
  await expect(page.locator('[data-test-window="sticky"]')).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Switch to Sticky Notes"})).toHaveCount(0);
  expect((await saved(page))?.notes).toEqual([]);
  const reopened=await openSticky(page);
  await expect(reopened.locator('[data-test-sticky-notes]')).toHaveCount(1);
  await expect(reopened.locator('[data-test-sticky-notes]').first())
    .toHaveAttribute("data-test-sticky-color","yellow");
  await expect(reopened.getByRole("textbox",{name:"Sticky note text"})).toHaveValue("");
});

test("original Run executable StikyNot.exe opens real Sticky Notes module",async({page})=>{
  await login(page);
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-start-menu] [data-test-program="run"]').click();
  const run=page.locator('[data-test-window="run"]');
  await run.getByRole("textbox",{name:"Open:"}).fill("StikyNot.exe");
  await run.getByRole("button",{name:"OK"}).click();
  await expect(run).toHaveCount(0);
  await expect(page.locator('[data-test-window="sticky"] [data-test-sticky-notes]'))
    .toHaveCount(1);
});
