import { expect,test } from "@playwright/test";

/** A deterministic, valid half-second PCM WAV for the mocked recorder stream. */
function validInputWave(): number[] {
  const frames=4000;
  const bytes=Buffer.alloc(44+frames*2);
  bytes.write("RIFF",0,"ascii");
  bytes.writeUInt32LE(bytes.length-8,4);
  bytes.write("WAVE",8,"ascii");
  bytes.write("fmt ",12,"ascii");
  bytes.writeUInt32LE(16,16);
  bytes.writeUInt16LE(1,20);
  bytes.writeUInt16LE(1,22);
  bytes.writeUInt32LE(8000,24);
  bytes.writeUInt32LE(16000,28);
  bytes.writeUInt16LE(2,32);
  bytes.writeUInt16LE(16,34);
  bytes.write("data",36,"ascii");
  bytes.writeUInt32LE(frames*2,40);
  return [...bytes];
}
async function launch(page:import("@playwright/test").Page){
  await page.goto("/?theme=win7");
  await page.locator('[data-test-avatar="win7"]').click({timeout:12000});
  await page.getByRole("button",{name:"Open Start menu"}).click();
  await page.locator('[data-test-program="recorder"]').click();
  const recorder=page.locator('[data-test-window="recorder"]');
  await expect(recorder).toBeVisible();
  return recorder;
}

test("source Sound Recorder uses permissioned microphone, WAV-only Save As and real binary VFS",async({page})=>{
  const audio=validInputWave();
  await page.addInitScript((fixture)=>{
    // Fake only the permissioned microphone and MediaRecorder encoding. Decode,
    // WAV conversion, virtual dialog and file persistence remain real.
    Object.defineProperty(navigator,"mediaDevices",{
      configurable:true,
      value:{getUserMedia:async()=>{
        const context=new AudioContext();
        const oscillator=context.createOscillator();
        const destination=context.createMediaStreamDestination();
        oscillator.connect(destination);
        oscillator.start();
        return destination.stream;
      }}
    });
    class FakeMediaRecorder {
      static isTypeSupported(_type:string){return false;}
      state:"inactive"|"recording"="inactive";
      ondataavailable:((event:{data:Blob})=>void)|null=null;
      onstop:(()=>void)|null=null;
      onerror:(()=>void)|null=null;
      constructor(_stream:MediaStream){}
      start(){this.state="recording";}
      stop(){
        this.state="inactive";
        this.ondataavailable?.({data:new Blob([new Uint8Array(fixture)],{type:"audio/wav"})});
        this.onstop?.();
      }
    }
    Object.defineProperty(window,"MediaRecorder",{configurable:true,value:FakeMediaRecorder});
  },audio);

  const recorder=await launch(page);
  await expect(recorder.getByRole("button",{name:"Start"})).toBeEnabled();
  await expect(recorder.getByLabel("Recording duration")).toHaveText("00:00:00");
  await expect(recorder.getByRole("progressbar",{name:"Microphone level"})).toBeVisible();
  await recorder.getByRole("button",{name:"Start"}).click();
  await expect(recorder.getByRole("button",{name:"Stop"})).toBeVisible();
  await recorder.getByRole("button",{name:"Stop"}).click();

  const save=page.locator('[data-test-recorder-save] [data-test-file-dialog="save"]');
  await expect(save).toBeVisible({timeout:15000});
  await expect(save.getByLabel("Save as type:")).toHaveValue("wav");
  await expect(save.getByRole("option",{name:"Waveform Audio File (*.wav)",exact:true})).toHaveCount(1);
  await save.getByLabel("File name:").fill("RecordedByWindowsOS");
  await save.getByRole("button",{name:"Save",exact:true}).click();
  await expect(save).toHaveCount(0);

  const saved=await page.evaluate(()=>{
    const raw=localStorage.getItem("windows-os:vfs:guest:v1");
    return raw?JSON.parse(raw) as {entries:Array<{uri:string;bytes?:string}>}:null;
  });
  const audioFile=saved?.entries.find(entry=>entry.uri==="/RecordedByWindowsOS.wav");
  expect(audioFile?.bytes).toBeTruthy();
  const decoded=Buffer.from(audioFile!.bytes!,"base64");
  expect(decoded.subarray(0,4).toString("ascii")).toBe("RIFF");
  expect(decoded.subarray(8,12).toString("ascii")).toBe("WAVE");
  expect(decoded.subarray(36,40).toString("ascii")).toBe("data");
  expect(decoded.readUInt32LE(40)).toBe(decoded.length-44);
  await expect(recorder.getByRole("button",{name:"Start"})).toBeEnabled();
  await recorder.getByRole("button",{name:"Close Sound Recorder"}).click();
  await expect(recorder).toHaveCount(0);
});

test("source Sound Recorder denies recording safely when microphone permission is rejected",async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,"mediaDevices",{configurable:true,value:{
      getUserMedia:async()=>{throw new Error("Microphone permission denied for test");}
    }});
  });
  const recorder=await launch(page);
  await recorder.getByRole("button",{name:"Start"}).click();
  const error=recorder.getByRole("alertdialog",{name:"Sound Recorder error"});
  await expect(error).toContainText("Microphone permission denied for test");
  await error.getByRole("button",{name:"Close"}).click();
  await expect(error).toHaveCount(0);
  await expect(recorder.getByRole("button",{name:"Start"})).toBeEnabled();
  await recorder.getByRole("button",{name:"Close Sound Recorder"}).click();
  await expect(recorder).toHaveCount(0);
});
