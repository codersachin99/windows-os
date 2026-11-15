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
  await expect(output).toHaveText(/First\s+Second/);
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
  await expect(output).toContainText(/original\s+appended/);
  await execute(input,'echo "quoted > text" > "Documents\\Quoted Report.txt"');
  await execute(input,'type "Documents\\Quoted Report.txt"');
  await expect(output).toContainText('"quoted > text"');
  await execute(input,"echo forbidden > Q:\\cannot-write.txt");
  await expect(output).toHaveText("The system cannot find the drive specified.");
  await execute(input,"echo end > Documents\\BrowserReport.txt && type Documents\\BrowserReport.txt");
  await expect(output).toContainText("end");
  await expect(output).not.toContainText("original");
});


test("source CMD SORT FIND MORE pipeline uses shared Guest files and final redirect",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"echo zebra > Documents\\PipeBrowser.txt");
  await execute(input,"echo Apple >> Documents\\PipeBrowser.txt");
  await execute(input,"echo apple >> Documents\\PipeBrowser.txt");
  await execute(input,'type Documents\\PipeBrowser.txt | find /i /c "apple"');
  await expect(output).toHaveText("---------- : 2");
  await execute(input,'type Documents\\PipeBrowser.txt | sort /r | find /i "apple"');
  await expect(output).toContainText(/apple/i);
  await execute(input,"type Documents\\PipeBrowser.txt | more > Documents\\PipeCopy.txt");
  await execute(input,"type Documents\\PipeCopy.txt");
  await expect(output).toContainText("zebra");
  await expect(output).toContainText("Apple");
  await execute(input,'echo "not a | command" | more');
  await expect(output).toContainText("not a | command");
});


test("original CMD Ctrl+C interrupts idle input, leaves history intact and accepts another command",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"echo HistoryBeforeInterrupt");
  await expect(output).toHaveText("HistoryBeforeInterrupt");

  await input.fill("md MustNotBeCreated");
  await input.press("ControlOrMeta+c");
  await expect(input).toHaveValue("");
  const last=cmd.locator("[data-test-cmd-entry]").last();
  await expect(last.locator("[data-test-cmd-line]"))
    .toHaveText("C:\\Users\\Guest>md MustNotBeCreated^C");
  await expect(last.locator("[data-test-cmd-output]")).toHaveCount(0);

  await input.press("ArrowUp");
  await expect(input).toHaveValue("echo HistoryBeforeInterrupt");
  await input.press("Escape");
  await execute(input,"dir /b");
  await expect(output).not.toContainText("MustNotBeCreated");
  await expect(output).toContainText("Documents");
  await execute(input,"echo Ready");
  await expect(output).toHaveText("Ready");
});


test("original CMD PAUSE displays pending prompt and resumes on any key",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  await input.fill("pause");
  await input.press("Enter");
  await expect(output).toHaveText("Press any key to continue . . .");
  await expect(input).toHaveAttribute("readonly","");
  await input.press("x");
  await expect(cmd.locator(".cmd__prompt")).toHaveText("C:\\Users\\Guest>");
  await expect(input).not.toHaveAttribute("readonly");
  await execute(input,"echo Resumed");
  await expect(output).toHaveText("Resumed");

  await input.fill("pause");
  await input.press("Enter");
  await expect(output).toHaveText("Press any key to continue . . .");
  // A second PAUSE must still be in-flight before Ctrl+C. The synchronous
  // source session ref, not a possibly stale render of busy, owns this state.
  await expect(input).toHaveAttribute("readonly","");
  const before=await cmd.locator("[data-test-cmd-entry]").count();
  // Control/Meta keydown must not prematurely release an any-key PAUSE.
  await input.press("Control");
  await expect(input).toHaveAttribute("readonly","");
  await expect(output).toHaveText("Press any key to continue . . .");
  await expect(cmd.locator("[data-test-cmd-entry]")).toHaveCount(before);
  await input.press("ControlOrMeta+c");
  await expect(cmd.locator("[data-test-cmd-entry]")).toHaveCount(before);
  await expect(output).toHaveText("Press any key to continue . . .\n^C");
  await expect(input).not.toHaveAttribute("readonly");
  await execute(input,"echo AfterInterrupt");
  await expect(output).toHaveText("AfterInterrupt");
});


test("source CMD RD /S requires Y and only deletes the confirmed Guest subtree",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"echo anchor > Documents\\DirAnchor.txt");
  await execute(input,"md Documents\\ConfirmDelete");
  await execute(input,"md Documents\\ConfirmDelete\\Nested");
  await execute(input,"rd /s Documents\\ConfirmDelete");
  await expect(output).toContainText("Are you sure (Y/N)?");
  await input.press("n");
  await expect(output).toContainText("Are you sure (Y/N)? n");
  await execute(input,"dir /b Documents");
  await expect(output).toContainText("ConfirmDelete");

  await execute(input,"rd /s Documents\\ConfirmDelete");
  await expect(output).toContainText("Are you sure (Y/N)?");
  await input.press("y");
  await expect(output).toContainText("Are you sure (Y/N)? y");
  await execute(input,"dir /b Documents");
  // DIR /B of an empty folder emits zero output lines, so use a mounted
  // sentinel instead of mistakenly asserting on the prior RD question.
  await expect(output).toContainText("DirAnchor.txt");
  await expect(output).not.toContainText("ConfirmDelete");
});


test("source CMD DEL all-files confirmation preserves folders and respects N/Y",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"md Documents\\TrashPractice");
  await execute(input,"md Documents\\TrashPractice\\ChildFolder");
  await execute(input,"echo keep > Documents\\TrashPractice\\Note.txt");
  await execute(input,"del Documents\\TrashPractice");
  await expect(output).toContainText("Are you sure (Y/N)?");
  await input.press("n");
  await execute(input,"dir /b Documents\\TrashPractice");
  await expect(output).toContainText("Note.txt");
  await execute(input,"del Documents\\TrashPractice\\*");
  await expect(output).toContainText("Are you sure (Y/N)?");
  await input.press("y");
  await execute(input,"dir /b Documents\\TrashPractice");
  await expect(output).not.toContainText("Note.txt");
  await expect(output).toContainText("ChildFolder");
});


test("source CMD nested CMD command displays original banner in the same Guest window",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"cmd");
  await expect(output).toContainText("Microsoft Windows [Version 6.1.7600]");
  await expect(output).toContainText("Copyright (c) 2009");
  await expect(cmd).toHaveCount(1);
  await execute(input,"echo StillInGuest");
  await expect(output).toHaveText("StillInGuest");
});


test("original DIR /B /S /W lists the Guest subtree without invented entries",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"md Documents\\WideNested");
  await execute(input,"echo first > Documents\\WideOne.txt");
  await execute(input,"echo second > Documents\\WideNested\\WideTwo.txt");
  await execute(input,"dir /b /s Documents\\*.txt");
  await expect(output).toContainText("C:\\Users\\Guest\\Documents\\WideOne.txt");
  await expect(output).toContainText(
    "C:\\Users\\Guest\\Documents\\WideNested\\WideTwo.txt"
  );
  await execute(input,"dir /w Documents");
  await expect(output).toContainText("[WideNested]");
  await expect(output).toContainText("WideOne.txt");
  await expect(output).toContainText("Volume Serial Number is");
  await execute(input,"dir Documents\\WideOne.txt");
  await expect(output).toContainText("Directory of C:\\Users\\Guest\\Documents");
  await expect(output).toContainText("WideOne.txt");
  await expect(output).not.toContainText("WideTwo.txt");
});


test("source CMD WHERE reports source app installation paths, never host binaries",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"where notepad");
  await expect(output).toHaveText("C:\\Windows\\System32\\notepad.exe");
  await execute(input,"where calculator");
  await expect(output).toHaveText("C:\\Windows\\System32\\calc.exe");
  await execute(input,"where mspaint.exe");
  await expect(output).toHaveText("C:\\Windows\\System32\\mspaint.exe");
  await execute(input,"where source-never-installed");
  await expect(output)
    .toHaveText("INFO: Could not find files for the given pattern(s).");
});


test("original CMD START opens a real registered Guest app window",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"start missing-app-no-window");
  await expect(output).toHaveText(
    "The system cannot find the file missing-app-no-window."
  );
  await expect(page.locator('[data-test-window="notepad"]')).toHaveCount(0);
  // Launch last: the new Notepad window rightfully receives foreground focus.
  await execute(input,"start notepad");
  await expect(page.locator('[data-test-window="notepad"]')).toBeVisible();
  await expect(cmd).toHaveCount(1);
});


test("source CMD TASKLIST lists simulated windows and TASKKILL closes CMD",async({page})=>{
  const {cmd,input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"tasklist");
  await expect(output).toContainText("Image Name");
  await expect(output).toContainText("cmd.exe");
  await expect(output).toContainText("8,192 K");
  await execute(input,"taskkill /pid 9999");
  await expect(output).toHaveText("ERROR: The process 9999 not found.");
  await execute(input,"taskkill /im cmd.exe");
  await expect(cmd).toHaveCount(0);
});
 

test("original CMD IPCONFIG prints legacy virtual Ethernet values, not host networking",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"ipconfig");
  await expect(output).toContainText("Windows IP Configuration");
  await expect(output).toContainText("Ethernet adapter Local Area Connection:");
  await expect(output).toContainText("192.168.1.42");
  await expect(output).toContainText("255.255.255.0");
  await expect(output).toContainText("192.168.1.1");
  await execute(input,"IPCONFIG /ALL");
  await expect(output).toContainText("192.168.1.42");
  await expect(output).toContainText("Windows IP Configuration");
});


test("original CMD WINVER reuses the installed About Windows dialog host",async({page})=>{
  const {cmd,input}=await launchSourceCommandPrompt(page);
  await execute(input,"winver");
  const about=page.locator('[data-test-window="about"]');
  await expect(about).toBeVisible();
  await expect(about.locator('[data-test-about-dialog]')).toBeVisible();
  await expect(about.getByRole("button",{name:"Close About"})).toBeVisible();
  await about.getByRole("button",{name:"Close About"}).click();
  await expect(about).toHaveCount(0);
  await expect(cmd).toBeVisible();
});


test("original CMD LOGOFF returns to the Guest logon screen",async({page})=>{
  const {input}=await launchSourceCommandPrompt(page);
  await execute(input,"logoff");
  await expect(page.locator('[data-test-avatar="win7"]')).toBeVisible();
  await expect(page.locator('[data-test-window="cmd"]')).toHaveCount(0);
  await expect(page.locator("#desktop-icons")).toHaveCount(0);
});

test("original CMD SHUTDOWN uses the simulator shutdown view only",async({page})=>{
  const {input}=await launchSourceCommandPrompt(page);
  await execute(input,"shutdown");
  await expect(page.locator(".windows-shutdown")).toBeVisible();
  await expect(page.getByText("Windows is shutting down")).toBeVisible();
  await expect(page.getByRole("button",{name:"Restart WindowsOS"})).toBeVisible();
  await expect(page.locator('[data-test-window="cmd"]')).toHaveCount(0);
});


test("original browser CMD HOSTNAME writes the source blank host field",async({page})=>{
  const {cmd,input}=await launchSourceCommandPrompt(page);
  await execute(input,"hostname");
  const entry=cmd.locator("[data-test-cmd-entry]").last();
  await expect(entry.locator("[data-test-cmd-line]")).toContainText("hostname");
  await expect(entry.locator("[data-test-cmd-output]")).toHaveText("");
  await execute(input,"echo HostnameDone");
  await expect(cmd.locator("[data-test-cmd-output]").last()).toHaveText("HostnameDone");
});


test("original CMD SYSTEMINFO prints the source web-device configuration",async({page})=>{
  const {input,output}=await launchSourceCommandPrompt(page);
  await execute(input,"systeminfo");
  await expect(output).toContainText("OS Name:");
  await expect(output).toContainText("Microsoft Windows 7 Simulator");
  await expect(output).toContainText("6.1.7600 Build 7600");
  await expect(output).toContainText("System Manufacturer:");
  await expect(output).toContainText("Total Physical Memory:");
  await expect(output).toContainText("16 GB");
  await expect(output).toContainText("Available Physical Memory:");
  await expect(output).toContainText("16.0 GB");
  await expect(output).toContainText("Camera Resolutions:");
  await expect(output).toContainText("N/A");
  await expect(output).toContainText("Battery:");
  await expect(output).not.toContainText("The simulated device information is unavailable.");
});


test("source CMD BSOD opens the Win7 stop screen and click restarts the Guest simulator",async({page})=>{
  const {input}=await launchSourceCommandPrompt(page);
  await execute(input,"bsod");
  const screen=page.locator("[data-test-bsod-screen]");
  await expect(screen).toBeVisible();
  await expect(screen).toHaveCSS("background-color","rgb(1, 0, 173)");
  await expect(screen).toContainText("ERROR_DUMMY_BSOD");
  await expect(screen).toContainText("Technical information:");
  await expect(screen).toContainText("*** STOP: 0x000000000");
  await expect(page.locator('[data-test-window="cmd"]')).toHaveCount(0);
  await screen.click({position:{x:8,y:8}});
  await expect(page.locator("[data-test-boot-screen]")).toBeVisible();
});
