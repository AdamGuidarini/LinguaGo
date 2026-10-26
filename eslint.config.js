// @ts-check
import { defineConfig } from "eslint/config";
import stylistic from '@stylistic/eslint-plugin'
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      '@stylistic': stylistic
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/prefer-inject": ["off"],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'always'],
      '@typescript-eslint/no-empty-function': ['error', { allow: ['constructors'] }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/array-bracket-newline': ['error', { 'multiline': true }],
      '@stylistic/curly-newline': [
        'error',
        {
          IfStatementConsequent: 'always',
          IfStatementAlternative: 'always',
          ForStatement: 'always',
          ForInStatement: 'always',
          WhileStatement: 'always',
          DoWhileStatement: 'always',
          SwitchStatement: 'always',
          SwitchCase: 'always',
          TryStatementBlock: 'always',
          TryStatementHandler: 'always',
          TryStatementFinalizer: 'always',
          BlockStatement: { minElements: 1 },
          ArrowFunctionExpression: { minElements: 1 },
          FunctionDeclaration: { minElements: 1 },
          FunctionExpression: { minElements: 1 },
          Property: { 'multiline': true },
          ClassBody: { minElements: 1 },
          StaticBlock: { minElements: 1 },
          WithStatement: 'always',
          TSModuleBlock: 'always',
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
