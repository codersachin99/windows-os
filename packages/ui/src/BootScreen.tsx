import {useEffect} from "react";
import {sourceThemeScreens,type ThemeId} from "@windows-os/contracts";
import {legacyArt,sourceBootOriginalArt} from "@windows-os/assets";
import "./sourceBootScreen.css";

export interface BootScreenProps{
  onComplete:()=>void;
  theme?:ThemeId;
}

/** Pinned legacy-win7 boot-win31.js, boot-win9x.js, boot-win-mixed.js,
 * boot-win-x.js. Source defaults skipBoot=true; this only renders if
 * config explicitly enables the original boot phase, never authenticates.
 */
export function BootScreen({onComplete,theme="win7"}:BootScreenProps){
  const sourceBoot=sourceThemeScreens(theme).boot;
  const artwork=sourceBootOriginalArt(sourceBoot);
  // Preserve existing 1800ms bridge until source timing is separately audited.
  useEffect(()=>{
    const timer=window.setTimeout(onComplete,1800);
    return ()=>window.clearTimeout(timer);
  },[onComplete]);
  return <main className="windows-boot"
    data-test-boot-screen="" aria-label="Windows is starting"
    data-source-theme-id={theme}
    data-source-boot-theme={sourceBoot}
    data-source-boot-renderer={artwork?.renderer??(sourceBoot==="win7"?"win7":"win7-fallback")}>
    {artwork?
      artwork.renderer==="win-x"?
        <div className="source-boot__win-x" data-test-boot-theme="winx">
          <img className="source-boot__win-x-logo" src={artwork.src}
            width={100} alt="" draggable={false}/>
          <div className="source-boot__spinner" aria-hidden="true"
            data-test-source-boot-spinner="">
            {Array.from({length:5},(_,i)=>
              <div className="source-boot__spinner-ball" key={i}><span/></div>)}
          </div>
        </div>:
        <img className={"source-boot__image source-boot__image--"+artwork.renderer}
          src={artwork.src} alt="" draggable={false}
          data-test-boot-theme={sourceBoot}/>:
      <>
        <div className="windows-boot__centre">
          <img src={legacyArt.win7Brand} alt="" width={56} height={56}/>
          <div className="windows-boot__title">Starting Windows</div>
          <div className="windows-boot__progress" aria-hidden="true"><span/></div>
        </div>
        <p className="windows-boot__copyright">WindowsOS</p>
      </>
    }
  </main>;
}
