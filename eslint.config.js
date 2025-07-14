import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    rules: {
      // TanStack Query v5 syntax enforcement
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CallExpression[callee.name="useQuery"] > ArrayExpression',
          message: 'TanStack Query v5 requires object syntax. Use { queryKey: [...], queryFn: ... } instead of array syntax.',
        },
        {
          selector: 'CallExpression[callee.name="useMutation"] > ArrayExpression',
          message: 'TanStack Query v5 requires object syntax. Use { mutationFn: ... } instead of array syntax.',
        },
      ],
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // React Refresh rules
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['dist', 'node_modules'],
  }
);
