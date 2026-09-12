/** @type {import('tailwindcss').Config} */

/**
 * Все значения ниже читаются из CSS-переменных `app/globals.css`.
 * Литеральных цветов, радиусов и теней в конфиге быть не должно —
 * иначе появляется второй источник правды.
 */

/** hsl(var(--x)) с поддержкой суффикса прозрачности: `bg-brand/20`. */
const token = (name) => `hsl(var(--${name}) / <alpha-value>)`;

/** Шкала вида { 50: ..., 100: ... } из списка ступеней. */
const ramp = (name, steps) =>
  Object.fromEntries(steps.map((s) => [s, token(`${name}-${s}`)]));

module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        "sf-pro": [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Helvetica Neue"',
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        "4pt-xs": "4px",
        "4pt-sm": "8px",
        "4pt-md": "12px",
        "4pt-lg": "16px",
        "4pt-xl": "20px",
        "4pt-xxl": "24px",
        "4pt-huge": "32px",
        "4pt-giant": "48px",
      },
      colors: {
        /* ── Семантика поверхностей ─────────────────────────────────────── */
        surface: {
          DEFAULT: token("surface"),
          1: token("surface-1"),
          2: token("surface-2"),
          3: token("surface-3"),
        },
        /* ── Семантика текста ───────────────────────────────────────────── */
        content: {
          DEFAULT: token("content"),
          secondary: token("content-secondary"),
          tertiary: token("content-tertiary"),
          quaternary: token("content-quaternary"),
        },
        /* ── Разделители ────────────────────────────────────────────────── */
        hairline: {
          DEFAULT: token("hairline"),
          strong: token("hairline-strong"),
        },

        /* ── Brand ──────────────────────────────────────────────────────── */
        brand: {
          DEFAULT: token("brand"),
          /** Заливка под белым текстом — глубже акцента ради контраста. */
          fill: token("brand-fill"),
          hover: token("brand-hover"),
          pressed: token("brand-pressed"),
          on: token("brand-on"),
          foreground: token("brand-on"),
          ...ramp("brand", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        },
        /* ── Marine — второй акцент ─────────────────────────────────────── */
        marine: {
          DEFAULT: token("marine"),
          on: token("marine-on"),
          ...ramp("marine", [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        },

        /* ── Статусы ────────────────────────────────────────────────────── */
        success: {
          DEFAULT: token("success"),
          ...ramp("success", [300, 400, 500, 600]),
        },
        warning: {
          DEFAULT: token("warning"),
          ...ramp("warning", [300, 400, 500, 600]),
        },
        danger: {
          DEFAULT: token("destructive"),
          ...ramp("danger", [300, 400, 500, 600, 700, 800]),
        },
        info: {
          DEFAULT: token("info"),
          ...ramp("info", [300, 400, 500, 600]),
        },
        chart: ramp("chart", [1, 2, 3, 4, 5, 6]),

        /* ── shadcn/ui ──────────────────────────────────────────────────── */
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        background: token("background"),
        foreground: token("foreground"),
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
        },
        secondary: {
          DEFAULT: token("secondary"),
          foreground: token("secondary-foreground"),
        },
        destructive: {
          DEFAULT: token("destructive"),
          foreground: token("destructive-foreground"),
        },
        muted: {
          DEFAULT: token("muted"),
          foreground: token("muted-foreground"),
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
        },
        popover: {
          DEFAULT: token("popover"),
          foreground: token("popover-foreground"),
        },
        card: {
          DEFAULT: token("card"),
          foreground: token("card-foreground"),
        },

      },

      borderRadius: {
        xs: "var(--radius-xs)",
        "4pt-xs": "var(--radius-xs)",
        "4pt-sm": "var(--radius-sm)",
        "4pt-md": "var(--radius-lg)",
        "4pt-lg": "var(--radius-xl)",
        "4pt-xl": "var(--radius-2xl)",
        "4pt-pill": "9999px",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },

      boxShadow: {
        "elev-1": "var(--elevation-1)",
        "elev-2": "var(--elevation-2)",
        "elev-3": "var(--elevation-3)",
        "elev-4": "var(--elevation-4)",
      },

      /* Материал плавающего шасси — §12 */
      backdropBlur: {
        material: "var(--material-blur)",
      },
      backdropSaturate: {
        material: "var(--material-saturate)",
      },

      transitionDuration: {
        press: "var(--duration-press)",
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        "token-out": "var(--ease-out)",
        "token-in": "var(--ease-in)",
        "token-in-out": "var(--ease-in-out)",
      },

      /*
       * Трекинг и интерлиньяж зависят от кегля — §15.
       *
       * Крупный текст с нулевым трекингом расползается: буквы кажутся стоящими
       * слишком далеко друг от друга, чем крупнее кегль, тем сильнее. Мелкому,
       * наоборот, нужен небольшой положительный трекинг, иначе он слипается.
       * Одно значение на все размеры неизбежно неверно где-то.
       *
       * Сами кегли не меняются — только их оптика, поэтому вёрстка не едет.
       */
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        sm: ["0.875rem", { lineHeight: "1.25rem", letterSpacing: "0.006em" }],
        base: ["1rem", { lineHeight: "1.5rem", letterSpacing: "0em" }],
        lg: ["1.125rem", { lineHeight: "1.6rem", letterSpacing: "-0.006em" }],
        xl: ["1.25rem", { lineHeight: "1.6rem", letterSpacing: "-0.011em" }],
        "2xl": ["1.5rem", { lineHeight: "1.85rem", letterSpacing: "-0.016em" }],
        "3xl": ["1.875rem", { lineHeight: "2.15rem", letterSpacing: "-0.019em" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.021em" }],
        "5xl": ["3rem", { lineHeight: "1.06", letterSpacing: "-0.024em" }],
        "6xl": ["3.75rem", { lineHeight: "1.04", letterSpacing: "-0.026em" }],
      },

      letterSpacing: {
        display: "var(--tracking-display)",
        title: "var(--tracking-title)",
        headline: "var(--tracking-headline)",
        body: "var(--tracking-body)",
        footnote: "var(--tracking-footnote)",
        caption: "var(--tracking-caption)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
