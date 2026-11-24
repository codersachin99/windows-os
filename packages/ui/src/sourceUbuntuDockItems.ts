/** Original dock-ubuntu.js e5fe items(): first three recents, then all
 * open application IDs in window order, preserving insertion order. */
export function sourceUbuntuDockItems(recent:readonly string[],running:readonly string[]):string[]{
  return [...new Set([...recent.slice(0,3),...running])];
}
