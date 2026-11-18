import { useEffect } from "react";
import {sourceThemeScreens,type ThemeId} from "@windows-os/contracts";
import { legacyArt } from "@windows-os/assets";

export interface BootScreenProps {
  onComplete: () => void;
  theme?:ThemeId;
}

export function BootScreen({ onComplete,theme="win7" }: BootScreenProps) {
  const sourceBoot=sourceThemeScreens(theme).boot;
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="windows-boot" data-test-boot-screen aria-label="Windows is starting"
      data-source-theme-id={theme} data-source-boot-theme={sourceBoot}
      data-source-boot-renderer={sourceBoot==="win7"?"win7":"win7-fallback"}>
      <div className="windows-boot__centre">
        <img src={legacyArt.win7Brand} alt="" width={56} height={56} />
        <div className="windows-boot__title">Starting Windows</div>
        <div className="windows-boot__progress" aria-hidden="true"><span /></div>
      </div>
      <p className="windows-boot__copyright">WindowsOS</p>
    </main>
  );
}
