import type { MouseEventHandler } from "react";
import type { ThemeId } from "@windows-os/contracts";
import {SourceWin7HistoryNav} from "@windows-os/ui";

/**
 * Original Win7 theme navigation controls: paired 27px background sprites,
 * normal/hover/active/disabled rows, and horizontally mirrored Forward.
 * History remains owned by ExplorerSession; this component is presentational.
 * The source <window-addressbar> rendered its own buttons inside the nav.
 */
/** The pinned Computer.js window-addressbar slot has no Up button in Win7.
 * Other themes' source bars are not yet independently ported, so retain their
 * prior migration-era Up control until checked against each original template.
 */
export function showExplorerUpControl(theme: ThemeId): boolean {
  return theme !== "win7";
}

export interface SourceWin7NavigationProps {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: MouseEventHandler<HTMLButtonElement>;
  onForward: MouseEventHandler<HTMLButtonElement>;
}

export function SourceWin7Navigation({
  canGoBack, canGoForward, onBack, onForward
}: SourceWin7NavigationProps) {
  return <SourceWin7HistoryNav ariaLabel="Folder history"
    canGoBack={canGoBack} canGoForward={canGoForward}
    onBack={onBack} onForward={onForward}/>;
}
