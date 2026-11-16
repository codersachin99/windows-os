import {expect,test,type Page} from "@playwright/test";

async function openControlPanel(page:Page){
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-open-cpanel]').click();
  const panel=page.locator('[data-test-window="cpanel"]');
  await expect(panel).toBeVisible();
  return panel;
}

test("original Control Panel Display navigation uses actual pinned artwork and Back/Forward history",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await expect(win.locator(".windows-window__titlebar img"))
    .toHaveAttribute("src",/cpanel\.38ffbb1d\.webp/);
  await panel.locator('[data-test-cpanel-item="display"]').click();
  const display=panel.locator("[data-test-cpanel-display]");
  await expect(display).toBeVisible();
  await expect(display.locator(".windows-cpanel__display-preview img"))
    .toHaveAttribute("src",/resolution\.f3fc8376\.webp/);
  // Playwright toBeDisabled checks form controls, not the fieldset
  // container itself. Assert the real inherited HTML disabled attribute.
  await expect(display.locator("fieldset")).toHaveAttribute("disabled","");
  await expect(display.getByLabel("Resolution")).toBeDisabled();
  await expect(display.getByLabel("Zoom")).toBeDisabled();
  await expect(display.getByRole("option",{name:/Fullscreen/})).toHaveCount(1);
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await panel.locator("[data-test-cpanel-forward]").click();
  await expect(display).toBeVisible();
  await display.getByRole("button",{name:"Cancel"}).click();
  await expect(win).toHaveCount(0);
});

test("source Control Panel search returns the Display task and rejects unknown locations",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("resolution");
  const result=panel.locator('[data-test-cpanel-result="display"]');
  await expect(result).toBeVisible();
  await result.locator("[data-test-cpanel-task]").click();
  await expect(panel.locator("[data-test-cpanel-display]")).toBeVisible();
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("unavailable-widget");
  await expect(panel.locator("[data-test-cpanel-results]"))
    .toContainText("No items match your search.");
  await expect(panel.locator("[data-test-cpanel-item='unavailable-widget']")).toHaveCount(0);
});


test("source Control Panel Programs lists real simulated packages and supports selection/history",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="programs"]').click();
  const programs=panel.locator("[data-test-cpanel-programs]");
  await expect(programs).toBeVisible();
  const notepad=programs.locator('[data-test-cpanel-program="notepad"]');
  await expect(notepad).toBeVisible();
  await expect(programs.locator('[data-test-cpanel-program="cpanel"]')).toHaveCount(0);
  await notepad.getByRole("button",{name:"Notepad"}).click();
  await expect(notepad).toHaveAttribute("aria-selected","true");
  await expect(programs.getByRole("button",{name:"Organize"})).toBeDisabled();
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await panel.locator("[data-test-cpanel-forward]").click();
  await expect(programs).toBeVisible();
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("uninstall");
  await expect(panel.locator('[data-test-cpanel-result="programs"]')).toBeVisible();
});


test("source Control Panel Guest account page disables sign-in edits and switches users safely",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="accounts"]').click();
  const accounts=panel.locator("[data-test-cpanel-accounts]");
  await expect(accounts).toBeVisible();
  await expect(accounts.locator("[data-test-cpanel-guest-account]"))
    .toContainText("Guest account");
  for(const action of ["password","picture","name","link","delete","others"]){
    await expect(accounts.locator('[data-test-account-action="'+action+'"]')).toBeDisabled();
  }
  await accounts.locator('[data-test-account-action="logoff"]').click();
  await expect(page.locator("[data-test-logon-screen]")).toBeVisible();
  await page.locator('[data-test-avatar="win7"]').click();
  // Original source emits changeView({view:"Switch"}), not LOG_OFF.
  // The live Guest Control Panel window survives the switch.
  await expect(win).toBeVisible();
});


test("source taskbar notifications preferences update visible tray and hidden popup",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="notification"]').click();
  const notice=panel.locator("[data-test-cpanel-notification]");
  await expect(notice).toBeVisible();
  for(const id of ["TaskbarActionCenter","TaskbarNetwork","TaskbarBattery","TaskbarVolume"]){
    await expect(page.locator('[data-test-tray-icon="'+id+'"]')).toHaveCount(1);
  }
  const volume=notice.locator('[data-test-cpanel-notification-icon="TaskbarVolume"]');
  await volume.getByRole("combobox").selectOption("hidden");
  await expect(page.locator('[data-test-tray-icon="TaskbarVolume"]')).toHaveCount(0);
  await page.locator('[data-test-tray-hidden-toggle]').click();
  await expect(page.locator('[data-test-tray-hidden-icon="TaskbarVolume"]')).toBeVisible();
  await notice.locator('[data-test-cpanel-always-show]').check();
  await expect(page.locator('[data-test-tray-icon="TaskbarVolume"]')).toHaveCount(1);
  await expect(page.locator("[data-test-tray-hidden-items]")).toHaveCount(0);
  await notice.locator('[data-test-cpanel-system-icons-link]').click();
  await expect(notice.locator('[data-test-cpanel-system-icon="clock"]')).toBeVisible();
  await notice.getByRole("combobox",{name:"Clock system icon"}).selectOption("off");
  await expect(page.locator("[data-test-tray-clock]")).toHaveCount(0);
  await notice.getByRole("combobox",{name:"Clock system icon"}).selectOption("shown");
  await expect(page.locator("[data-test-tray-clock]")).toHaveCount(1);
  await notice.locator('[data-test-cpanel-system-icons-link]').click();
  await notice.locator('[data-test-cpanel-always-show]').uncheck();
  await notice.locator('[data-test-cpanel-restore-tray]').click();
  await expect(volume.getByRole("combobox")).toHaveValue("shown");
  await expect(page.locator('[data-test-tray-icon="TaskbarVolume"]')).toHaveCount(1);
});


test("original Control Panel Action Center shows source empty history, not invented alerts",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="action-center"]').click();
  const action=panel.locator("[data-test-cpanel-action-center]");
  await expect(action).toBeVisible();
  await expect(action).toContainText("Review recent messages and resolve problems");
  await expect(action).toContainText("Action Center has nothing to report.");
  await expect(action.locator("[data-test-no-messages]")).toHaveText("No messages");
  await expect(action.locator("[data-test-cpanel-action-message]")).toHaveCount(0);
  await expect(action.getByRole("button",{name:"Change Action Center settings"})).toBeDisabled();
  await expect(action.getByRole("button",{name:"View archived messages"})).toBeDisabled();
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
  await panel.getByRole("searchbox",{name:"Search Control Panel"}).fill("action");
  await expect(panel.locator('[data-test-cpanel-result="action-center"]')).toBeVisible();
});


test("original Backup and Restore downloads a ZIP and restores a removed Guest file without overwrite",async({page})=>{
  await page.goto("/");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  const desktop="/EXTERNAL/computer/drive0/Users/Guest/Desktop";
  const area=page.locator("#desktop-icons");
  await area.click({button:"right",position:{x:295,y:290}});
  const menu=page.locator("[data-test-desktop-menu]");
  await menu.getByRole("menuitem",{name:/^New/}).click();
  await menu.getByRole("menuitem",{name:"Text Document",exact:true}).click();
  await page.locator("[data-test-desktop-rename]").fill("Backup Sample");
  await page.locator("[data-test-desktop-rename]").press("Enter");
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Backup Sample.txt"]'))
    .toBeVisible();

  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-cpanel]").click();
  const panel=page.locator('[data-test-window="cpanel"] [data-test-cpanel]');
  await panel.locator('[data-test-cpanel-item="backup"]').click();
  await expect(panel.locator("[data-test-no-backup]"))
    .toHaveText("No backup has been created.");
  for(const name of ["Create a system image","Create a system repair disc"])
    await expect(panel.getByRole("button",{name})).toBeDisabled();
  const downloadEvent=page.waitForEvent("download");
  await panel.locator("[data-test-backup-button]").click();
  const download=await downloadEvent;
  expect(download.suggestedFilename()).toMatch(/^win7simu-backup-\d+\.zip$/);
  const archive=await import("node:fs/promises").then(async fs=>
    fs.readFile(await download.path()));
  await expect(panel.locator('[data-test-backup-status="success"]'))
    .toContainText("A backup of your files has been created.");
  await expect(panel.locator("[data-test-last-backup]"))
    .toContainText("Downloaded to your device");

  // Simulate a Guest file lost between backup and restore.
  await page.evaluate(path=>{
    const key="windows-os:vfs:guest:v1";
    const snapshot=JSON.parse(localStorage.getItem(key)!) as {
      entries:{uri:string}[]
    };
    snapshot.entries=snapshot.entries.filter(entry=>entry.uri!==path);
    localStorage.setItem(key,JSON.stringify(snapshot));
  },desktop+"/Backup Sample.txt");
  await page.reload();
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Backup Sample.txt"]'))
    .toHaveCount(0);
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator("[data-test-open-cpanel]").click();
  const reopened=page.locator('[data-test-window="cpanel"] [data-test-cpanel]');
  await reopened.locator('[data-test-cpanel-item="backup"]').click();
  await expect(reopened.locator("[data-test-last-backup]")).toBeVisible();
  const upload=reopened.locator("[data-test-restore-upload]");
  await upload.setInputFiles({
    name:"backup.zip",mimeType:"application/zip",buffer:archive
  });
  await expect(reopened.locator('[data-test-backup-status="success"]'))
    .toContainText(/1 restored, \d+ skipped/);
  await expect(page.locator('[data-test-desktop-file="'+desktop+'/Backup Sample.txt"]'))
    .toBeVisible();
  await upload.setInputFiles({
    name:"backup.zip",mimeType:"application/zip",buffer:archive
  });
  await expect(reopened.locator('[data-test-backup-status="success"]'))
    .toContainText(/0 restored, \d+ skipped/);
  await reopened.locator("[data-test-cpanel-back]").click();
  await expect(reopened.locator("[data-test-cpanel-items]")).toBeVisible();
  await reopened.getByRole("searchbox",{name:"Search Control Panel"}).fill("restore");
  await expect(reopened.locator('[data-test-cpanel-result="backup"]')).toBeVisible();
});

test("Backup and Restore rejects a fake archive instead of changing Guest files",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  await panel.locator('[data-test-cpanel-item="backup"]').click();
  await panel.locator("[data-test-restore-upload]").setInputFiles({
    name:"fake.zip",mimeType:"application/zip",buffer:Buffer.from("not a zip")
  });
  await expect(panel.locator('[data-test-backup-status="error"]'))
    .toContainText("Invalid backup file");
});

test("pinned source Control Panel root exposes 24 tile targets without fake host settings",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  const ids=[
    "data","datetime","default","storage","display","action-center","backup",
    "access","gadgets","keyboard","mouse","notification","personalize",
    "power","programs","region","sound","speech","sync","system","taskbar",
    "accounts","defender","update"
  ];
  await expect(panel.locator('[data-test-source-listview="tiles"]')).toBeVisible();
  const tiles=panel.locator("[data-test-cpanel-item]");
  await expect(tiles).toHaveCount(ids.length);
  expect(await tiles.evaluateAll(nodes=>nodes.map(node=>
    node.getAttribute("data-test-cpanel-item")))).toEqual(ids);
  await expect(panel.locator(".windows-cpanel__home h2"))
    .toHaveText("Adjust your device's settings");
  await expect(panel.locator('[data-test-cpanel-item="backup"] img'))
    .toHaveAttribute("src",/backup\.5e4eb80c\.webp/);
  await expect(panel.locator('[data-test-cpanel-item="action-center"] img'))
    .toHaveAttribute("src",/action-center-headline\.27cc6d83\.webp/);
  for(const id of ["defender","update","data","taskbar","gadgets"]){
    await expect(panel.locator('[data-test-cpanel-item="'+id+'"]'))
      .toBeDisabled();
  }
  for(const id of ["display","accounts","programs","notification","action-center","backup"]){
    await expect(panel.locator('[data-test-cpanel-item="'+id+'"]'))
      .toBeEnabled();
  }
});

test("original Control Panel indexed tasks route only migrated destinations",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  const search=panel.getByRole("searchbox",{name:"Search Control Panel"});
  await search.fill("spyware");
  await expect(panel.locator('[data-test-cpanel-result="defender"]'))
    .toBeVisible();
  await expect(panel.locator('[data-test-cpanel-result="defender"] .windows-cpanel__link'))
    .toBeDisabled();
  await expect(panel.locator('[data-test-cpanel-result="defender"] .windows-cpanel__task'))
    .toBeDisabled();
  await search.fill("customize icons");
  const taskbar=panel.locator('[data-test-cpanel-result="taskbar"]');
  await expect(taskbar).toBeVisible();
  await expect(taskbar.locator(".windows-cpanel__link")).toBeDisabled();
  await taskbar.getByRole("button",{name:"Customize icons on the taskbar"}).click();
  await expect(panel.locator("[data-test-cpanel-notification]")).toBeVisible();
  await panel.locator("[data-test-cpanel-back]").click();
  await expect(panel.locator("[data-test-cpanel-items]")).toBeVisible();
});

test("source 5985 search supports quoted phrases and filter-only home behavior",async({page})=>{
  const win=await openControlPanel(page);
  const panel=win.locator("[data-test-cpanel]");
  const search=panel.getByRole("searchbox",{name:"Search Control Panel"});
  await search.fill('"screen resolution"');
  await expect(panel.locator('[data-test-cpanel-result="display"]'))
    .toBeVisible();
  await expect(panel.locator('[data-test-cpanel-result="display"]'))
    .toContainText("Adjust screen resolution");
  await search.fill('kind:"screen resolution"');
  await expect(panel.locator('[data-test-cpanel-items]')).toBeVisible();
  await expect(panel.locator('[data-test-cpanel-results]')).toHaveCount(0);
  await search.fill("recovery kind:zip");
  await expect(panel.locator('[data-test-cpanel-result="backup"]'))
    .toBeVisible();
  await panel.locator('[data-test-cpanel-result="backup"]')
    .getByRole("button",{name:"Backup and Restore"}).click();
  await expect(panel.locator('[data-test-cpanel-backup]')).toBeVisible();
});
