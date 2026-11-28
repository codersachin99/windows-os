import type {MouseEventHandler} from "react";
import "./sourceWin7HistoryNav.css";

/** Shared original Win7 27px navigation sprite from pinned theme-win7-scss.js.
 * Consumers own their history model; this component only renders source
 * active/hover/disabled state sprites and forwards Back/Forward clicks.
 */
export interface SourceWin7HistoryNavProps {
  canGoBack:boolean;
  canGoForward:boolean;
  onBack:MouseEventHandler<HTMLButtonElement>;
  onForward:MouseEventHandler<HTMLButtonElement>;
  ariaLabel?:string;
  className?:string;
  backTestId?:string;
  forwardTestId?:string;
}
export function SourceWin7HistoryNav({
  canGoBack,canGoForward,onBack,onForward,
  ariaLabel="History",className="",backTestId,forwardTestId
}:SourceWin7HistoryNavProps){
  const backAttrs=backTestId?{[backTestId]:""}:{};
  const forwardAttrs=forwardTestId?{[forwardTestId]:""}:{};
  return <nav className={"source-win7-history explorer-address__source-nav "+className}
    aria-label={ariaLabel}>
    <button type="button"
      className="source-win7-history__back explorer-address__source-prev"
      aria-label="Back" title="Back" disabled={!canGoBack} onClick={onBack}
      {...backAttrs}>
      <span aria-hidden="true">◀</span>
    </button>
    <button type="button"
      className="source-win7-history__forward explorer-address__source-next"
      aria-label="Forward" title="Forward"
      disabled={!canGoForward} onClick={onForward}
      {...forwardAttrs}>
      <span aria-hidden="true">▶</span>
    </button>
  </nav>;
}
