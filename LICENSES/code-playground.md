# Programming tools third-party notices

The programming tools are adapted from the local SimpleCode project. The website includes every SimpleCode runtime. Chrome and VS Code extensions retain only JS/TS, SQLite, Lua, Shell, and Java.

## Application and UI

- Runno `@runno/wasi` — MIT.
- Monaco Editor, xterm, Vue, reka-ui, MiniSearch, Sucrase, markdown-it, gray-matter, and Shiki retain their package licenses.
- Sucrase is loaded only for TypeScript type stripping; it does not type-check.

## WASI runtimes

| Component | License |
| --- | --- |
| CPython 3.11.3 (VMware WebAssembly Language Runtimes) | PSF License |
| Ruby 3.2.0 | Ruby License / BSD-2-Clause |
| PHP 8.2.0 CGI | PHP License 3.01 |
| wasmedge-quickjs | Apache-2.0; QuickJS itself is MIT |
| SQLite 3 | Public Domain |
| clang / wasm-ld (binji wasm-clang, LLVM 8) | Apache-2.0 with LLVM exceptions |
| Lua 5.4.9 | MIT |
| Go / Yaegi 0.16.1 | Go BSD-3-Clause; Yaegi Apache-2.0 |
| wasi-sh | MIT |

The WASM binaries also link wasi-libc and related wasi-sdk runtime code (MIT, BSD, and Apache-2.0 with LLVM exceptions). Source pins and hashes are in `public/offline/code/manifest.json`, `src/tools/code-playground/core/java-lock.json`, and `src/tools/code-playground/core/rust-lock.json`.

Lua copyright: Copyright (C) 1994-2026 Lua.org, PUC-Rio. wasi-sh copyright: Copyright (c) 2026 SimpleCode contributors. Both are distributed under MIT:

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Go runtime and standard library copyright: Copyright (c) 2009 The Go Authors. Redistribution and use in source and binary forms, with or without modification, are permitted provided that the copyright notice, conditions, and disclaimer are retained; neither the name of Google Inc. nor contributors' names may be used to endorse derived products without specific prior written permission. The software is provided "AS IS", without warranties or liability, under BSD-3-Clause.

## Rust

- weblings — MIT.
- rustc and `rustc_codegen_cranelift` — MIT OR Apache-2.0.
- `browser_wasi_shim` — Apache-2.0 OR MIT.
- The pinned `artifacts-test-7` compiler and WASI sysroot are loaded only from the same-origin `offline/code/rust/` files.

## DeepLearning

- Pyodide 314.0.7 — Mozilla Public License 2.0; includes CPython 3.14.2.
- NumPy 2.4.6 — BSD-3-Clause.
- Fashion-MNIST — MIT, Copyright (c) 2017 Zalando SE.
- `pyodide/minitorch.py` is original SimpleCode teaching code, MIT.

## Java

| Component | License |
| --- | --- |
| TeaVM 0.16.0 | Apache-2.0 |
| TeaVM javac / OpenJDK compiler classes | GPL-2.0 with Classpath Exception |
| TeaVM class library portions | Apache-2.0, Joda-Time Apache-2.0, jzlib BSD-style |

The four TeaVM files are pinned and served from the same-origin `offline/code/java/` directory. TeaVM bridge sources retain the SimpleCode MIT license.

## Linux guest

- v86 0.5.471 (`libv86.mjs`, `v86.wasm`) — BSD-2-Clause; see `licenses/v86-BSD-2-Clause.txt`.
- SeaBIOS and VGA BIOS — SeaBIOS is LGPL-2.1.
- Linux 6.8.12 guest kernel — GPL-2.0.
- Buildroot 2024.05.2 and BusyBox 1.36.1 userspace — GPL-2.0.

The prebuilt guest uses the pinned v86 Buildroot image. Browser code loads only same-origin files; no upstream demo host is a runtime dependency.

## Tutorials

Tutorial text is CC BY-SA 4.0 and sample code is MIT. See `src/tools/code-playground/content/LICENSE` and `content/sources.yaml`.
