# anydoc WASM

`document-to-markdown` converts documents with the prebuilt browser build of [firecrawl/anydoc](https://github.com/firecrawl/anydoc) v0.2.5, commit `6feb6c2aedd69b97fa8af112ffeb187dcf79986e`. The source is the git submodule `vendor/anydoc`. The files under `public/offline/anydoc/` are the `wasm-pack build --release --target web` output of `vendor/anydoc/wasm` and are served from the same origin.

## anydoc

anydoc and anydoc-wasm are MIT, Copyright (c) 2026 Sideguide Technologies Inc.

```text
MIT License

Copyright (c) 2026 Sideguide Technologies Inc.

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

## Notable dependencies

| Crate | License chosen for this build |
| --- | --- |
| pdf-inspector 1.14.2 | MIT |
| encoding_rs 0.8.35 | Apache-2.0 OR MIT, and BSD-3-Clause |
| unicode-ident 1.0.24 | MIT OR Apache-2.0, and Unicode-3.0 |

## wasm32 dependency review

Reviewed with Rust 1.88.0 from `vendor/anydoc`:

```bash
cargo tree --target wasm32-unknown-unknown -p anydoc-wasm -e normal --format "{p} ({l})"
```

Every crate on that graph is under a permissive license: MIT, Apache-2.0, BSD-3-Clause, Zlib, 0BSD, Unlicense, MIT-0, CC0-1.0, BSL-1.0 (Boost), or Unicode-3.0, including dual-license `OR` combinations. No GPL, AGPL, SSPL, or BUSL crate appears.

Where a crate offers a choice, this distribution elects a permissive alternative already in that expression:

- `ryu` 1.0.23 is Apache-2.0 OR BSL-1.0; Apache-2.0 is selected.
- `csv`, `csv-core`, `memchr`, and `aho-corasick` are Unlicense OR MIT; MIT is selected.
- `constant_time_eq` is CC0-1.0 OR MIT-0 OR Apache-2.0; Apache-2.0 is selected.
- `adler2` is 0BSD OR MIT OR Apache-2.0; MIT is selected.
- `unicode-ident` keeps both MIT OR Apache-2.0 and Unicode-3.0, which the Unicode license requires.

`r-efi` is not in the wasm32 normal dependency graph, so no extra MIT / Apache-2.0 election is required for it. Host-only proc-macro crates (`syn`, `quote`, `wasm-bindgen-macro`, and similar) appear in the graph because the bindings depend on them at compile time. They are MIT OR Apache-2.0 and are not linked into `anydoc_wasm_bg.wasm`.
