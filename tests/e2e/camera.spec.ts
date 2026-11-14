import { expect, test, type Page } from "@playwright/test";

async function openCamera(page:Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="camera"]').click();
  const camera=page.locator('[data-test-window="camera"]');
  await expect(camera).toBeVisible();
  return camera;
}

test("source Camera requests 1280x720, switches facing, saves a real JPEG and opens it in Photo Viewer",async({page})=>{
  await page.addInitScript(()=>{
    const registry=window as typeof window & {
      __cameraRequests?:Array<MediaStreamConstraints>;
      __cameraTracks?:MediaStreamTrack[];
    };
    registry.__cameraRequests=[];
    registry.__cameraTracks=[];
    Object.defineProperty(navigator,"mediaDevices",{
      configurable:true,
      value:{
        getUserMedia:async(constraints:MediaStreamConstraints)=>{
          registry.__cameraRequests!.push(constraints);
          const canvas=document.createElement("canvas");
          canvas.width=8;canvas.height=6;
          const ctx=canvas.getContext("2d");
          if(!ctx)throw new Error("Canvas unavailable in test");
          ctx.fillStyle="#39a8dc";
          ctx.fillRect(0,0,8,6);
          const stream=canvas.captureStream(25);
          registry.__cameraTracks!.push(...stream.getVideoTracks());
          return stream;
        }
      }
    });
  });

  const camera=await openCamera(page);
  await expect(camera.locator('[data-test-camera-video]')).toBeVisible();
  const take=camera.getByRole("button",{name:"Take photo"});
  await expect(take).toBeEnabled({timeout:15000});
  expect(await page.evaluate(()=>(
    (window as typeof window&{__cameraRequests:Array<MediaStreamConstraints>})
      .__cameraRequests[0]
  ))).toEqual({video:{width:1280,height:720,facingMode:"user"}});

  await camera.getByRole("button",{name:"Camera information"}).click();
  const settings=page.getByRole("dialog",{name:"Camera settings"});
  await expect(settings).toBeVisible();
  await expect(settings).toContainText("1280x720");
  await expect(settings).toContainText("JPEG");
  await expect(settings).toContainText("100%");
  await settings.getByRole("button",{name:"OK",exact:true}).click();
  await expect(settings).toHaveCount(0);

  await camera.getByRole("button",{name:"Switch camera"}).click();
  await expect(take).toBeEnabled({timeout:15000});
  await expect.poll(async()=>page.evaluate(()=>(
    (window as typeof window&{__cameraRequests:Array<MediaStreamConstraints>})
      .__cameraRequests.length
  ))).toBe(2);
  const modes=await page.evaluate(()=>{
    const registry=window as typeof window & {
      __cameraRequests:Array<{video:{facingMode:string}}>;
      __cameraTracks:MediaStreamTrack[];
    };
    return {
      facing:registry.__cameraRequests.map(req=>req.video.facingMode),
      stopped:registry.__cameraTracks[0]?.readyState
    };
  });
  expect(modes).toEqual({facing:["user","environment"],stopped:"ended"});

  await take.click();
  const save=page.locator('[data-test-camera-save] [data-test-file-dialog="save"]');
  await expect(save).toBeVisible({timeout:12000});
  await expect(save.getByLabel("Save as type:")).toHaveValue("jpeg");
  await expect(save.getByRole("option",{name:"JPEG file (*.jpeg)",exact:true})).toHaveCount(1);
  await save.getByLabel("File name:").fill("CameraParity");
  await save.getByRole("button",{name:"Save",exact:true}).click();
  await expect(save).toHaveCount(0);

  const saved=await page.evaluate(()=>{
    const raw=localStorage.getItem("windows-os:vfs:guest:v1");
    return raw?JSON.parse(raw) as {entries:Array<{uri:string;bytes?:string}>}:null;
  });
  const image=saved?.entries.find(entry=>entry.uri==="/CameraParity.jpeg");
  expect(image?.bytes).toBeTruthy();
  const jpeg=Buffer.from(image!.bytes!,"base64");
  expect(jpeg[0]).toBe(0xff);
  expect(jpeg[1]).toBe(0xd8);
  expect(jpeg[jpeg.length-2]).toBe(0xff);
  expect(jpeg[jpeg.length-1]).toBe(0xd9);

  await camera.getByRole("button",{name:"Close Camera",exact:true}).click();
  await expect(camera).toHaveCount(0);
  expect(await page.evaluate(()=>(
    (window as typeof window&{__cameraTracks:MediaStreamTrack[]})
      .__cameraTracks.map(track=>track.readyState)
  ))).toEqual(["ended","ended"]);

  await page.locator('[data-test-desktop-icon="computer"]').dblclick();
  const explorer=page.locator('[data-test-window="computer"]');
  const picture=explorer.locator('[data-test-explorer-item="CameraParity.jpeg"]');
  await expect(picture).toBeVisible();
  await picture.dblclick();
  const photo=page.locator('[data-test-window="photo"]');
  await expect(photo).toBeVisible();
  await expect(photo.locator('[data-test-photo-image]'))
    .toHaveAttribute("alt","CameraParity.jpeg");
  await expect(photo.locator('[data-test-photo-image]'))
    .toHaveJSProperty("naturalWidth",8);
});

test("source Camera surfaces denied permission and never creates a saved file",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,"mediaDevices",{configurable:true,value:{
      getUserMedia:async()=>{throw new Error("Camera permission denied for test");}
    }});
  });
  const camera=await openCamera(page);
  const error=camera.getByRole("alertdialog",{name:"Camera error"});
  await expect(error).toContainText("Camera permission denied for test");
  await expect(camera.getByRole("button",{name:"Take photo"})).toBeDisabled();
  await error.getByRole("button",{name:"Close"}).click();
  await expect(error).toHaveCount(0);
  await camera.getByRole("button",{name:"Close Camera",exact:true}).click();
  await expect(camera).toHaveCount(0);
});
