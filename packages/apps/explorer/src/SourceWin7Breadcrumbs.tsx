import type { LegacyPathConfig } from "@windows-os/filesystem";

/** Clickable components of original Computer.getLocation(path) from
 * legacy-win7@4e63290/src/modules/apps/computer.js.
 * Every path is a mounted virtual URI, never an absolute host path.
 */
export interface SourceBreadcrumb {
  label: string;
  /** Source window-addressbar accepts location entries as strings for search
   * results, and as objects with click handlers for filesystem breadcrumbs. */
  path: string | null;
}

function displaySegment(segment: string): string {
  // Source uses decodeURI for visible folder labels. Keep raw URI in
  // navigation targets, and do not crash on a malformed percent sequence.
  try { return decodeURI(segment); } catch { return segment; }
}

export function sourceComputerBreadcrumbs(
  path: string,
  config?: Pick<LegacyPathConfig, "root" | "drives"> | null,
  trashPath?: string | null
): SourceBreadcrumb[] {
  const root = config?.root ?? "/";
  const computer: SourceBreadcrumb = {
    label: "Computer", path: path === "/" ? "/" : root
  };
  if (trashPath && (path === trashPath || path.startsWith(trashPath + "/"))) {
    // Original getLocation replaces the entire path with one Bin crumb.
    return [{ label: "Recycle Bin", path: trashPath }];
  }
  if (path === "/" || path === root || !config) return [computer];

  const drive = config.drives.find(drive => {
    const diskPath = root.replace(/\/$/, "") + "/" + drive.path;
    return path === diskPath || path.startsWith(diskPath + "/");
  });
  if (!drive) return [computer];

  const diskPath = root.replace(/\/$/, "") + "/" + drive.path;
  const diskLabel = (drive.label ? drive.label + " " : "") + "(" + drive.letter + ":)";
  const result: SourceBreadcrumb[] = [
    computer,
    { label: diskLabel, path: diskPath }
  ];
  const segments = path.slice(diskPath.length).split("/").filter(Boolean);
  let current = diskPath;
  for (const segment of segments) {
    current += "/" + segment;
    result.push({ label: displaySegment(segment), path: current });
  }
  return result;
}

export interface SourceWin7BreadcrumbsProps {
  items: readonly SourceBreadcrumb[];
  icon: string;
  onNavigate: (path: string) => void;
}

/**
 * Source `3b99` window-addressbar and `bd65` AddressbarItem from
 * legacy-win7/shared~bin~bsod~camera~chrome~computer~cpanel~games~ie~
 * notepad~paint~personalize~player~recorder~sni~17da8929.js.
 *
 * Source icon is a 24px button with an 18px image. Each item has a
 * breadcrumb button and its own 16px "Show sibling folders" disclosure.
 * Neither icon nor disclosure has a click handler in the original; preserve
 * that fact rather than inventing an unimplemented sibling-folder menu.
 *
 * The hidden readonly Folder address input belongs only to the migration's
 * ExplorerApp testing contract and is not rendered as a source text editor.
 */
export function SourceWin7Breadcrumbs({
  items, icon, onNavigate
}: SourceWin7BreadcrumbsProps) {
  return <nav className="explorer-address__source-crumbs"
    aria-label="Folder path">
    <button className="explorer-address__source-root-icon" type="button"
      tabIndex={-1} aria-label="Folder icon">
      <img className="explorer-address__source-icon" src={icon} alt="" />
    </button>
    {items.map((item, index) =>
      <span className="explorer-address__source-item"
        key={item.path ?? "static-" + index}>
        {item.path === null
          ? <span className="explorer-address__source-crumb explorer-address__source-static"
              aria-current="location">
              <span className="explorer-address__source-crumb-text">{item.label}</span>
            </span>
          : <button type="button"
              className="explorer-address__source-crumb"
              aria-current={index === items.length - 1 ? "location" : undefined}
              title={item.label}
              onClick={() => onNavigate(item.path!)}>
              <span className="explorer-address__source-crumb-text">{item.label}</span>
            </button>}
        <button type="button" className="explorer-address__source-dropdown"
          aria-label="Show sibling folders" title="Show sibling folders"
          tabIndex={-1}>
          <span className="explorer-address__source-disclosure" aria-hidden="true" />
        </button>
      </span>)}
  </nav>;
}
