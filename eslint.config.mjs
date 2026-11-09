import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.turbo/**", "**/.next/**", "mockup/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // Браузерный код SPA (apps/web)
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // Node-код: API, бот, пакеты
  {
    files: ["apps/api/**/*.ts", "apps/bot/**/*.ts", "packages/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  // Отключает правила стиля, конфликтующие с Prettier (должен быть последним)
  prettier,
);
