import globals from 'globals'

// 引入 TypeScript ESLint 插件及其解析器
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import vuePlugin from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import prettier from 'eslint-plugin-prettier'

export default [
  // 2. TypeScript 专用规则
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // 指向你的 tsconfig.json
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // 自定义 TypeScript 规则示例
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型
      '@typescript-eslint/no-this-alias': 'off', // 允许使用 this 别名
    },
  },
  // 配置vue规则
  ...vuePlugin.configs['flat/essential'].map((config) => ({
    ...config,
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-this-alias': 'off', // 允许使用 this 别名
    },
  })),

  // 5. 全局忽略目录
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      'coverage/',
      '*.config.js',
      '*.config.mjs',
      '*/**/tmp.js',
      '*/**/dist/',
      '面试一/',
      '面试二/',
      '奇技淫巧/',
      '东方财富/',
      'apps/ts-webpack-web/',
    ],
  },
]
