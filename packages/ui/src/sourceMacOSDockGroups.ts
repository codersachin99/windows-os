/** Original dock-macos.js groups() at frozen legacy-win7@26b9f0c.
 * React windows use stable appId rather than parsing source instance IDs.
 * Deduplicate fixed shortcuts even if the persisted pin list includes them. */
export function sourceMacOSDockGroups(
  pinned:readonly string[],recent:readonly string[],running:readonly string[]
):readonly (readonly string[])[]{
  const fixed=new Set(["computer","launchpad","cpanel","bin"]);
  const pins=[...new Set(pinned)].filter(id=>!fixed.has(id));
  const first=["computer","launchpad",...pins,"cpanel"];
  const excluded=new Set([...first,"bin"]);
  const second=[...new Set([...recent.slice(0,3),...running])]
    .filter(id=>!excluded.has(id));
  return [first,second,["bin"]];
}
