module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType:'module'
  },
  plugins: [
    'vue',
    'prettier'
  ],
  rules: {
    'semi': 'off',
    'prettier/prettier': 'error',
    // 在这里添加或覆盖ESLint规则
    'no-console': process.env.NODE_ENV === 'production'? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production'? 'warn' : 'off'
  }
};
