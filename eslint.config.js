import { configApp } from '@adonisjs/eslint-config'

export default configApp({
  files: ['tests/**/*.ts'],
  rules: {
    // Em testes é comum encadear `(await client.get(...)).text()`
    '@unicorn/no-await-expression-member': 'off',
  },
})
