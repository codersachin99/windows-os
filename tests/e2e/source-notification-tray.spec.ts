import {test,expect} from "@playwright/test";
import type {SourceNotificationInput} from "../../packages/sdk/src/sourceNotifications";

/** Exercise the actual dev-server SDK singleton without a shipped test hook
 * or a synthetic production feed. Capture the module URL used by Vite. */
test("Win7 notification queue, inline links, anchoring and read history",async({page,context})=>{
  let sdkUrl="";
  page.on("request",request=>{
    if(new URL(request.url()).pathname.endsWith("/packages/sdk/src/sourceNotifications.ts"))sdkUrl=request.url();
  });
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const shell=page.locator("[data-test-main-screen]");
  const center=shell.locator("[data-test-action-center]");
  await expect(center).toBeVisible();
  expect(sdkUrl).not.toBe("");
  const publish=async(input:SourceNotificationInput)=>page.evaluate(async({url,input})=>{
    const {sourceNotifications}=await import(/* @vite-ignore */ url) as typeof import("../../packages/sdk/src/sourceNotifications");
    return sourceNotifications.publish(input);
  },{url:sdkUrl,input});
  const state=()=>page.evaluate(async url=>{
    const {sourceNotifications}=await import(/* @vite-ignore */ url) as typeof import("../../packages/sdk/src/sourceNotifications");
    return sourceNotifications.snapshot();
  },sdkUrl);
  const destination="http://127.0.0.1:1420/notification-test-target";
  await context.route(destination,route=>route.fulfill({contentType:"text/html",body:"<title>Test destination</title>"}));
  expect(await publish({id:"e2e-warning",type:"warning",title:"Warning",body:"First line\nSecond line"})).toBe(true);
  expect(await publish({id:"e2e-error",type:"error",title:"Update",body:"Open [changelog]("+destination+")"})).toBe(true);
  const toast=shell.locator("[data-test-system-notification]");
  await expect(toast).toHaveAttribute("data-notification-id","e2e-warning");
  await expect(toast).toHaveAttribute("data-notification-anchor","icon");
  const rect=(await toast.boundingBox())!,icon=(await center.boundingBox())!,viewport=page.viewportSize()!;
  expect(rect.y+rect.height).toBeLessThanOrEqual(icon.y);
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.x+rect.width).toBeLessThanOrEqual(viewport.width+1);
  await expect(center).toHaveAttribute("data-notification-severity","error");
  await toast.locator("[data-test-notification-close]").click();
  await expect(toast).toHaveAttribute("data-notification-id","e2e-error");
  expect((await state()).history.find(m=>m.id==="e2e-warning")).toMatchObject({seen:true,read:false});
  const link=toast.getByRole("link",{name:"changelog"});
  await expect(link).toHaveAttribute("href",destination);
  const opened=page.waitForEvent("popup");
  await link.click();
  const popup=await opened;
  await expect(popup).toHaveURL(destination);
  await popup.close();
  await expect(toast).toHaveCount(0);
  expect((await state()).history.find(m=>m.id==="e2e-error")).toMatchObject({seen:true,read:true});
  await expect(center).toHaveAttribute("data-notification-severity","warning");
  await center.click();
  const summary=shell.locator("[data-test-action-center-popup]");
  await expect(summary.locator("[data-test-notification-summary]")).toHaveText("2 messages");
  await expect(summary.locator("[data-test-notification-item]")).toHaveText(["Update","Warning"]);
  await summary.locator("[data-test-open-action-center]").click();
  const history=page.locator('[data-test-window="cpanel"]').last().locator("[data-test-cpanel-action-center]");
  await expect(history.locator("[data-test-cpanel-action-message]")).toHaveCount(2);
  await expect(history.locator('[data-test-cpanel-action-message="e2e-error"] img')).toHaveAttribute("src","/assets/images/notifi-error.362aae4b.webp");
  await expect(history.getByRole("link",{name:"changelog"})).toHaveAttribute("href",destination);
  await expect.poll(async()=>(await state()).history.every(m=>m.read&&m.seen)).toBe(true);
  await expect(center).not.toHaveAttribute("data-notification-severity",/warning|error/);
  const flags=await page.evaluate(()=>JSON.parse(localStorage.getItem("windows-os:device:notifications:v1")??"{}"));
  expect(flags.read).toEqual(expect.arrayContaining(["e2e-error","e2e-warning"]));
});
