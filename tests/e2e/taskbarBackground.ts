import {expect,type Page} from "@playwright/test";

/** Open the real blank taskbar surface, independently of alignment, pinned
 * icons, running groups and viewport width. Do not dispatch synthetic events
 * or click the Start button at the old centered-only left-edge coordinate. */
export async function openTaskbarBackgroundContext(page:Page){
  const bar=page.locator(".windows-taskbar");
  await expect(bar).toBeVisible();
  const point=await bar.evaluate(el=>{
    const {left,right,top,height}=el.getBoundingClientRect();
    const y=top+height/2;
    for(let x=Math.ceil(right)-2;x>left+1;x--){
      const hit=document.elementFromPoint(x,y);
      if(hit&&el.contains(hit)&&!hit.closest("button,[data-test-tray-icon],.windows-taskbar__tray,[data-test-taskbar-search],input")){
        return {x,y};
      }
    }
    return null;
  });
  if(!point)throw Error("No visible empty taskbar background");
  await page.mouse.click(point.x,point.y,{button:"right"});
  await expect(page.locator('[data-test-taskbar-context="background"]')).toBeVisible();
}
