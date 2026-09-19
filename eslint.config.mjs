import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "off",
      // All persistence goes through src/helpers/storage.ts so it can move to a backend later.
      "no-restricted-globals": [
        "error",
        { name: "localStorage", message: "Use src/helpers/storage.ts instead." },
        { name: "sessionStorage", message: "Use src/helpers/storage.ts instead." },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "window",
          property: "localStorage",
          message: "Use src/helpers/storage.ts instead.",
        },
        {
          object: "globalThis",
          property: "localStorage",
          message: "Use src/helpers/storage.ts instead.",
        },
      ],
    },
  },
  {
    files: ["src/helpers/storage.ts"],
    rules: { "no-restricted-globals": "off", "no-restricted-properties": "off" },
  },
  {
    files: ["scripts/**"],
    rules: { "no-console": "off" },
  },
  // Turns off stylistic rules that would fight Prettier; keep it last.
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
