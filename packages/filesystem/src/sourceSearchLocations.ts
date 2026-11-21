import { getParentDirectory, normalizeFileUri, SOURCE_GUEST_PROFILE, type LegacyVolumeSession } from "./index";

/**
 * Original Computer listSearch (2e2c.b + computer.js): when the query's in=
 * is empty, searchIndex.walk(disks.map(d => d.path)) and never traverse the
 * Computer shell container itself. Only runtime-provided, validated Guest
 * disk metadata can supply roots; an unmounted session means zero roots.
 */
export function sourceMountedSearchRoots(
  volume: LegacyVolumeSession | null
): string[] {
  if (!volume) return [];
  const base = volume.pathConfig.root.replace(/\/$/, "");
  return volume.pathConfig.drives.map(drive =>
    normalizeFileUri(base + "/" + drive.path));
}

/** Source cf89 lookInOptions: Documents, getStats() disks, Computer, and an initial custom scope. */
export function sourceSearchLocations(
  volume: LegacyVolumeSession | null, initialScope = ""
): { value: string; label: string }[] {
  const root = volume?.pathConfig.root ?? "/";
  const locations = [
    { value: SOURCE_GUEST_PROFILE + "/Documents", label: "Documents" },
    ...(volume?.pathConfig.drives.map(drive => ({
      value: root.replace(/\/$/, "") + "/" + drive.path,
      label: (drive.label || "Local Disk") + " (" + drive.letter + ":)"
    })) ?? []),
    { value: "", label: "Computer" }
  ];
  if (initialScope && !locations.some(item => item.value === initialScope)) {
    locations.unshift({ value: initialScope,
      label: initialScope.split("/").pop() || initialScope });
  }
  return locations;
}

/** Source 4cca.getPathFromDisk used by original computer.js.getSearchExtras.
 * Original search extras use the parent URI via 4cca.getParent and convert
 * mounted paths into a drive-letter location, then fall back to that parent
 * URI when no disk matches. Reuse existing strictly rooted disk mapping so
 * a similarly named path outside the mounted drive cannot be spoofed.
 */
export function sourceComputerSearchLocation(
  fileUri:string, volume:LegacyVolumeSession|null
):string{
  const parent=getParentDirectory(fileUri);
  return volume?.toWindowsPath(parent)??parent;
}
