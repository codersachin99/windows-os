import { normalizeFileUri } from "@windows-os/filesystem";

export interface DesktopPointerPoint {
  x: number;
  y: number;
}
export interface ExplorerDropTarget {
  directory: string;
  element: HTMLElement;
}

/**
 * Desktop uses the original source's pointer drag for shortcut positioning,
 * while migrated Explorer handles native HTML drag events. Detect the
 * *topmost* visible Explorer directory under a pointer to bridge the two
 * without ever treating an obscured folder or another app as a drop target.
 *
 * A path read from the DOM never authorizes a host filesystem operation:
 * FileDragSession.drop -> transferFiles still validates the destination and
 * every source against the mounted Guest VirtualFileStore.
 */
export function explorerDropTargetAt(
  point: DesktopPointerPoint,
  surface: Pick<Document, "elementFromPoint"> = document
): ExplorerDropTarget | null {
  const top = surface.elementFromPoint(point.x, point.y);
  if (!top || !top.closest('[data-test-window="computer"]')
    || !top.closest(".explorer-content")) return null;
  const element = top.closest<HTMLElement>("[data-windows-os-drop-directory]");
  const candidate = element?.dataset.windowsOsDropDirectory;
  if (!element || !candidate?.startsWith("/")) return null;
  try {
    const directory = normalizeFileUri(candidate);
    return { directory, element };
  } catch {
    return null;
  }
}
