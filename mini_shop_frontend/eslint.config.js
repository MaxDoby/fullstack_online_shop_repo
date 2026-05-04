import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

const compat = new FlatCompat({
	baseDirectory: import.meta.dirname,
	recommendedConfig: js.configs.recommended,
});

export default [
	{
		ignores: ['dist', '.vercel', 'node_modules', 'eslint.config.js', 'vite.config.ts'],
	},

	js.configs.recommended,

	...compat.extends('airbnb'),

	{
		files: ['src/**/*.{ts,tsx}'],

		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parser: tsParser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},

		plugins: {
			'@typescript-eslint': tsPlugin,
			react: reactPlugin,
			'react-hooks': reactHooks,
			'jsx-a11y': jsxA11y,
			import: importPlugin,
		},

		settings: {
			react: {
				version: 'detect',
			},
			'import/resolver': {
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
		},

		rules: {
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			'linebreak-style': 'off',
			indent: [
				'error',
				'tab',
				{
					SwitchCase: 1,
					ignoredNodes: [
						'JSXElement',
						'JSXElement *',
						'JSXAttribute',
						'JSXIdentifier',
						'JSXNamespacedName',
						'JSXMemberExpression',
						'JSXSpreadAttribute',
						'JSXExpressionContainer',
						'JSXOpeningElement',
						'JSXClosingElement',
						'JSXFragment',
						'JSXOpeningFragment',
						'JSXClosingFragment',
						'JSXText',
					],
				},
			],
			'no-tabs': 'off',
			'react/jsx-indent': ['error', 'tab'],
			'react/jsx-indent-props': ['error', 'tab'],
			'react/react-in-jsx-scope': 'off',
			'react/jsx-uses-react': 'off',
			'react/function-component-definition': [
				'error',
				{
					namedComponents: 'arrow-function',
					unnamedComponents: 'arrow-function',
				},
			],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'react/require-default-props': 'off',
			'react/jsx-filename-extension': [
				'warn',
				{
					extensions: ['.tsx'],
				},
			],
			'import/extensions': 'off',
			'import/no-unresolved': 'off',
			'import/prefer-default-export': 'off',
			'react/jsx-one-expression-per-line': 'off',
			'react/jsx-props-no-spreading': 'off',
			'react/jsx-closing-bracket-location': 'off',
			'react/jsx-first-prop-new-line': 'off',
			'react/jsx-max-props-per-line': 'off',
			'jsx-a11y/click-events-have-key-events': 'error',
			'jsx-a11y/no-static-element-interactions': 'error',
			'react/button-has-type': 'error',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
			'max-len': [
				'warn',
				{
					code: 120,
					ignoreComments: true,
					ignoreStrings: true,
					ignoreTemplateLiterals: true,
				},
			],
		},
	},
];
