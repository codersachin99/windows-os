/** Original src/modules/apps/magnifier.js sets scale=1 initially and
 * changeScale(±0.5) clamps to 1..16. At scale 1 it removes the desktop's
 * inline transform and transformOrigin; otherwise it zooms around cursor.
 */
export const MAGNIFIER_MIN_SCALE = 1;
export const MAGNIFIER_MAX_SCALE = 16;
export const MAGNIFIER_STEP = 0.5;
export interface MagnifierViewport { width: number; height: number }
export interface MagnifierOrigin { x: number; y: number }

export function sourceMagnifierChangeScale(current: number, delta: number): number {
  return Math.min(MAGNIFIER_MAX_SCALE, Math.max(MAGNIFIER_MIN_SCALE, current + delta));
}
export function sourceMagnifierPercent(scale: number): string {
  return Math.round(100 * scale) + "%";
}
/** Source non-touch pointer origin: cursorX/innerWidth*100, cursorY/innerHeight*100.
 * Touch devices retain the source default 0% 0% transformation origin.
 */
export function sourceMagnifierOrigin(
  clientX: number, clientY: number, viewport: MagnifierViewport, touchDevice = false
): MagnifierOrigin {
  if (touchDevice) return { x: 0, y: 0 };
  return {
    x: viewport.width > 0 ? clientX / viewport.width * 100 : 0,
    y: viewport.height > 0 ? clientY / viewport.height * 100 : 0
  };
}
export function sourceMagnifierTransform(scale: number): string {
  return scale <= MAGNIFIER_MIN_SCALE ? "" : "scale(" + scale + ")";
}
