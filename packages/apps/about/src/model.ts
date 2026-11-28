/** Original pinned About app src/modules/apps/about.js:
 * links are read from window.APP_CONFIG.getUrl(name), not hardcoded.
 * When configuration is absent, the source returns "#"; our strict browser
 * adapter represents those as unavailable instead of a fake destination.
 */
export const ABOUT_LINK_KEYS = ["url","privacyUrl","changelogUrl","reportIssue","creditsUrl"] as const;
export type AboutLinkKey = typeof ABOUT_LINK_KEYS[number];
export interface AboutUrlConfig { getUrl(name: string): unknown }
export type AboutLinks = Record<AboutLinkKey,string|null>;

export function safeAboutUrl(raw: unknown): string|null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const url=new URL(raw);
    // Do not allow javascript:, local files, relative # links, mixed-content
    // redirects, embedded credentials or invented marketing/support URLs.
    return url.protocol==="https:" && url.hostname && !url.username && !url.password
      ? url.href : null;
  } catch { return null; }
}
export function readSourceAboutLinks(config?: AboutUrlConfig | null):AboutLinks {
  const source = config === undefined && typeof window !== "undefined"
    ? (window as Window & {APP_CONFIG?:AboutUrlConfig}).APP_CONFIG
    : config;
  const result={} as AboutLinks;
  for(const key of ABOUT_LINK_KEYS) {
    try {result[key]=safeAboutUrl(source?.getUrl(key));}
    catch {result[key]=null;}
  }
  return result;
}
