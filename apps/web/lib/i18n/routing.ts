export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
// Renamed from "planme-locale" (GUI-470) so language choices saved before English became the default are reset once.
export const localeCookieName = "planme-locale-v2";
export function isLocale(value: string): value is Locale {
  return value === "ko" || value === "en";
}
export function localizedPath(path: string, locale: Locale) {
  const pathname = path.replace(/^\/(ko|en)(?=\/|$)/, "");
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}
