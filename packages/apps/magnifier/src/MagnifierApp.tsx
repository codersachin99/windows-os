import { useEffect, useState } from "react";
import { legacyArt } from "@windows-os/assets";
import {
  MAGNIFIER_STEP, sourceMagnifierChangeScale, sourceMagnifierPercent
} from "./model";
import "./MagnifierApp.css";

export interface MagnifierAppProps {
  onScaleChange(scale: number): void;
}

/** The source's compact 260px non-resizable Magnifier controls. The desktop
 * shell owns the magnified canvas; the toolbar stays usable at 16x zoom.
 * Source Views/Settings/Help buttons are explicitly disabled in the original.
 */
export function MagnifierApp({ onScaleChange }: MagnifierAppProps) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    onScaleChange(1);
    return () => onScaleChange(1);
  }, [onScaleChange]);

  const changeScale = (delta: number) => {
    const next = sourceMagnifierChangeScale(scale, delta);
    if (next === scale) return;
    setScale(next);
    onScaleChange(next);
  };
  return <div className="windows-magnifier" data-test-magnifier="">
    <div className="windows-magnifier__zoom">
      <button type="button" className="windows-magnifier__command"
        aria-label="Zoom out" title="Zoom out"
        data-test-magnifier-minus=""
        onClick={() => changeScale(-MAGNIFIER_STEP)}>−</button>
      <button type="button" className="windows-magnifier__command"
        aria-label="Zoom in" title="Zoom in"
        data-test-magnifier-plus=""
        onClick={() => changeScale(MAGNIFIER_STEP)}>+</button>
    </div>
    <output className="magnifier__scale windows-magnifier__scale"
      aria-label="Magnification" data-test-magnifier-scale="">
      {sourceMagnifierPercent(scale)}
    </output>
    <button type="button" className="magnifier__views windows-magnifier__views"
      disabled title="Views unavailable in the original source">Views</button>
    <button type="button" className="magnifier__settings windows-magnifier__settings"
      aria-label="Settings" disabled title="Settings unavailable in the original source">⚙</button>
    <button type="button" className="magnifier__help windows-magnifier__help"
      aria-label="Help" disabled title="Help unavailable in the original source">
      <img src={legacyArt.magnifierHelp} alt="" draggable={false}/>
    </button>
  </div>;
}
