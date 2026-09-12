/**
 * Карта тем для JS-контекстов (inline `style`).
 *
 * Значения — токены из `app/globals.css`, поэтому обе схемы указывают на одни
 * и те же переменные: цвет выбирает CSS по классу `.dark` / `[data-theme]`,
 * а не эта таблица. Двухуровневая структура сохранена ради совместимости
 * с `useThemeColor` и RN-паритета.
 */

import { token } from "@/lib/tokens";

export type AppColorScheme = "light" | "dark";

export type MobileThemeColorName =
  | "background"
  | "surface"
  | "surfaceElevated"
  | "surfaceMuted"
  | "cardBackground"
  | "text"
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "border"
  | "primary"
  | "accent"
  | "onPrimary";

const SEMANTIC: Record<MobileThemeColorName, string> = {
  background: token.surface,
  surface: token.surface1,
  surfaceElevated: token.surface2,
  surfaceMuted: token.surface3,
  cardBackground: token.surface2,
  text: token.content,
  textPrimary: token.content,
  textSecondary: token.contentSecondary,
  textMuted: token.contentTertiary,
  border: token.hairline,
  primary: token.brand,
  accent: token.brand,
  onPrimary: token.brandOn,
};

export const MOBILE_COLORS: Record<
  AppColorScheme,
  Record<MobileThemeColorName, string>
> = {
  light: SEMANTIC,
  dark: SEMANTIC,
};

/** Full-screen booking tab gradient — same in light and dark (RN parity). */
export const MOBILE_BOOKING_GRADIENT = `linear-gradient(180deg, ${token.brand} 0%, ${token.brand950} 100%)`;

/** Bottom of booking gradient — underlay below absolute BottomNav. */
export const BOOKING_TAB_SCENE_UNDERLAY = token.brand950;

export const COLOR_SCHEME_STORAGE_KEY = "workflow-color-scheme";

/** RN ThemedView page background — use on mobile shells where tokens may be overridden. */
export const MOBILE_PAGE_BACKGROUND = {
  dark: SEMANTIC.background,
  light: SEMANTIC.background,
} as const;
