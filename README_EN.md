# SimpleTools

[English](./README_EN.md) | [中文](./README.md)

A developer toolbox in the browser: formats, encoding, text, images, PDFs, office files, and programming practice split by language. Ordinary calculations stay in the browser.

- Try it: https://simpletools-kappa.vercel.app/
- Chrome Web Store: https://chromewebstore.google.com/detail/simpletools/fkokpmlmjopflpadegcjnhbelolaihgl
- Source: https://github.com/SimpleAI2026/SimpleTools

![Home](./docs/screenshots/1.png)

The website and the Chrome / VS Code extensions share one interface. The website lists every registered tool; the extensions keep only JavaScript, TypeScript, SQLite, Lua, Shell, and Java in the programming category. Ordinary tools handle what you paste or select, and do not upload it to an application server. Larger files such as ImageMagick, Tesseract, PDFium, FFmpeg, anydoc, and the code runtimes download from this site the first time you use them. Agent calls an API only after you save the endpoint and key you chose; the key stays on the device. The Chrome extension has no host permission, so a direct cloud API call from the extension may fail — use the website for that.

![SimpleTools](./public/samples/simpletools.png)

## Screenshots

![Screenshot 1](./docs/screenshots/1.png)

![Screenshot 2](./docs/screenshots/2.png)

![Screenshot 3](./docs/screenshots/3.png)

## Features

- **200 tools on the web, 190 in the extensions** (counted from the `src/registry` registry; the extensions keep 6 programming languages)
- **8 UI languages**: 简体中文, English, 日本語, 한국어, Deutsch, Français, Español, Português (Brasil), with persisted locale and light/dark theme
- **Registry-driven** search, categories, favorites, recent tools, and per-tool code splitting
- **No application backend**: files are processed in the browser; WASM engines (ImageMagick, Tesseract, PDFium, FFmpeg, anydoc, code runtimes) download from this site on demand, not with the first page load
- **Mobile-friendly**: responsive layout down to 390px
- Stack: Vue 3, Vite, TypeScript, Tailwind CSS 4, shadcn-vue (reka-ui), vue-i18n, Pinia, Yarn 4
- **Agent (BYOK, experimental):** in-app `/agent` OpenAI-compatible chat with your own key + HostTools; keys stay on-device. The Chrome extension has no host permissions yet, so direct cloud API calls may fail (prefer the web build).

## Categories

| Category | Web | Extension | Examples |
|---|---:|---:|---|
| Developer | 40 | 40 | JSON format / diff / to TS, YAML, regex + cheatsheet, JWT, formatters, cron parser + crontab builder, docker run → Compose, UA parser, MIME, keycodes, meta tags, Git cheatsheet, math evaluator, CIDR / IPv4 ranges, MAC vendor lookup, device info |
| Programming | 15 | 6 | One page per language: editor, run / stop, terminal, quick start; extensions keep JavaScript, TypeScript, SQLite, Lua, Shell, Java |
| AI / Agent | 9 | 9 | Local BYOK agent, token counter, API cost estimator, prompt linter / redactor / injection scan, MCP & tool defs, agent instructions |
| Encode & Decode | 19 | 19 | Base64 (text / files), Base32, URL, hash, HMAC, bcrypt, AES, RSA key pairs, TOTP / HOTP, BIP-39, password strength, basic auth |
| Generate | 11 | 11 | Password, UUID, ULID, QR, Lorem, random values, MAC addresses, IPv6 ULA, random ports |
| Convert | 17 | 16 | Timestamp, case styles, colors, CSV↔JSON, JSON↔YAML / XML, TOML↔JSON / YAML, units |
| Text | 21 | 21 | Word count, diff, notepad, line tools + list converter, WYSIWYG HTML, ASCII art, emoji, NATO alphabet, email normalizer, Safelink decoder |
| Image | 14 | 14 | ID photos (local face detection + background replacement + print sheets), resize, edit, filters, format convert, split, ImageMagick, OCR, SVG placeholders, design helpers |
| Audio & video | 3 | 3 | FFmpeg, subtitle toolkit, video delivery preflight |
| PDF | 28 | 28 | Rotate, crop, watermark, page numbers, encrypt, redact, compare, edit, signature info, PDFium preview, convert to/from Office, images, text |
| Office | 20 | 20 | Excel / Word / PPT view, convert, merge, create; local document to Markdown; percentage, ETA, IBAN, phone parser, stopwatch, benchmarks |
| Compress | 3 | 3 | gzip, image compress, PDF compress |
| **Total** | **200** | **190** | |

> Folders under `src/tools` that are not registered are hidden from the home page. README counts follow the registry. The camera recorder lives in the Image category.

## Quick start

Requires **Node.js ≥ 20** and Yarn 4 via Corepack. These commands describe how to build and preview the static site locally.

```bash
corepack enable
corepack yarn install
./build.sh dev          # Dev server (default http://127.0.0.1:5173)
./build.sh build        # Typecheck + production build → dist/
./build.sh preview      # Preview an existing dist/ (default http://127.0.0.1:4173)
./build.sh lint         # ESLint + vue-tsc
./build.sh test         # Vitest
```

`./build.sh build` writes the website files. It does not include the full programming-runtime binaries. The website uses history routing, so a static host has to rewrite unknown paths to `index.html`. `./build.sh preview` already does that. The build publishes the committed catalog `src/tools/code-playground/core/runtime-manifest.json` and checks binaries that are already present. If a listed file is missing from `public/offline/code`, this build does not read a sibling `../SimpleCode`, and that language cannot actually run yet.

To fill in the website programming runtimes, a read-only sibling `../SimpleCode` has to already be on the machine. Then run:

```bash
node scripts/code-playground-assets.mjs --sync
```

That copies the WASM and other large files and refreshes the catalog. The repository does not ship those binaries, and a normal build does not depend on that directory. Chrome and VS Code packaging is in the next section. Each `./build.sh chrome` or `./build.sh vscode` also bumps the version by 0.0.1.

Yarn scripts work too: `yarn dev` / `yarn build` / `yarn preview` / `yarn lint` / `yarn test`. Feedback and suggestions: [CONTRIBUTING.md](./CONTRIBUTING.md).

## Layout

```
SimpleTools/
├── build.sh            # dev | build | preview | lint | test | chrome | vscode
├── chrome-extension/   # Chrome MV3 packaging + build script
├── vscode-extension/   # VS Code extension host + packaging
├── docs/               # README screenshots and docs assets
├── plan/               # Implementation plans and research notes
├── public/             # Static assets (favicon, samples, offline/ runtimes)
├── scripts/            # Version, locale, and code runtime asset scripts
├── src/
│   ├── components/
│   ├── i18n/           # 8 locales
│   ├── pages/
│   ├── registry/       # Tool registry (source of truth for counts)
│   │   └── tools/
│   ├── tools/          # Per-tool implementations
│   └── ...
└── thirdparty/         # Local reference only (gitignored; do not depend on it)
```

## Extensions

- **Chrome users**: install from https://chromewebstore.google.com/detail/simpletools/fkokpmlmjopflpadegcjnhbelolaihgl . From source, `./build.sh chrome` writes `chrome-extension/dist/`, which Developer mode on `chrome://extensions` can load unpacked (see `chrome-extension/README.md`). The ZIP is the manual path; the store listing is the entry for people installing it.
- **VS Code**: `./build.sh vscode` → `code --install-extension vscode-extension/simpletools-*.vsix`, then **SimpleTools: Open** from the Command Palette (see `vscode-extension/README.md`).
- Extension builds use relative `base: './'` + hash routing; the web build (`./build.sh build`) keeps history routing.
- The web header offers downloads: `./build.sh chrome` / `./build.sh vscode` sync artifacts into `public/downloads/` (`simpletools-chrome.zip`, `simpletools-vscode.vsix`). `./build.sh build` copies them only if already present (no forced extension rebuild).

## Notes

- `thirdparty/` (e.g. it-tools, LiYing references) is for comparison only, **must not be imported** by the app, and is not committed; GPL / AGPL projects are referenced for ideas only, never copied.
- `public/pdfjs/` and the `public/offline/` engines copied from node_modules are prepared by the build and are not committed. `public/offline/anydoc/` is the committed document-to-Markdown engine.
- The code runtime catalog is committed at `src/tools/code-playground/core/runtime-manifest.json`, so normal builds never read `../SimpleCode`. To actually run languages locally, run `node scripts/code-playground-assets.mjs --sync` once to copy WASM from a sibling `../SimpleCode` and refresh the catalog.
- Each `./build.sh chrome` / `./build.sh vscode` bumps the root, Chrome, and VS Code versions together by 0.0.1.

## Distribution

This project may be freely distributed.

Third-party dependencies, and WASM and other components in the programming runtimes, keep their own licenses, attribution, and obligations. The sentence above does not grant distribution rights for those components.
