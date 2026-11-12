import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { docsPlugin } from './scripts/code-playground/vite-plugin-docs'
import tailwindcss from '@tailwindcss/vite'
import { ID_PHOTO_BUDGET_BYTES, ID_PHOTO_WASM } from './src/tools/id-photo/assets'

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

      // ID photo: single-thread tfjs wasm + committed models (always refreshed so model updates land)
      const idphoto = join(root, 'public/offline/idphoto')
      for (const f of ID_PHOTO_WASM) {
        copyIfMissing(join(root, 'node_modules/@tensorflow/tfjs-backend-wasm/dist', f), join(idphoto, 'tfjs', f))
      }
      for (const dir of ['blazeface-short', 'hivision-modnet-q8']) {
        cpSync(join(root, 'assets/models/id-photo', dir), join(idphoto, 'models', dir), { recursive: true, force: true })
      }
    },
  }
}

/** Fail the build when the ID photo tool (models + wasm + its JS chunks incl. tfjs) exceeds its 10 MB budget. */
function idPhotoSizeGuard() {
  return {
    name: 'id-photo-size-guard',
    apply: 'build' as const,
    writeBundle(options: { dir?: string }, bundle: Record<string, { type: string; modules?: Record<string, { renderedLength: number }> }>) {
      if (!options.dir) return
      const owned = /[\\/]src[\\/]tools[\\/]id-photo[\\/]|[\\/]node_modules[\\/]@tensorflow(-models)?[\\/]|[\\/]node_modules[\\/](long|seedrandom)[\\/]/
      let js = 0
      for (const out of Object.values(bundle)) {
        if (out.type !== 'chunk' || !out.modules) continue
        for (const [id, m] of Object.entries(out.modules)) if (owned.test(id)) js += m.renderedLength
      }
      let files = 0
      const walk = (dir: string) => {
        if (!existsSync(dir)) return
        for (const e of readdirSync(dir, { withFileTypes: true })) {
          const p = join(dir, e.name)
          if (e.isDirectory()) walk(p)
          else files += readFileSync(p).byteLength
        }
      }
      walk(join(options.dir, 'offline', 'idphoto'))
      const sample = join(options.dir, 'samples', 'portrait.jpg')
      if (existsSync(sample)) files += readFileSync(sample).byteLength
      const total = js + files
      const mb = (n: number) => (n / 1e6).toFixed(2)
      console.log(`[id-photo] added size ${mb(total)} MB (assets ${mb(files)} MB + JS ${mb(js)} MB before minify), budget ${mb(ID_PHOTO_BUDGET_BYTES)} MB`)
      if (total > ID_PHOTO_BUDGET_BYTES) throw new Error(`id-photo exceeds its size budget: ${total} > ${ID_PHOTO_BUDGET_BYTES} bytes`)
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

function stripWebOnlyCode() {
  return {
    name: 'strip-web-only-code',
    resolveId(source: string) {
      if (!isExt || !['./web-runtime', '@/tools/code-playground/core/web-runtime'].includes(source)) return
      return fileURLToPath(new URL('./src/tools/code-playground/core/web-runtime.extension.ts', import.meta.url))
    },
    writeBundle(options: { dir?: string }, bundle: Record<string, { type: string; code?: string }>) {
      if (!isExt || !options.dir) return
      const forbiddenSlugs = ['code-python', 'code-ruby', 'code-c', 'code-cpp', 'code-php', 'code-go', 'code-rust', 'code-linux', 'code-deeplearning']
      const forbiddenRuntimeCode = ['browser_wasi_shim', 'pyodide.asm', 'serial0-output-byte', 'CLIF2WASM_OBJECT']
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk' || !output.code) continue
        for (const slug of forbiddenSlugs) {
          if (['"', "'", '`'].some((quote) => output.code?.includes(`${quote}${slug}${quote}`))) {
            throw new Error(`Website-only programming route in extension bundle: ${slug}`)
          }
        }
        for (const marker of forbiddenRuntimeCode) {
          if (output.code.includes(marker)) throw new Error(`Website-only runtime in extension bundle: ${marker}`)
        }
      }
      const codeDir = join(options.dir, 'offline', 'code')
      const manifestPath = join(codeDir, 'runtime-manifest.json')
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        assets: Record<string, { file: string }>
        languages: Array<{ id: string; assets?: string[]; prepare?: Array<{ asset?: string; baseFS?: string }>; run: { asset?: string; baseFS?: string } }>
      }
      const retained = new Set(['quickjs', 'sqlite', 'lua', 'shell', 'java'])
      manifest.languages = manifest.languages.filter((lang) => retained.has(lang.id))
      const ids = new Set<string>()
      for (const lang of manifest.languages) {
        for (const id of lang.assets ?? []) ids.add(id)
        for (const command of [...(lang.prepare ?? []), lang.run]) {
          if (command.asset) ids.add(command.asset)
          if (command.baseFS) ids.add(command.baseFS)
        }
      }
      manifest.assets = Object.fromEntries(Object.entries(manifest.assets).filter(([id]) => ids.has(id)))
      const keep = new Set([
        ...Object.values(manifest.assets).map((asset) => asset.file),
        'java/compiler.wasm',
        'java/compiler.wasm-runtime.js',
        'java/compile-classlib-teavm.bin',
        'java/runtime-classlib-teavm.bin',
      ])
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const path = join(dir, entry.name)
          if (entry.isDirectory()) {
            walk(path)
            if (readdirSync(path).length === 0) rmSync(path, { recursive: true })
            continue
          }
          const name = path.slice(codeDir.length + 1).split('\\').join('/')
          const notice = name === 'runtime-manifest.json' || name.startsWith('licenses/') || ['THIRD_PARTY.md', 'TUTORIALS-LICENSE.txt', 'sources.yaml'].includes(name)
          if (!keep.has(name) && !notice) rmSync(path)
        }
      }
      walk(codeDir)
      writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    },
  }
}

function codeAssets() {
  return {
    name: 'code-assets',
    buildStart() {
      execFileSync(process.execPath, ['scripts/code-playground-assets.mjs'], { cwd: root, stdio: 'inherit' })
    },
  }
}

export default defineConfig({
  base: isExt ? './' : '/',
  plugins: [
    vue(),
    tailwindcss(),
    codeAssets(),
    docsPlugin({ extension: isExt }),
    offlineAssets(),
    stripOfflinePandoc(),
    stripWebOnlyCode(),
    idPhotoSizeGuard(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // id-photo uses only the TF.js runtime of @tensorflow-models/face-detection; never bundle MediaPipe's solution.
      '@mediapipe/face_detection': fileURLToPath(new URL('./src/tools/id-photo/mediapipe-stub.ts', import.meta.url)),
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
      // tesseract.js is CommonJS-only (main: src/index.js): it must be pre-bundled, or dev serves raw CJS
      // and `import { createWorker }` fails. Its worker/core/lang paths are passed explicitly (offline/ocr).
      '@ffmpeg/ffmpeg',
      '@ffmpeg/util',
    ],
  },
  worker: { format: 'es' },
  // Compile-time flag so registry can dead-code-eliminate the pandoc dynamic import.
  define: {
    'import.meta.env.VITE_ENABLE_PANDOC': JSON.stringify(enablePandoc ? 'true' : 'false'),
    'import.meta.env.VITE_ENABLE_ALL_CODE_RUNTIMES': JSON.stringify(isExt ? 'false' : 'true'),
  },
  build: {
    outDir,
    emptyOutDir: true,
  },
  server: {
    fs: { deny: ['**/thirdparty/**'] },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  },
  preview: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  },
})
