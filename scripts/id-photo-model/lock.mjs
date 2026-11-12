#!/usr/bin/env node
// Verify (default) or rewrite (--write) assets/models/id-photo/models.lock.json.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../..', import.meta.url))
const dir = join(root, 'assets/models/id-photo')
const lockPath = join(dir, 'models.lock.json')
const lock = JSON.parse(readFileSync(lockPath, 'utf8'))
const files = []
const walk = (d) => {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (p !== lockPath && !e.name.endsWith('.md')) files.push(relative(dir, p).split('\\').join('/'))
  }
}
walk(dir)
files.sort()
const actual = Object.fromEntries(files.map((f) => {
  const bytes = readFileSync(join(dir, f))
  return [f, { bytes: statSync(join(dir, f)).size, sha256: createHash('sha256').update(bytes).digest('hex') }]
}))
if (process.argv.includes('--write')) {
  lock.files = actual
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
  console.log(`Wrote ${files.length} entries to models.lock.json`)
} else {
  const bad = files.filter((f) => lock.files?.[f]?.sha256 !== actual[f].sha256)
  const missing = Object.keys(lock.files ?? {}).filter((f) => !actual[f])
  if (bad.length || missing.length) {
    console.error('id-photo model lock mismatch:', { bad, missing })
    process.exit(1)
  }
  console.log(`id-photo models OK (${files.length} files)`)
}
