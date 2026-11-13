import type { MouseEventHandler } from "react";

/**
 * Original Win7 theme navigation controls: paired 27px background sprites,
 * normal/hover/active/disabled rows, and horizontally mirrored Forward.
 * History remains owned by ExplorerSession; this component is presentational.
 * The source <window-addressbar> rendered its own buttons inside the nav.
 */
export interface SourceWin7NavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: MouseEventHandler<HTMLButtonElement>;
  onForward: MouseEventHandler<HTMLButtonElement>;
}

export function SourceWin7Navigation({
  canGoBack, canGoForward, onBack, onForward
}: SourceWin7NavigationProps) {
  return <nav className="explorer-address__source-nav" aria-label="Folder history">
    <button type="button" className="explorer-address__source-prev"
      aria-label="Back" title="Back" disabled={!canGoBack} onClick={onBack}>
      <span aria-hidden="true">◀</span>
    </button>
    <button type="button" className="explorer-address__source-next"
      aria-label="Forward" title="Forward" disabled={!canGoForward} onClick={onForward}>
      <span aria-hidden="true">▶</span>
    </button>
  </nav>;
}
