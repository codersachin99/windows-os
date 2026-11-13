import { SOURCE_GUEST_PROFILE, type LegacyVolumeSession } from "./index";

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
