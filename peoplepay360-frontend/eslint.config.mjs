import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  {
    rules: {
      // React Compiler's set-state-in-effect rule can't yet distinguish
      // "derive state from props" (its real target) from "fetch from an
      // external API on mount", which is exactly what every data hook in
      // hooks/** does (useEmployees, useUsers, useEmployee, ...). Flagging
      // that pattern here would mean disabling it hook-by-hook instead.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
