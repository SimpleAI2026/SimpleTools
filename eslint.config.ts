import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  { ignores: ['dist/**', 'node_modules/**', 'thirdparty/**', 'plan/**', '.yarn/**', 'public/pdfjs/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['**/thirdparty/**', 'thirdparty/**'], message: 'thirdparty 仅作参考，禁止引用。' }] },
      ],
    },
  },
)
