export default [
  // 配置vue规则
  {
    root: true,
    files: ['src/**/*.{vue}'],
    env: {
      browser: true,
      node: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    parser: 'vue-eslint-parser',
    parserOptions: {
      parser: '@typescript-eslint/parser',
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'prettier/prettier': 'warn', // Prettier 格式问题警告
      'vue/multi-word-component-names': 'off', // 允许单词组件名
      '@typescript-eslint/no-explicit-any': 'warn', // any 类型警告
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 未使用变量警告
    },
  },
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
    ],
  },
]
