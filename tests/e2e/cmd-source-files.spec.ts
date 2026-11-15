import {expect,test,type Locator,type Page} from "@playwright/test";

/** Guest source executable/shortcut installations are the real shared VFS,
 * not a mocked second CMD directory tree or an actual host filesystem.
 */
async function launchSourceCommandPrompt(page:Page):Promise<{
  cmd:Locator;input:Locator;output:Locator
}>{
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  const start=page.locator('[data-test-start-menu]');
  await start.locator('[data-test-all-programs]').click();
  await start.locator('[data-test-source-program-folder="Accessories"]').click();
  const sourceCmd=start.locator('[data-test-source-program="cmd"]');
  await expect(sourceCmd).toHaveAttribute("data-source-program-artwork","original");
  await expect(sourceCmd.locator("img")).toHaveAttribute(
    "src",/\/cmd\.a2c1d19b\.webp$/
  );
  await sourceCmd.click();
  const cmd=page.locator('[data-test-window="cmd"]');
  const input=cmd.locator('[data-test-cmd-input]');
  await expect(input).toBeVisible();
  return {cmd,input,output:cmd.locator('[data-test-cmd-output]').last()};
}
async function execute(input:Locator,command:string):Promise<void>{
  await input.fill(command);
  await input.press("Enter");
}

test("source CMD COPY MOVE TYPE TREE and simulated volume use the same installed Guest files",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  const source="AppData\\Roaming\\WindowsOS\\Windows\\Start Menu\\Programs\\Accessories\\Notepad.lnk";
  await execute(input,'copy "'+source+'" Desktop');
  await expect(output).toHaveText("        1 file(s) copied.");
  await execute(input,"move Desktop\\Notepad.lnk Documents\\CopiedShortcut.lnk");
  await expect(output).toHaveText("        1 file(s) moved.");
  await execute(input,"type Documents\\CopiedShortcut.lnk");
  await expect(output).toHaveText('{"exe":"notepad","icon":"notepad"}');
  await execute(input,"tree Documents /f");
  await expect(output).toContainText("CopiedShortcut.lnk");
  await expect(output).toContainText("Volume Serial Number is ");
  await execute(input,"vol");
  await expect(output).toContainText("Volume in drive C is System");
  await execute(input,"tree Desktop /f");
  await expect(output).toContainText("No subfolders exist");
  await execute(input,"dir /b Documents");
  await expect(output).toContainText("CopiedShortcut.lnk");
  await execute(input,"exit");
  await expect(cmd).toHaveCount(0);
});

test("source CMD DATE TIME and hexadecimal COLOR are visible without altering host settings",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"date /t");
  await expect(output).toHaveText(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) \d\d\/\d\d\/\d{4}$/);
  await execute(input,"time /t");
  await expect(output).toHaveText(/^\d\d:\d\d:\d\d\.\d\d$/);
  await execute(input,"color 0a");
  await expect(cmd.locator('[data-test-cmd-container]')).toHaveCSS(
    "color","rgb(22, 198, 12)");
  await execute(input,"color 00");
  await execute(input,"echo %ERRORLEVEL%");
  await expect(output).toHaveText("1");
  await execute(input,"color");
  await expect(cmd.locator('[data-test-cmd-container]')).toHaveCSS(
    "background-color","rgb(0, 0, 0)");
});

test("original CMD Tab cycles source VFS paths, quotes spaces, and Escape clears",async({page})=>{
  const {cmd,input}=await launchSourceCommandPrompt(page);
  await input.fill("cd D");
  await input.press("Tab");
  await expect(input).toHaveValue("cd Desktop");
  await input.press("Tab");
  await expect(input).toHaveValue("cd Documents");
  await input.press("Escape");
  await expect(input).toHaveValue("");

  await execute(input,'md "Documents\\My Source Folder"');
  await expect(cmd.locator("[data-test-cmd-entry]")).toHaveCount(1);
  await input.fill('cd "Documents\\My So');
  await input.press("Tab");
  await expect(input).toHaveValue('cd "Documents\\My Source Folder"');
  await input.press("Enter");
  await expect(cmd.locator(".cmd__prompt"))
    .toHaveText("C:\\Users\\Guest\\Documents\\My Source Folder>");

  await input.fill("type Q:\\NoMatch");
  await input.press("Tab");
  await expect(input).toHaveValue("type Q:\\NoMatch");
});


test("original CMD chained conditions and quoted operators run on Guest session",async({page})=>{
  const {input,output,cmd}=await launchSourceCommandPrompt(page);
  await execute(input,"echo First & echo Second");
  await expect(output).toHaveText("First\nSecond");
  await execute(input,"unknowncmd && echo Skipped || echo Recovered");
  await expect(output).toContainText("Recovered");
  await expect(output).not.toContainText("Skipped");
  await execute(input,'echo "A & B"');
  await expect(output).toHaveText('"A & B"');
  await execute(input,"md ChainBrowser && cd ChainBrowser");
  await expect(cmd.locator(".cmd__prompt"))
    .toHaveText("C:\\Users\\Guest\\ChainBrowser>");
  await execute(input,"echo %CD%");
  await expect(output).toHaveText("C:\\Users\\Guest\\ChainBrowser");
});


test("source CMD > and >> redirects to the real mounted Guest document store",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"echo original > Documents\\BrowserReport.txt");
  await execute(input,"echo appended >> Documents\\BrowserReport.txt");
  await execute(input,"type Documents\\BrowserReport.txt");
  await expect(output).toContainText("original\nappended");
  await execute(input,'echo "quoted > text" > "Documents\\Quoted Report.txt"');
  await execute(input,'type "Documents\\Quoted Report.txt"');
  await expect(output).toContainText('"quoted > text"');
  await execute(input,"echo forbidden > Q:\\cannot-write.txt");
  await expect(output).toHaveText("The system cannot find the drive specified.");
  await execute(input,"echo end > Documents\\BrowserReport.txt && type Documents\\BrowserReport.txt");
  await expect(output).toContainText("end");
  await expect(output).not.toContainText("original");
});
