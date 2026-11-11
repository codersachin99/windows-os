import { useEffect } from "react";
import { legacyArt } from "@windows-os/assets";

export interface BootScreenProps {
  onComplete: () => void;
}

export function BootScreen({ onComplete }: BootScreenProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 1800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="windows-boot" data-test-boot-screen aria-label="Windows is starting">
      <div className="windows-boot__centre">
        <img src={legacyArt.win7Brand} alt="" width={56} height={56} />
        <div className="windows-boot__title">Starting Windows</div>
        <div className="windows-boot__progress" aria-hidden="true"><span /></div>
      </div>
      <p className="windows-boot__copyright">WindowsOS</p>
    </main>
  );
}
