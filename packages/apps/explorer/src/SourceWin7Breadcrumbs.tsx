import type { LegacyPathConfig } from "@windows-os/filesystem";

/** Clickable components of original Computer.getLocation(path) from
 * legacy-win7@4e63290/src/modules/apps/computer.js.
 * Every path is a mounted virtual URI, never an absolute host path.
 */
export interface SourceBreadcrumb {
  label: string;
  path: string;
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
 * Win7 theme's 18px address icon and clickable breadcrumb trail.
 * A sibling readonly input is preserved by ExplorerApp for current
 * keyboard/automation path inspection until editable address mode is ported.
 */
export function SourceWin7Breadcrumbs({
  items, icon, onNavigate
}: SourceWin7BreadcrumbsProps) {
  return <nav className="explorer-address__source-crumbs"
    aria-label="Folder path">
    <img className="explorer-address__source-icon" src={icon} alt="" />
    {items.map((item, index) =>
      <button type="button" key={item.path}
        className="explorer-address__source-crumb"
        aria-current={index === items.length - 1 ? "location" : undefined}
        title={item.label}
        onClick={() => onNavigate(item.path)}>
        <span className="explorer-address__source-crumb-text">{item.label}</span>
        {index < items.length - 1 &&
          <span className="explorer-address__source-crumb-chevron"
            aria-hidden="true">›</span>}
      </button>)}
  </nav>;
}
