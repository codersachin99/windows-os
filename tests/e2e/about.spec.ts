import { expect, test, type Page } from "@playwright/test";

async function login(page:Page) {
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator("#desktop-icons")).toBeVisible();
}
async function runCommand(page:Page,command:string) {
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-start-menu] [data-test-program="run"]').click();
  const run=page.locator('[data-test-window="run"]').last();
  await expect(run).toBeVisible();
  await run.getByRole("textbox",{name:"Open:"}).fill(command);
  await run.getByRole("button",{name:"OK"}).click();
  await expect(run).toHaveCount(0);
}
async function openAbout(page:Page) {
  await runCommand(page,"winver");
  const about=page.locator('[data-test-window="about"]');
  await expect(about).toBeVisible();
  return about;
}

test("original About is centered 520x400 close-only and has no titlebar icon",async({page})=>{
  await login(page);
  const about=await openAbout(page);
  const view=page.viewportSize();
  if(!view)throw Error("Viewport not available");
  const rect=await about.boundingBox();
  if(!rect)throw Error("About window not positioned");
  expect(Math.round(rect.width)).toBe(Math.min(view.width,520));
  expect(Math.round(rect.height)).toBe(Math.min(view.height-40,400));
  expect(Math.round(rect.x)).toBe(Math.round((view.width-Math.min(520,view.width))/2));
  expect(Math.round(rect.y)).toBe(Math.round((view.height-40-Math.min(400,view.height-40))/2));
  await expect(about.locator(".windows-window__titlebar > img")).toHaveCount(0);
  await expect(about.getByRole("button",{name:"Close About"})).toBeVisible();
  await expect(about.getByRole("button",{name:"Minimize About"})).toHaveCount(0);
  await expect(about.getByRole("button",{name:"Maximize About"})).toHaveCount(0);
  await about.getByRole("button",{name:"Close About"}).click();
  await expect(about).toHaveCount(0);
});

test("About displays exact source Windows 7 Simulator brand and legal text",async({page})=>{
  await login(page);
  const about=await openAbout(page);
  await expect(about.getByRole("heading",{level:2})).toContainText("Windows");
  await expect(about.getByRole("heading",{level:2})).toContainText("Simulator");
  await expect(about.locator(".windows-about__brand img"))
    .toHaveAttribute("src",/start-button-classic\.ec7b0b9f\.webp/);
  await expect(about.locator(".windows-about__brand img"))
    .toHaveAttribute("width","44");
  await expect(about.locator(".windows-about__description")).toContainText("WindowsOS");
  await expect(about.locator(".windows-about__description")).toContainText("Version 0.0.1");
  await expect(about.locator(".windows-about__description"))
    .toContainText("Windows 7 Copyright © Microsoft Corporation.");
  await expect(about.locator(".windows-about__description"))
    .toContainText("Legacy Windows OS is a windows web platform to showcase and experience the legacy operating systems with core functionalities.");
  await expect(about.getByRole("navigation",{name:"About links"}))
    .toContainText("Privacy Policy - Changelog - Report bugs");
  await expect(about.locator('[data-test-credits-button]')).toHaveText("Credits");
});

test("without APP_CONFIG About labels are visible but no invented destinations work",async({page})=>{
  await login(page);
  const about=await openAbout(page);
  await expect(about.locator("a")).toHaveCount(0);
  await expect(about.locator('[data-test-about="privacy"]'))
    .toHaveAttribute("aria-disabled","true");
  await expect(about.locator('[data-test-about="changelog"]'))
    .toHaveAttribute("aria-disabled","true");
  await expect(about.locator('[data-test-about="bugs"]'))
    .toHaveAttribute("aria-disabled","true");
  await expect(about.getByRole("button",{name:"Credits"})).toBeDisabled();
});

test("APP_CONFIG supplies original privacy/changelog/bugs links and Credits opens configured URL",async({page})=>{
  await page.addInitScript(()=>{
    (window as Window & {APP_CONFIG?:{getUrl:(key:string)=>string}}).APP_CONFIG={
      getUrl: key => "https://example.org/windowsos/" + key
    };
  });
  await login(page);
  const about=await openAbout(page);
  for(const [testId,key] of [
    ["privacy","privacyUrl"],["changelog","changelogUrl"],["bugs","reportIssue"]
  ]) {
    const link=about.locator('[data-test-about="'+testId+'"]');
    await expect(link).toHaveAttribute("href","https://example.org/windowsos/"+key);
    await expect(link).toHaveAttribute("target","_blank");
    await expect(link).toHaveAttribute("rel",/noopener noreferrer/);
  }
  await expect(about.getByRole("link",{name:"WindowsOS"}))
    .toHaveAttribute("href","https://example.org/windowsos/url");
  await page.evaluate(()=>{
    const browser=window as Window & {__openedCredits?:string[]};
    browser.__openedCredits=[];
    window.open=((url?:string|URL)=>{
      browser.__openedCredits!.push(String(url));
      return null;
    }) as typeof window.open;
  });
  const credits=about.getByRole("button",{name:"Credits"});
  await expect(credits).toBeEnabled();
  await credits.click();
  expect(await page.evaluate(()=>
    (window as Window & {__openedCredits?:string[]}).__openedCredits
  )).toEqual(["https://example.org/windowsos/creditsUrl"]);
});

test("source winver.exe and installed C-drive path reuse single About dialog",async({page})=>{
  await login(page);
  await runCommand(page,"winver.exe");
  const about=page.locator('[data-test-window="about"]');
  await expect(about).toHaveCount(1);
  await runCommand(page,"C:\\Windows\\System32\\winver.exe");
  await expect(about).toHaveCount(1);
  await expect(page.getByRole("button",{name:"Switch to About"})).toHaveCount(1);
  expect(await page.evaluate(()=>window.scrollX)).toBe(0);
});
