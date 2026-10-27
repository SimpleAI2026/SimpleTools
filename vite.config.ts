import { cpSync, existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * pdf.js needs CMaps (CJK text) and standard font data at runtime. They are copied from
 * node_modules into public/pdfjs so they are served offline and fetched only when a PDF needs them.
 * pdf.js' optional WASM decoders are intentionally NOT shipped: it falls back to its JS decoders.
 */
function pdfjsAssets() {
  return {
    name: 'pdfjs-assets',
    buildStart() {
      for (const dir of ['cmaps', 'standard_fonts']) {
        const to = fileURLToPath(new URL(`./public/pdfjs/${dir}`, import.meta.url))
        if (!existsSync(to)) cpSync(fileURLToPath(new URL(`./node_modules/pdfjs-dist/${dir}`, import.meta.url)), to, { recursive: true })
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [vue(), tailwindcss(), pdfjsAssets()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    fs: { deny: ['**/thirdparty/**'] },
  },
})
