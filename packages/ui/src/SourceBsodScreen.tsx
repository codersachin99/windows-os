import type {KeyboardEvent} from "react";
import "./sourceBsod.css";

export interface SourceBsodScreenProps{
  code:string;
  onRestart():void;
}
/** Pinned legacy src/modules/shell/bsod.js 6812/c8f9: the Win7
 * full-screen BSOD for shell changeView({view:"Bsod", error:"DUMMY_BSOD"}).
 * A click restarts the simulator, not the real operating system. */
export function SourceBsodScreen({code,onRestart}:SourceBsodScreenProps){
  const keydown=(event:KeyboardEvent<HTMLElement>)=>{
    if(event.key==="Enter"||event.key===" "){
      event.preventDefault();
      onRestart();
    }
  };
  return <main data-test-bsod-screen="" className="bsod__screen is-win7 windows-source-bsod"
    role="button" tabIndex={0} aria-label="Blue Screen of Death — restart WindowsOS"
    onClick={onRestart} onKeyDown={keydown}>
    <div>A problem has been detected and Windows has been shut down to prevent damage to your device.</div>
    <div>ERROR_{code}</div>
    <div>If this is the first time you've seen this Stop error screen, restart the app. If this screen appears again, follow these steps:</div>
    <div>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any Windows updates you might need.</div>
    <div>If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing. IF you need to use Safe Mode to remove or disable components, restart your device, press F8 to select Advanced Startup options, and then select Safe Mode.</div>
    <div>Technical information:</div>
    <div>*** STOP: 0x000000000 (0x000000000, 0x000000000, 0x000000000)</div>
    <div>Contact your system administrator or technical support group for further assistance.</div>
  </main>;
}
