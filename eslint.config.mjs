import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    // Цвет живёт только в app/globals.css. Всё остальное берёт его оттуда —
    // классами Tailwind (bg-brand, text-content-tertiary) или через lib/tokens.
    files: ["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "constants/**/*.ts"],
    ignores: ["app/globals.css", "lib/tokens.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b/]",
          message:
            "Hex-цвет в компоненте. Используйте токен: класс Tailwind (bg-brand, text-content-tertiary) или token.* из @/lib/tokens.",
        },
        {
          selector: "TemplateElement[value.raw=/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b/]",
          message:
            "Hex-цвет в шаблонной строке. Подставьте token.* из @/lib/tokens.",
        },
      ],
    },
  },
  {
    rules: {
      "@next/next/no-img-element": "warn",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/refs": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
