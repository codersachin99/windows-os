import {createHash} from "node:crypto";
import {expect,test} from "@playwright/test";

/** Every imported source WebP must be served unchanged to the browser. */
const sourceArt=[
  ["camera.5e0b513d.webp","db662ea103b74fd7d903f7910383c07d93b824ae"],
  ["recorder.519283f8.webp","6786220f1572dc510ba2d277fdeef2ce1044973e"],
  ["photo.db6c5f81.webp","2cf46c14634e2a284c3749042775e537a7887d58"],
  ["ie.66b8418d.webp","c587b0afe72cf508af2ecf438174416f36bc45bc"],
  ["chrome.0eddc17a.webp","6134df93f5f9037bc2ed99e3fb0ee78ebf79e145"],
  ["snipping.2c25345c.webp","3f83537a4a0503a10941fed592eb1cba4b3540c0"],
  ["player.d45d301d.webp","3355030754e1019e19b0169f16070f45752e45c7"],
  ["warning.cce1fd36.webp","6bd336aa3a9ba01a4ab2879180a0ba8f5b0301aa"],
  ["error.026cae2a.webp","2a64837b8281a49be0cf491f18727f8978fd0323"]
] as const;
test("nine exact original Win7 WebPs load with immutable source Git blob hashes",async({page})=>{
  await page.goto("/?theme=win7");
  for(const [filename,originalSha] of sourceArt){
    const response=await page.request.get("/assets/images/"+filename);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/webp");
    const buffer=await response.body();
    expect(buffer.toString("ascii",0,4)).toBe("RIFF");
    expect(buffer.toString("ascii",8,12)).toBe("WEBP");
    const sha=createHash("sha1").update("blob "+buffer.length+"\0").update(buffer).digest("hex");
    expect(sha).toBe(originalSha);
  }
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  for(const [id,filename] of [
    ["camera","camera.5e0b513d.webp"],["recorder","recorder.519283f8.webp"],
    ["ie","ie.66b8418d.webp"],["chrome","chrome.0eddc17a.webp"],
    ["snipping","snipping.2c25345c.webp"],["player","player.d45d301d.webp"]
  ]){
    const image=page.locator('[data-test-program="'+id+'"] img');
    await expect(image).toHaveAttribute("src","/assets/images/"+filename);
    await expect(image).toHaveJSProperty("complete",true);
    await expect.poll(()=>image.evaluate((node:HTMLImageElement)=>node.naturalWidth)).toBeGreaterThan(0);
  }
});
