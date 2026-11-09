import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

const root = fileURLToPath(new URL('.', import.meta.url))

/** chrome | vscode → relative base + dedicated outDir; default remains web (/ → dist/). */
const target = process.env.VITE_TARGET ?? ''
const isExt = target === 'chrome' || target === 'vscode'
/** Pandoc tool + offline wasm: web only. Extensions set VITE_ENABLE_PANDOC=false (or any target chrome|vscode). */
const enablePandoc =
  process.env.VITE_ENABLE_PANDOC !== undefined
    ? process.env.VITE_ENABLE_PANDOC !== 'false'
    : !isExt
const outDir =
  target === 'chrome' ? 'chrome-extension/dist' : target === 'vscode' ? 'vscode-extension/media' : 'dist'

function copyIfMissing(from: string, to: string) {
  if (!existsSync(from)) return
  mkdirSync(dirname(to), { recursive: true })
  if (!existsSync(to)) cpSync(from, to)
}

/**
 * pdf.js needs CMaps (CJK text) and standard font data at runtime. They are copied from
 * node_modules into public/pdfjs so they are served offline and fetched only when a PDF needs them.
 * pdf.js' optional WASM decoders are intentionally NOT shipped: it falls back to its JS decoders.
 *
 * Also copies large offline WASM / OCR / FFmpeg assets (ImageMagick, PDFium, Pandoc, Tesseract, FFmpeg) into
 * public/offline/ so tools never hit a CDN at runtime. Pandoc is skipped for chrome/vscode.
 */
function offlineAssets() {
  return {
    name: 'offline-assets',
    buildStart() {
      for (const dir of ['cmaps', 'standard_fonts']) {
        const to = join(root, `public/pdfjs/${dir}`)
        if (!existsSync(to)) cpSync(join(root, `node_modules/pdfjs-dist/${dir}`), to, { recursive: true })
      }

      // ImageMagick (x86 build used by initializeImageMagick)
      copyIfMissing(
        join(root, 'node_modules/@imagemagick/magick-wasm/dist/x86/magick.wasm'),
        join(root, 'public/offline/magick/magick.wasm'),
      )

      // PDFium
      copyIfMissing(
        join(root, 'node_modules/@hyzyla/pdfium/dist/pdfium.wasm'),
        join(root, 'public/offline/pdfium/pdfium.wasm'),
      )

      // Pandoc (web only — chrome/vscode omit the ~56MB wasm)
      if (enablePandoc) {
        copyIfMissing(
          join(root, 'node_modules/pandoc-wasm/src/pandoc.wasm'),
          join(root, 'public/offline/pandoc/pandoc.wasm'),
        )
      }

      // Tesseract worker + LSTM cores (wasm.js wrappers load sibling .wasm)
      const ocr = join(root, 'public/offline/ocr')
      copyIfMissing(join(root, 'node_modules/tesseract.js/dist/worker.min.js'), join(ocr, 'worker.min.js'))
      for (const base of [
        'tesseract-core-lstm',
        'tesseract-core-simd-lstm',
        'tesseract-core-relaxedsimd-lstm',
      ]) {
        copyIfMissing(join(root, `node_modules/tesseract.js-core/${base}.wasm.js`), join(ocr, `${base}.wasm.js`))
        copyIfMissing(join(root, `node_modules/tesseract.js-core/${base}.wasm`), join(ocr, `${base}.wasm`))
      }
      // Compact LSTM language packs (eng + chi_sim)
      for (const lang of ['eng', 'chi_sim']) {
        copyIfMissing(
          join(root, `node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`),
          join(ocr, 'traineddata', `${lang}.traineddata.gz`),
        )
      }

      // FFmpeg single-thread core (no COOP/COEP required) — kept in extensions but fetched lazily
      const ffmpeg = join(root, 'public/offline/ffmpeg')
      copyIfMissing(join(root, 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js'), join(ffmpeg, 'ffmpeg-core.js'))
      copyIfMissing(join(root, 'node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm'), join(ffmpeg, 'ffmpeg-core.wasm'))
    },
  }
}

/** Strip offline/pandoc from extension outDir even if it already exists under public/. */
function stripOfflinePandoc() {
  return {
    name: 'strip-offline-pandoc',
    apply: 'build' as const,
    writeBundle(options: { dir?: string }) {
      if (enablePandoc) return
      const dir = options.dir
      if (!dir) return
      const pandocDir = join(dir, 'offline', 'pandoc')
      if (existsSync(pandocDir)) rmSync(pandocDir, { recursive: true, force: true })
    },
  }
}

export default defineConfig({
  base: isExt ? './' : '/',
  plugins: [vue(), tailwindcss(), offlineAssets(), stripOfflinePandoc()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Deep import of pandoc-wasm core (not in package exports) to feed vendored wasm bytes.
      ...(enablePandoc
        ? {
            'pandoc-wasm-core': fileURLToPath(
              new URL('./node_modules/pandoc-wasm/src/core.js', import.meta.url),
            ),
          }
        : {}),
    },
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: [
      ...(enablePandoc ? (['pandoc-wasm'] as const) : []),
      '@imagemagick/magick-wasm',
      '@hyzyla/pdfium',
      'tesseract.js',
      '@ffmpeg/ffmpeg',
      '@ffmpeg/util',
    ],
  },
  worker: { format: 'es' },
  // Compile-time flag so registry can dead-code-eliminate the pandoc dynamic import.
  define: {
    'import.meta.env.VITE_ENABLE_PANDOC': JSON.stringify(enablePandoc ? 'true' : 'false'),
  },
  build: {
    outDir,
    emptyOutDir: true,
  },
  server: {
    fs: { deny: ['**/thirdparty/**'] },
  },
})
