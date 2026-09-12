/**
 * Токены для JS-контекстов: inline `style`, SVG-атрибуты, серии графиков.
 *
 * Значения — `hsl(var(--…))`, поэтому следуют за темой так же, как классы
 * Tailwind. В разметке предпочитайте классы (`bg-brand`, `text-content-tertiary`);
 * эти константы нужны только там, где класс поставить нельзя.
 *
 * Единственный источник значений — `app/globals.css`.
 */

/** `hsl(var(--name))`, при указании alpha — `hsl(var(--name) / 0.4)`. */
export function color(name: string, alpha?: number): string {
  return alpha === undefined
    ? `hsl(var(--${name}))`
    : `hsl(var(--${name}) / ${alpha})`;
}

export const token = {
  /* ── Поверхности ─────────────────────────────────────────────────────── */
  surface: color("surface"),
  surface1: color("surface-1"),
  surface2: color("surface-2"),
  surface3: color("surface-3"),

  /* ── Текст ───────────────────────────────────────────────────────────── */
  content: color("content"),
  contentSecondary: color("content-secondary"),
  contentTertiary: color("content-tertiary"),
  contentQuaternary: color("content-quaternary"),

  /* ── Разделители ─────────────────────────────────────────────────────── */
  hairline: color("hairline"),
  hairlineStrong: color("hairline-strong"),

  /* ── Brand ─────────────────────────────────────────────────────────────
     brand — акцент на тёмном фоне (текст, иконки, активное состояние).
     brandFill — заливка под белой подписью: глубже ради контраста. */
  brand: color("brand"),
  brandFill: color("brand-fill"),
  brandHover: color("brand-hover"),
  brandPressed: color("brand-pressed"),
  brandOn: color("brand-on"),
  brand200: color("brand-200"),
  brand300: color("brand-300"),
  brand400: color("brand-400"),
  brand600: color("brand-600"),
  brand700: color("brand-700"),
  brand950: color("brand-950"),

  /* ── Marine ──────────────────────────────────────────────────────────── */
  marine: color("marine"),
  marine500: color("marine-500"),
  marine700: color("marine-700"),
  marine800: color("marine-800"),

  /* ── Статусы ─────────────────────────────────────────────────────────── */
  success: color("success"),
  success300: color("success-300"),
  success400: color("success-400"),
  success600: color("success-600"),
  warning: color("warning"),
  warning400: color("warning-400"),
  warning600: color("warning-600"),
  danger: color("destructive"),
  danger400: color("danger-400"),
  danger700: color("danger-700"),
  danger800: color("danger-800"),
  info: color("info"),
  info400: color("info-400"),

  /* ── Серии графиков ──────────────────────────────────────────────────── */
  chart1: color("chart-1"),
  chart2: color("chart-2"),
  chart3: color("chart-3"),
  chart4: color("chart-4"),
  chart5: color("chart-5"),
  chart6: color("chart-6"),

  white: "#FFFFFF",
} as const;

/** Палитра для многосерийных графиков — порядок задаёт очередь цветов. */
export const CHART_SERIES = [
  token.chart1,
  token.chart2,
  token.chart3,
  token.chart4,
  token.chart5,
  token.chart6,
] as const;
