/** Pinned win7 theme window__addressbar-progress overlay. */
export function sourceAddressProgressPercent(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  return Math.round(Math.min(1, Math.max(0, fraction)) * 100);
}

/**
 * The original window-addressbar gets progress=null after searching; unlike
 * a progress widget below the toolbar, this paints inside the location field.
 * Fraction is the 2e2c.b scanned/discovered folders ratio (0..1).
 */
export function SourceAddressProgress({ fraction }: { fraction: number | null }) {
  if (fraction === null) return null;
  const percent = sourceAddressProgressPercent(fraction);
  return <span className="explorer-address__progress" role="progressbar"
    aria-label="Search progress" aria-valuemin={0} aria-valuemax={100}
    aria-valuenow={percent} data-test-address-progress=""
    style={{ width: percent + "%" }} />;
}
