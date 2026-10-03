// scripts/seo-meta.mjs(제목 단일 출처)를 src에서 타입과 함께 쓰기 위한 선언
export const SITE_BRAND: string;
export const APP_NAME: string;
export function normalizeTitle(rawTitle: string | null | undefined): string;
export const FUEL_ISSUERS: Readonly<
  Record<string, { label: string; cardIds: readonly string[]; cards: readonly string[] }>
>;
export const OVERSEAS_LABELS: Readonly<Record<string, string>>;
export const ISSUER_SIMULATION_AMOUNTS: readonly number[];
export function pageTitleFor(route: string): string | undefined;
export function pageTitle(route: string): string;
export function fuelIssuerDescription(slug: string): string | undefined;
export const MILEAGE_DESCRIPTION: string;
