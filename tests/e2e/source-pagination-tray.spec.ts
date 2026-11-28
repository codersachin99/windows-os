import {test,expect} from "@playwright/test";
test("Win7 source taskbar overflow exposes each pinned program through row navigation",async({page})=>{
  const pins=["computer","notepad","calc","cmd","paint","cpanel","camera","recorder","chrome","ie","taskmgr","find"];
  await page.setViewportSize({width:480,height:800});
  await page.addInitScript(ids=>localStorage.setItem("windows-os:taskbar:pins:v1",JSON.stringify(ids)),pins);
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const lane=page.locator(".windows-taskbar__running");
  const prev=lane.locator("[data-test-taskbar-scroll-prev]"),next=lane.locator("[data-test-taskbar-scroll-next]");
  await expect(next).toBeVisible();await expect(prev).toBeDisabled();
  await expect(lane.locator("[data-test-taskbar-scrollbar]")).toHaveCSS("width","24px");
  await expect(next).toHaveCSS("background-color","rgba(0, 0, 0, 0)");
  expect(await next.evaluate(el=>getComputedStyle(el,"::after").backgroundImage)).toContain("data:image/svg+xml");
  const seen:string[]=[];
  for(let index=0;index<pins.length;index++){
    seen.push(...await lane.locator("[data-test-taskbar-pin]").evaluateAll(nodes=>nodes.map(node=>node.getAttribute("data-test-taskbar-pin")??"")));
    if(await next.isDisabled())break;
    await next.click();
    await expect(lane).toHaveAttribute("data-test-taskbar-row",String(index+1));
  }
  expect(seen).toContain("computer");expect(seen).toContain("find");
  expect(seen).toEqual(pins.filter(id=>seen.includes(id)));
  await expect(next).toBeDisabled();
  await prev.click();await expect(next).toBeEnabled();
  await page.setViewportSize({width:1920,height:1080});
  await expect(lane.locator("[data-test-taskbar-scrollbar]")).toHaveCount(0);
  await expect(lane).toHaveAttribute("data-test-taskbar-row","0");
  await expect(lane.locator('[data-test-taskbar-pin="computer"]')).toBeVisible();
  await expect(lane.locator('[data-test-taskbar-pin="find"]')).toBeVisible();
});
